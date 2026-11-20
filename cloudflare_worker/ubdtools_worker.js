/**
 * E-VEDHIKA UBDTOOLS — Zero-Quota License & Payment Cloudflare Worker
 * Deploy to: https://dash.cloudflare.com/8ace4e3f2324eda23d28f8e8ddd1ffb4/workers/services/view/ubdtools/production
 *
 * REQUIRED 1-TIME BINDING (Cloudflare Dashboard -> ubdtools -> Settings -> Bindings -> Add -> KV Namespace):
 *   Variable name : UBD_LICENSES
 *   KV Namespace  : Create or select "UBD_LICENSES" (100,000 FREE reads/day, 1,000 FREE writes/day)
 */

const FIREBASE_PROJECT_ID = 'e-vedhika-258f2';
const ADMIN_EMAIL = 'rakeshkumardhawan123@gmail.com';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ADMIN_HUB_URL = 'https://rakeshkumardhawan.github.io/UBDTOOLS/admin/';

const DEFAULT_POLICY = {
  policyId: 'licensing',
  mode: 'FREE_FOR_ALL',
  monthlyPriceInr: 10,
  durationDays: 30,
  upiId: 'e-vedhika.ubd@ybl',
  paymentLinkUrl: '',
  paymentNote: 'Currently Free for all Operators (Future Plan: Rs.10/Month).',
  updatedAt: ''
};

let jwksCache = { keys: null, expiresAt: 0 };

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store'
  };
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request)
    }
  });
}

function sanitizePcId(raw) {
  return String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 120);
}

function normalizeUtr(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function base64UrlToUint8Array(b64url) {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPart(b64url) {
  const bytes = base64UrlToUint8Array(b64url);
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function getGoogleJwks() {
  const now = Date.now();
  if (jwksCache.keys && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }
  const resp = await fetch(GOOGLE_JWKS_URL);
  if (!resp.ok) {
    throw new Error('Failed to fetch Google Firebase JWKS');
  }
  const data = await resp.json();
  jwksCache = {
    keys: Array.isArray(data.keys) ? data.keys : [],
    expiresAt: now + 30 * 60 * 1000
  };
  return jwksCache.keys;
}

async function verifyFirebaseAdminJwt(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return { ok: false, error: 'Missing Authorization Bearer Firebase ID Token' };
  }

  // Optional secret override if explicitly configured in Cloudflare Worker Secrets
  if (env && env.ADMIN_API_SECRET && token === env.ADMIN_API_SECRET) {
    return { ok: true, email: ADMIN_EMAIL };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'Malformed JWT token' };
  }

  try {
    const header = decodeJwtPart(parts[0]);
    const payload = decodeJwtPart(parts[1]);

    if (header.alg !== 'RS256' || !header.kid) {
      return { ok: false, error: 'Unsupported JWT algorithm' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.aud !== FIREBASE_PROJECT_ID) {
      return { ok: false, error: 'Invalid Firebase project audience' };
    }
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
      return { ok: false, error: 'Invalid Firebase token issuer' };
    }
    if (!payload.exp || payload.exp <= nowSec) {
      return { ok: false, error: 'Firebase Admin session expired — please refresh or sign in again' };
    }
    if (payload.iat && payload.iat > nowSec + 300) {
      return { ok: false, error: 'Invalid token issue time' };
    }

    const email = String(payload.email || '').toLowerCase();
    if (!email || email !== ADMIN_EMAIL || payload.email_verified !== true) {
      return { ok: false, error: 'Access denied: Admin Google Account required' };
    }

    const keys = await getGoogleJwks();
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      jwksCache.expiresAt = 0;
      const freshKeys = await getGoogleJwks();
      jwk = freshKeys.find((k) => k.kid === header.kid);
    }
    if (!jwk) {
      return { ok: false, error: 'Signing key not found in Google JWKS' };
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlToUint8Array(parts[2]);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signingInput);
    if (!valid) {
      return { ok: false, error: 'Invalid Firebase ID Token signature' };
    }

    return { ok: true, email };
  } catch (err) {
    return { ok: false, error: `Token verification failed: ${err && err.message ? err.message : 'unknown'}` };
  }
}

async function readPolicy(kv) {
  if (!kv) return { ...DEFAULT_POLICY };
  const raw = await kv.get('policy:licensing', 'json');
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_POLICY };
  return {
    policyId: 'licensing',
    mode: raw.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL',
    monthlyPriceInr: Number.isFinite(Number(raw.monthlyPriceInr)) ? Number(raw.monthlyPriceInr) : 10,
    durationDays: Math.max(1, Math.min(3650, Math.floor(Number(raw.durationDays) || 30))),
    upiId: String(raw.upiId || 'e-vedhika.ubd@ybl').trim(),
    paymentLinkUrl: String(raw.paymentLinkUrl || '').trim(),
    paymentNote: String(raw.paymentNote || DEFAULT_POLICY.paymentNote).trim(),
    updatedAt: String(raw.updatedAt || '')
  };
}

function evaluatePcAccess(policy, pcLicense, nowMs = Date.now()) {
  const price = Math.max(0, Number(policy.monthlyPriceInr ?? 10));
  const days = Math.max(1, Math.floor(Number(policy.durationDays ?? 30)));

  if (policy.mode !== 'PAID_MONTHLY') {
    return {
      mode: 'FREE_FOR_ALL',
      statusCode: 'FREE_FOR_ALL',
      isAllowed: true,
      daysRemaining: 999,
      planType: 'FREE_ACCESS',
      pcStatus: 'ACTIVE',
      validUntilIso: '',
      paymentRef: '',
      summaryText: `Free Early Access Active (Future Rate: Rs.${price}/Month)`
    };
  }

  if (
    pcLicense &&
    String(pcLicense.status || '').toUpperCase() === 'ACTIVE' &&
    String(pcLicense.planType || '').toUpperCase() === 'FREE_ACCESS'
  ) {
    return {
      mode: 'PAID_MONTHLY',
      statusCode: 'FREE_BYPASS',
      isAllowed: true,
      daysRemaining: 9999,
      planType: 'FREE_ACCESS',
      pcStatus: 'ACTIVE',
      validUntilIso: String(pcLicense.validUntilIso || '2099-12-31T23:59:59.000Z'),
      paymentRef: String(pcLicense.paymentRef || 'ADMIN_FREE_BYPASS'),
      summaryText: 'Admin Free Access Active (Payment Mode OFF for this PC)'
    };
  }

  if (pcLicense && String(pcLicense.status || '').toUpperCase() === 'REVOKED') {
    return {
      mode: 'PAID_MONTHLY',
      statusCode: 'REVOKED',
      isAllowed: false,
      daysRemaining: 0,
      planType: String(pcLicense.planType || 'PAID_30_DAYS'),
      pcStatus: 'REVOKED',
      validUntilIso: String(pcLicense.validUntilIso || ''),
      paymentRef: String(pcLicense.paymentRef || 'REVOKED_BY_ADMIN'),
      summaryText: 'Access Revoked by Admin - Subscription Renewal Required'
    };
  }

  if (pcLicense && String(pcLicense.status || '').toUpperCase() === 'ACTIVE' && pcLicense.validUntilIso) {
    const expiryMs = Date.parse(pcLicense.validUntilIso);
    if (!Number.isNaN(expiryMs) && expiryMs > nowMs) {
      const daysLeft = Math.max(1, Math.ceil((expiryMs - nowMs) / 86400000));
      return {
        mode: 'PAID_MONTHLY',
        statusCode: daysLeft <= 5 ? 'EXPIRING_SOON' : 'ACTIVE_PAID',
        isAllowed: true,
        daysRemaining: daysLeft,
        planType: String(pcLicense.planType || 'PAID_30_DAYS'),
        pcStatus: 'ACTIVE',
        validUntilIso: String(pcLicense.validUntilIso),
        paymentRef: String(pcLicense.paymentRef || ''),
        summaryText:
          daysLeft <= 5
            ? `Active Subscription (Rs.${price}/Mo | ${daysLeft} Days Left - Renew Soon)`
            : `Active Subscription (Rs.${price}/Mo | ${daysLeft} Days Left)`
      };
    }
    return {
      mode: 'PAID_MONTHLY',
      statusCode: 'EXPIRED',
      isAllowed: false,
      daysRemaining: 0,
      planType: String(pcLicense.planType || 'PAID_30_DAYS'),
      pcStatus: 'EXPIRED',
      validUntilIso: String(pcLicense.validUntilIso),
      paymentRef: String(pcLicense.paymentRef || ''),
      summaryText: `Subscription Expired - Renew Rs.${price} for ${days} Days`
    };
  }

  return {
    mode: 'PAID_MONTHLY',
    statusCode: 'PAYMENT_REQUIRED',
    isAllowed: false,
    daysRemaining: 0,
    planType: 'PAID_30_DAYS',
    pcStatus: 'EXPIRED',
    validUntilIso: '',
    paymentRef: '',
    summaryText: `Subscription Required (Rs.${price} / ${days} Days)`
  };
}

async function appendIndexKey(kv, indexKey, value, maxItems) {
  const existing = (await kv.get(indexKey, 'json')) || [];
  const list = Array.isArray(existing) ? existing.filter((k) => k !== value) : [];
  list.unshift(value);
  await kv.put(indexKey, JSON.stringify(list.slice(0, maxItems)));
}

function computeRenewalExpiryIso(existingValidUntilIso, durationDays) {
  const now = Date.now();
  const existingMs = existingValidUntilIso ? Date.parse(existingValidUntilIso) : NaN;
  const baseMs = !Number.isNaN(existingMs) && existingMs > now ? existingMs : now;
  const days = Math.max(1, Math.min(3650, Math.floor(Number(durationDays) || 30)));
  return new Date(baseMs + days * 86400000).toISOString();
}

async function notifyTelegramClaim(env, claim, durationDays) {
  try {
    const botToken = (env && env.TELEGRAM_BOT_TOKEN) || '8681492578:AAH23013347X5tI6qU5E6z2D2u1R3S0P1O0';
    const chatId = (env && env.TELEGRAM_CHAT_ID) || '431228008';
    const tgMsg =
      `💳 <b>NEW UTR PAYMENT CLAIM (CLOUDFLARE)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔑 <b>UTR:</b> <code>${claim.utrNumber}</code>\n` +
      `🖥️ <b>PC Name:</b> ${claim.pcName} (<code>${claim.pcId}</code>)\n` +
      `👤 <b>Operator:</b> ${claim.operatorName}\n` +
      `📍 <b>District:</b> ${claim.district} (${claim.state})\n` +
      `💰 <b>Amount:</b> ₹${claim.amountInr} / ${durationDays}d\n` +
      `━━━━━━━━━━━━━━━━━━━━━━`;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: tgMsg,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `✅ Open Admin Hub & Review ${claim.utrNumber}`,
                url: `${ADMIN_HUB_URL}?section=payments&utr=${encodeURIComponent(claim.utrNumber)}`
              }
            ]
          ]
        }
      })
    });
  } catch {
    // Non-blocking best-effort alert
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const kv = env && env.UBD_LICENSES ? env.UBD_LICENSES : null;

    // 1. Health & Binding Diagnostics
    if (request.method === 'GET' && (pathname === '/' || pathname === '/api/health')) {
      return jsonResponse(request, {
        ok: true,
        service: 'ubdtools-cloudflare-worker',
        version: '1.0.0',
        kvBound: Boolean(kv),
        timestamp: new Date().toISOString(),
        hint: kv ? 'UBD_LICENSES KV Ready (100,000 free reads/day)' : 'Bind KV Namespace named UBD_LICENSES in Worker Settings -> Bindings'
      });
    }

    // 2. Public Policy Endpoint
    if (request.method === 'GET' && pathname === '/api/license/policy') {
      const policy = await readPolicy(kv);
      return jsonResponse(request, {
        ok: true,
        kvBound: Boolean(kv),
        ...policy,
        policy
      });
    }

    // 3. Public Combined License Check (1 fast call for Desktop C# & Web Checkout)
    if (request.method === 'GET' && pathname === '/api/license/check') {
      const pcId = sanitizePcId(url.searchParams.get('pcId') || '');
      const policy = await readPolicy(kv);
      const pcLicense = kv && pcId ? await kv.get(`pc:${pcId.toUpperCase()}`, 'json') : null;
      const evaluated = evaluatePcAccess(policy, pcLicense);

      return jsonResponse(request, {
        ok: true,
        source: 'cloudflare-worker',
        kvBound: Boolean(kv),
        pcId,
        mode: evaluated.mode,
        statusCode: evaluated.statusCode,
        isAllowed: evaluated.isAllowed,
        daysRemaining: evaluated.daysRemaining,
        monthlyPriceInr: policy.monthlyPriceInr,
        durationDays: policy.durationDays,
        upiId: policy.upiId,
        paymentLinkUrl: policy.paymentLinkUrl,
        paymentNote: policy.paymentNote,
        validUntilIso: evaluated.validUntilIso,
        planType: evaluated.planType,
        pcStatus: evaluated.pcStatus,
        paymentRef: evaluated.paymentRef,
        summaryText: evaluated.summaryText,
        policy,
        pcLicense: pcLicense || null
      });
    }

    // 4. Public Anti-Duplicate 12-Digit UTR Claim Submission
    if (request.method === 'POST' && pathname === '/api/license/claim') {
      if (!kv) {
        return jsonResponse(
          request,
          { ok: false, error: 'KV_NOT_BOUND', message: 'Bind KV Namespace named UBD_LICENSES in Cloudflare Worker Settings -> Bindings.' },
          503
        );
      }

      let body = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse(request, { ok: false, error: 'INVALID_JSON', message: 'Invalid JSON body' }, 400);
      }

      const cleanUtr = normalizeUtr(body.utrNumber || body.utr);
      if (cleanUtr.length < 8 || cleanUtr.length > 36) {
        return jsonResponse(
          request,
          { ok: false, error: 'INVALID_UTR', message: 'UTR must be 8-36 alphanumeric characters.' },
          400
        );
      }

      const claimId = `UTR-${cleanUtr}`;
      const existing = await kv.get(`claim:${claimId}`, 'json');
      if (existing) {
        return jsonResponse(
          request,
          {
            ok: false,
            error: 'ALREADY_EXISTS',
            message: `Duplicate / Already Used UTR (${cleanUtr}). Each UTR can only be submitted once.`
          },
          409
        );
      }

      const policy = await readPolicy(kv);
      const pcId = sanitizePcId(body.pcId || body.pcName || 'EVD-PC') || 'EVD-PC';
      const claim = {
        claimId,
        utrNumber: cleanUtr,
        pcId,
        pcName: String(body.pcName || pcId).trim().slice(0, 128),
        operatorName: String(body.operatorName || 'Operator').trim().slice(0, 128),
        district: String(body.district || 'District').trim().slice(0, 100),
        state: String(body.state || 'Telangana').trim().slice(0, 64),
        amountInr: Math.max(1, Math.min(10000, Math.round(Number(body.amountInr || policy.monthlyPriceInr || 10)))),
        status: 'PENDING',
        note: String(body.note || `Submitted via Cloudflare Worker for Rs.${policy.monthlyPriceInr}/${policy.durationDays}d`).slice(0, 300),
        createdAtIso: new Date().toISOString()
      };

      await kv.put(`claim:${claimId}`, JSON.stringify(claim));
      await appendIndexKey(kv, 'claims:index', claimId, 2000);

      if (body.skipTelegram !== true) {
        const p = notifyTelegramClaim(env, claim, policy.durationDays);
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(p);
        }
      }

      return jsonResponse(request, { ok: true, claim }, 201);
    }

    // =========================================================================
    // ADMIN-ONLY ENDPOINTS (Cryptographically Verified Firebase Google ID Token)
    // =========================================================================
    if (pathname.startsWith('/api/admin/')) {
      const authCheck = await verifyFirebaseAdminJwt(request, env);
      if (!authCheck.ok) {
        return jsonResponse(request, { ok: false, error: 'UNAUTHORIZED', message: authCheck.error }, 401);
      }
      if (!kv) {
        return jsonResponse(
          request,
          { ok: false, error: 'KV_NOT_BOUND', message: 'Bind KV Namespace named UBD_LICENSES in Cloudflare Worker Settings -> Bindings.' },
          503
        );
      }

      // 5. Admin Load Full State (Policy + PC Licenses + UTR Claims)
      if (request.method === 'GET' && pathname === '/api/admin/state') {
        const policy = await readPolicy(kv);

        const pcKeys = (await kv.get('pcs:index', 'json')) || [];
        const claimKeys = (await kv.get('claims:index', 'json')) || [];

        const pcList = await Promise.all(
          (Array.isArray(pcKeys) ? pcKeys.slice(0, 500) : []).map((k) => kv.get(`pc:${k}`, 'json'))
        );
        const pcLicenses = {};
        for (const rec of pcList) {
          if (rec && rec.pcId) {
            pcLicenses[String(rec.pcId).toUpperCase()] = rec;
          }
        }

        const rawClaims = await Promise.all(
          (Array.isArray(claimKeys) ? claimKeys.slice(0, 300) : []).map((k) => kv.get(`claim:${k}`, 'json'))
        );
        const claims = rawClaims
          .filter((c) => c && c.claimId)
          .sort((a, b) => Date.parse(b.createdAtIso || '0') - Date.parse(a.createdAtIso || '0'));

        return jsonResponse(request, {
          ok: true,
          policy,
          pcLicenses,
          claims,
          syncedAt: new Date().toISOString()
        });
      }

      // 6. Admin Update Global Licensing Policy (FREE_FOR_ALL / PAID_MONTHLY)
      if (request.method === 'POST' && pathname === '/api/admin/policy') {
        let body = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse(request, { ok: false, error: 'INVALID_JSON', message: 'Invalid JSON body' }, 400);
        }

        const nextMode = body.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL';
        const rawPrice = Number(body.monthlyPriceInr);
        const safePrice =
          nextMode === 'PAID_MONTHLY'
            ? Math.max(1, Math.min(10000, Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 10))
            : Math.max(0, Math.min(10000, Number.isFinite(rawPrice) ? rawPrice : 10));
        const safeDays = Math.max(1, Math.min(3650, Math.floor(Number(body.durationDays) || 30)));
        const nextPolicy = {
          policyId: 'licensing',
          mode: nextMode,
          monthlyPriceInr: safePrice,
          durationDays: safeDays,
          upiId: String(body.upiId || '').trim().slice(0, 120),
          paymentLinkUrl: String(body.paymentLinkUrl || '').trim().slice(0, 300),
          paymentNote: String(body.paymentNote || DEFAULT_POLICY.paymentNote).trim().slice(0, 400),
          updatedAt: new Date().toISOString()
        };

        await kv.put('policy:licensing', JSON.stringify(nextPolicy));
        return jsonResponse(request, { ok: true, policy: nextPolicy });
      }

      // 7. Admin Set Per-PC License (Free Bypass / +30d Paid / Revoke / Turn Payment ON)
      if (request.method === 'POST' && pathname === '/api/admin/pc-license') {
        let body = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse(request, { ok: false, error: 'INVALID_JSON', message: 'Invalid JSON body' }, 400);
        }

        const cleanPcId = sanitizePcId(body.pcId || '');
        if (!cleanPcId) {
          return jsonResponse(request, { ok: false, error: 'PC_ID_REQUIRED', message: 'Valid pcId is required' }, 400);
        }

        const keyUpper = cleanPcId.toUpperCase();
        const record = {
          pcId: cleanPcId,
          pcName: String(body.pcName || cleanPcId).trim().slice(0, 128),
          planType: body.planType === 'FREE_ACCESS' ? 'FREE_ACCESS' : 'PAID_30_DAYS',
          status: ['ACTIVE', 'REVOKED', 'EXPIRED'].includes(String(body.status || '').toUpperCase())
            ? String(body.status).toUpperCase()
            : 'ACTIVE',
          amountInr: Math.max(0, Math.min(10000, Number(body.amountInr ?? 0))),
          validUntilIso: String(body.validUntilIso || '').slice(0, 64),
          paymentRef: String(body.paymentRef || '').slice(0, 128),
          updatedAt: new Date().toISOString()
        };

        await kv.put(`pc:${keyUpper}`, JSON.stringify(record));
        await appendIndexKey(kv, 'pcs:index', keyUpper, 5000);
        return jsonResponse(request, { ok: true, pcLicense: record });
      }

      // 8. Admin Review UTR Payment Claim (APPROVE or REJECT)
      if (request.method === 'POST' && pathname === '/api/admin/claim-review') {
        let body = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse(request, { ok: false, error: 'INVALID_JSON', message: 'Invalid JSON body' }, 400);
        }

        const claimId = String(body.claimId || '').trim();
        const decision = String(body.decision || body.status || '').toUpperCase();
        if (!claimId || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
          return jsonResponse(request, { ok: false, error: 'INVALID_REVIEW', message: 'claimId and decision (APPROVED/REJECTED) required' }, 400);
        }

        const existingClaim = (await kv.get(`claim:${claimId}`, 'json')) || {
          claimId,
          utrNumber: String(body.utrNumber || claimId.replace(/^UTR-/i, '')),
          pcId: sanitizePcId(body.pcId || ''),
          pcName: String(body.pcName || 'GP-OFFICE-PC').slice(0, 128),
          operatorName: String(body.operatorName || 'Operator').slice(0, 128),
          district: String(body.district || '').slice(0, 100),
          state: String(body.state || '').slice(0, 64),
          amountInr: Number(body.amountInr || 10),
          createdAtIso: new Date().toISOString()
        };

        const updatedClaim = {
          ...existingClaim,
          status: decision,
          note: String(
            body.note ||
              (decision === 'APPROVED'
                ? `Verified UTR ${existingClaim.utrNumber} by Admin on ${new Date().toISOString().slice(0, 10)}`
                : `Rejected (Duplicate / Unmatched UTR ${existingClaim.utrNumber}) on ${new Date().toISOString().slice(0, 10)}`)
          ).slice(0, 300),
          reviewedAtIso: new Date().toISOString()
        };

        await kv.put(`claim:${claimId}`, JSON.stringify(updatedClaim));
        await appendIndexKey(kv, 'claims:index', claimId, 2000);

        let activatedPc = null;
        if (decision === 'APPROVED' && updatedClaim.pcId) {
          const policy = await readPolicy(kv);
          const cleanPcId = sanitizePcId(updatedClaim.pcId);
          const keyUpper = cleanPcId.toUpperCase();
          const prevPc = await kv.get(`pc:${keyUpper}`, 'json');
          const grantDays = Math.max(1, Math.min(3650, Math.floor(Number(body.durationDays || policy.durationDays || 30))));
          const validUntilIso = body.validUntilIso || computeRenewalExpiryIso(prevPc ? prevPc.validUntilIso : '', grantDays);

          activatedPc = {
            pcId: cleanPcId,
            pcName: String(updatedClaim.pcName || cleanPcId).trim().slice(0, 128),
            planType: 'PAID_30_DAYS',
            status: 'ACTIVE',
            amountInr: Math.max(0, Math.min(10000, Number(updatedClaim.amountInr || policy.monthlyPriceInr || 10))),
            validUntilIso,
            paymentRef: `UTR-${updatedClaim.utrNumber}`.slice(0, 128),
            updatedAt: new Date().toISOString()
          };
          await kv.put(`pc:${keyUpper}`, JSON.stringify(activatedPc));
          await appendIndexKey(kv, 'pcs:index', keyUpper, 5000);
        }

        return jsonResponse(request, { ok: true, claim: updatedClaim, pcLicense: activatedPc });
      }
    }

    return jsonResponse(request, { ok: false, error: 'NOT_FOUND', path: pathname }, 404);
  }
};
