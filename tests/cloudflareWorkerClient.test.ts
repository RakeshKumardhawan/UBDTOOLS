import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  normalizeCloudflareWorkerUrl,
  isDashboardLinkNotWorkerUrl
} from '../src/utils/cloudflareWorkerClient';
import worker from '../cloudflare_worker/ubdtools_worker.js';

test('wrangler.jsonc binds UBD_LICENSES KV namespace and points to ubdtools_worker.js', () => {
  const rootCfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'wrangler.jsonc'), 'utf8'));
  assert.equal(rootCfg.name, 'ubdtools');
  assert.equal(rootCfg.main, 'cloudflare_worker/ubdtools_worker.js');
  assert.ok(fs.existsSync(path.join(process.cwd(), rootCfg.main)));
  assert.equal(rootCfg.kv_namespaces[0].binding, 'UBD_LICENSES');
  assert.equal(rootCfg.kv_namespaces[0].id, '253203bf9e8d4b6886e59dc2453ae1a2');
});

function createMockKv() {
  const store = new Map<string, string>();
  return {
    async get(key: string, type?: string) {
      const val = store.get(key);
      if (val === undefined) return null;
      return type === 'json' ? JSON.parse(val) : val;
    },
    async put(key: string, value: string) {
      store.set(key, String(value));
    },
    async delete(key: string) {
      store.delete(key);
    },
    _store: store
  };
}

test('normalizeCloudflareWorkerUrl validates and cleans workers.dev URLs', () => {
  assert.equal(
    normalizeCloudflareWorkerUrl('https://ubdtools.example.workers.dev/'),
    'https://ubdtools.example.workers.dev'
  );
  assert.equal(
    normalizeCloudflareWorkerUrl('ubdtools.example.workers.dev///'),
    'https://ubdtools.example.workers.dev'
  );
  assert.equal(
    normalizeCloudflareWorkerUrl('https://dash.cloudflare.com/8ace4e3f2324eda23d28f8e8ddd1ffb4/workers/services/view/ubdtools/production'),
    ''
  );
  assert.equal(
    isDashboardLinkNotWorkerUrl('https://dash.cloudflare.com/8ace4e3f2324eda23d28f8e8ddd1ffb4/workers/services/view/ubdtools/production'),
    true
  );
  assert.equal(normalizeCloudflareWorkerUrl(''), '');
});

test('ubdtools Cloudflare Worker /api/health reports KV binding status', async () => {
  const resNoKv = await worker.fetch(new Request('https://ubdtools.test.workers.dev/api/health'), {}, {});
  assert.equal(resNoKv.status, 200);
  const bodyNoKv: any = await resNoKv.json();
  assert.equal(bodyNoKv.ok, true);
  assert.equal(bodyNoKv.kvBound, false);

  const kv = createMockKv();
  const resWithKv = await worker.fetch(new Request('https://ubdtools.test.workers.dev/api/health'), { UBD_LICENSES: kv }, {});
  const bodyWithKv: any = await resWithKv.json();
  assert.equal(bodyWithKv.ok, true);
  assert.equal(bodyWithKv.kvBound, true);
});

test('ubdtools Cloudflare Worker enforces Admin auth on /api/admin/* endpoints', async () => {
  const kv = createMockKv();
  const unauthRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/state'),
    { UBD_LICENSES: kv },
    {}
  );
  assert.equal(unauthRes.status, 401);

  const badTokenRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid.jwt.token'
      },
      body: JSON.stringify({ mode: 'PAID_MONTHLY' })
    }),
    { UBD_LICENSES: kv },
    {}
  );
  assert.equal(badTokenRes.status, 401);
});

test('ubdtools Cloudflare Worker end-to-end PAID_MONTHLY, anti-duplicate UTR 409, Admin Approve & Free Bypass flow', async () => {
  const kv = createMockKv();
  const env = { UBD_LICENSES: kv, ADMIN_API_SECRET: 'test-admin-secret' };
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-admin-secret'
  };

  // 1. Default mode is FREE_FOR_ALL
  const checkFreeRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/check?pcId=EVD-TS-MNCL-53'),
    env,
    {}
  );
  const checkFree: any = await checkFreeRes.json();
  assert.equal(checkFree.mode, 'FREE_FOR_ALL');
  assert.equal(checkFree.isAllowed, true);

  // 2. Admin enables PAID_MONTHLY
  const setPaidRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/policy', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        mode: 'PAID_MONTHLY',
        monthlyPriceInr: 10,
        durationDays: 30,
        upiId: 'e-vedhika.ubd@ybl'
      })
    }),
    env,
    {}
  );
  assert.equal(setPaidRes.status, 200);

  // 3. Unlicensed PC is blocked with PAYMENT_REQUIRED
  const checkBlockedRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/check?pcId=EVD-TS-MNCL-53'),
    env,
    {}
  );
  const checkBlocked: any = await checkBlockedRes.json();
  assert.equal(checkBlocked.mode, 'PAID_MONTHLY');
  assert.equal(checkBlocked.isAllowed, false);
  assert.equal(checkBlocked.statusCode, 'PAYMENT_REQUIRED');

  // 4. Operator submits 12-digit UTR claim
  const claimRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utrNumber: '432198765432',
        pcId: 'EVD-TS-MNCL-53',
        pcName: 'ROSI',
        operatorName: 'Rakesh',
        district: 'Mancherial',
        state: 'Telangana',
        amountInr: 10,
        skipTelegram: true
      })
    }),
    env,
    {}
  );
  assert.equal(claimRes.status, 201);

  // 5. Duplicate UTR is strictly blocked with HTTP 409 ALREADY_EXISTS
  const dupRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utrNumber: '432198765432',
        pcId: 'EVD-TS-OTHER-01',
        skipTelegram: true
      })
    }),
    env,
    {}
  );
  assert.equal(dupRes.status, 409);
  const dupBody: any = await dupRes.json();
  assert.equal(dupBody.error, 'ALREADY_EXISTS');

  // 6. Admin approves UTR claim -> PC immediately unlocks as ACTIVE_PAID
  const approveRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/claim-review', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        claimId: 'UTR-432198765432',
        decision: 'APPROVED',
        utrNumber: '432198765432',
        pcId: 'EVD-TS-MNCL-53',
        pcName: 'ROSI',
        durationDays: 30
      })
    }),
    env,
    {}
  );
  assert.equal(approveRes.status, 200);

  const checkUnlockedRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/check?pcId=EVD-TS-MNCL-53'),
    env,
    {}
  );
  const checkUnlocked: any = await checkUnlockedRes.json();
  assert.equal(checkUnlocked.isAllowed, true);
  assert.equal(checkUnlocked.statusCode, 'ACTIVE_PAID');
  assert.ok(checkUnlocked.daysRemaining >= 29);

  // 7. Admin sets Free Bypass (Payment OFF for PC) -> FREE_BYPASS
  const bypassRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/pc-license', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        pcId: 'EVD-TS-MNCL-53',
        pcName: 'ROSI',
        planType: 'FREE_ACCESS',
        status: 'ACTIVE',
        amountInr: 0,
        validUntilIso: '2099-12-31T23:59:59.000Z',
        paymentRef: 'ADMIN_FREE_BYPASS'
      })
    }),
    env,
    {}
  );
  assert.equal(bypassRes.status, 200);

  const checkBypassRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/license/check?pcId=EVD-TS-MNCL-53'),
    env,
    {}
  );
  const checkBypass: any = await checkBypassRes.json();
  assert.equal(checkBypass.isAllowed, true);
  assert.equal(checkBypass.statusCode, 'FREE_BYPASS');
  assert.equal(checkBypass.planType, 'FREE_ACCESS');

  // 8. Admin state returns all stored records
  const stateRes = await worker.fetch(
    new Request('https://ubdtools.test.workers.dev/api/admin/state', {
      headers: adminHeaders
    }),
    env,
    {}
  );
  assert.equal(stateRes.status, 200);
  const stateBody: any = await stateRes.json();
  assert.equal(stateBody.policy.mode, 'PAID_MONTHLY');
  assert.equal(stateBody.claims.length, 1);
  assert.equal(stateBody.claims[0].status, 'APPROVED');
  assert.equal(stateBody.pcLicenses['EVD-TS-MNCL-53'].planType, 'FREE_ACCESS');
});
