import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LICENSE_POLICY,
  computeRenewalExpiryIso,
  evaluateLicenseState,
  normalizeUtrNumber,
  buildClaimDocId,
  inspectPaymentClaimDuplicate,
  detectPhoneExposedInUpi,
  buildUpiPaymentUri,
  PaymentClaimRecord
} from '../src/utils/licensePolicy';

test('FREE_FOR_ALL mode allows access regardless of per-PC record', () => {
  const res = evaluateLicenseState(DEFAULT_LICENSE_POLICY, null, Date.UTC(2026, 10, 16));
  assert.equal(res.allowed, true);
  assert.match(res.badgeText, /FREE ACCESS/i);
});

test('PAID_MONTHLY denies PC without active license and allows valid 30-day license', () => {
  const now = Date.UTC(2026, 10, 16);
  const paidPolicy = { ...DEFAULT_LICENSE_POLICY, mode: 'PAID_MONTHLY' as const };

  const missing = evaluateLicenseState(paidPolicy, null, now);
  assert.equal(missing.allowed, false);
  assert.equal(missing.daysRemaining, 0);

  const futureExpiry = computeRenewalExpiryIso(undefined, 30, now);
  const active = evaluateLicenseState(
    paidPolicy,
    {
      pcId: 'EVD-TEST-01',
      planType: 'PAID_30_DAYS',
      status: 'ACTIVE',
      amountInr: 10,
      validUntilIso: futureExpiry
    },
    now
  );
  assert.equal(active.allowed, true);
  assert.equal(active.daysRemaining, 30);
});

test('PAID_MONTHLY denies expired or revoked license', () => {
  const now = Date.UTC(2026, 10, 16);
  const paidPolicy = { ...DEFAULT_LICENSE_POLICY, mode: 'PAID_MONTHLY' as const };

  const expired = evaluateLicenseState(
    paidPolicy,
    {
      pcId: 'EVD-TEST-02',
      planType: 'PAID_30_DAYS',
      status: 'ACTIVE',
      amountInr: 10,
      validUntilIso: new Date(now - 1000).toISOString()
    },
    now
  );
  assert.equal(expired.allowed, false);

  const revoked = evaluateLicenseState(
    paidPolicy,
    {
      pcId: 'EVD-TEST-03',
      planType: 'PAID_30_DAYS',
      status: 'REVOKED',
      amountInr: 10,
      validUntilIso: new Date(now + 10 * 86400 * 1000).toISOString()
    },
    now
  );
  assert.equal(revoked.allowed, false);
});

test('computeRenewalExpiryIso extends from future expiry when still active', () => {
  const now = Date.UTC(2026, 10, 16);
  const tenDaysLater = new Date(now + 10 * 86400 * 1000).toISOString();
  const extended = computeRenewalExpiryIso(tenDaysLater, 30, now);
  const diffDays = Math.round((Date.parse(extended) - now) / (86400 * 1000));
  assert.equal(diffDays, 40);
});

test('normalizeUtrNumber and buildClaimDocId enforce safe canonical IDs', () => {
  assert.equal(normalizeUtrNumber(' 4321-9876 5432 '), '432198765432');
  assert.equal(buildClaimDocId('4321 9876 5432'), 'UTR-432198765432');
  assert.equal(buildClaimDocId('12345'), '');
});

test('inspectPaymentClaimDuplicate flags exact UTR reuse and same-PC double payment', () => {
  const existing: PaymentClaimRecord[] = [
    {
      claimId: 'UTR-432198765432',
      utrNumber: '432198765432',
      pcId: 'EVD-PC-01',
      pcName: 'GP-MANCHERIAL-01',
      amountInr: 10,
      status: 'APPROVED'
    }
  ];

  // Attempt by a second PC reusing the same UTR
  const dup = inspectPaymentClaimDuplicate(existing, '4321-9876-5432', 'EVD-PC-02');
  assert.equal(dup.isValidFormat, true);
  assert.equal(dup.isExactUtrDuplicate, true);
  assert.match(dup.warningMessage, /Duplicate UTR/i);

  // Genuine second payment (different UTR) by the same PC -> flags double payment warning so Admin checks
  const doublePay = inspectPaymentClaimDuplicate(existing, '998877665544', 'EVD-PC-01');
  assert.equal(doublePay.isValidFormat, true);
  assert.equal(doublePay.isExactUtrDuplicate, false);
  assert.equal(doublePay.hasSamePcDoublePaymentRisk, true);
  assert.equal(doublePay.samePcRepeatCount, 1);
});

test('detectPhoneExposedInUpi flags mobile-number VPAs and allows business alias VPAs', () => {
  assert.equal(detectPhoneExposedInUpi('9876543210@ybl'), true);
  assert.equal(detectPhoneExposedInUpi('evedhika.ubd@okhdfcbank'), false);
  assert.equal(detectPhoneExposedInUpi(''), false);

  const uri = buildUpiPaymentUri('evedhika@okaxis', 10, 'EVD-PC-09');
  assert.match(uri, /^upi:\/\/pay\?/);
  assert.match(uri, /pa=evedhika%40okaxis/);
  assert.match(uri, /am=10/);
});
