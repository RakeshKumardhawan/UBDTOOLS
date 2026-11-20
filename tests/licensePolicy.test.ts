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
  computePaymentHubStats,
  filterPaymentClaims,
  buildOperatorCheckoutUrl,
  buildPaymentsCsv,
  getUtrInputFeedback,
  PaymentClaimRecord,
  PcLicenseRecord
} from '../src/utils/licensePolicy';

test('FREE_FOR_ALL mode allows access regardless of per-PC record', () => {
  const res = evaluateLicenseState(DEFAULT_LICENSE_POLICY, null, Date.UTC(2026, 10, 16));
  assert.equal(res.allowed, true);
  assert.match(res.badgeText, /FREE ACCESS/i);
});

test('PAID_MONTHLY grants offline grace for missing/pending license and allows valid 30-day license', () => {
  const now = Date.UTC(2026, 10, 16);
  const paidPolicy = { ...DEFAULT_LICENSE_POLICY, mode: 'PAID_MONTHLY' as const };

  const missing = evaluateLicenseState(paidPolicy, null, now);
  assert.equal(missing.allowed, true); // Offline grace active so operator work is never blocked
  assert.match(missing.badgeText, /OFFLINE GRACE ACTIVE/i);

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

test('PAID_MONTHLY grants grace period on expiration and denies revoked license', () => {
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
  assert.equal(expired.allowed, true); // Grace period active on expiration
  assert.match(expired.badgeText, /GRACE PERIOD/i);

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
  assert.equal(revoked.allowed, false); // Explicitly revoked by Admin
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

test('Per-PC FREE_ACCESS bypasses payment even when global mode is PAID_MONTHLY', () => {
  const now = Date.UTC(2026, 10, 16);
  const paidPolicy = { ...DEFAULT_LICENSE_POLICY, mode: 'PAID_MONTHLY' as const };

  const exemptRes = evaluateLicenseState(
    paidPolicy,
    {
      pcId: 'EVD-VIP-PC-01',
      pcName: 'MPDO-OFFICE-PC',
      planType: 'FREE_ACCESS',
      status: 'ACTIVE',
      amountInr: 0,
      validUntilIso: '2099-12-31T23:59:59.000Z',
      paymentRef: 'ADMIN_FREE_BYPASS'
    },
    now
  );
  assert.equal(exemptRes.allowed, true);
  assert.match(exemptRes.badgeText, /FREE BYPASS/i);
  assert.equal(exemptRes.daysRemaining, 9999);
});

test('computePaymentHubStats aggregates revenue, pending claims, expiring soon, and free bypass counts', () => {
  const now = Date.UTC(2026, 10, 20);
  const claims: PaymentClaimRecord[] = [
    { claimId: 'UTR-111122223333', utrNumber: '111122223333', pcId: 'PC-1', pcName: 'GP-1', amountInr: 10, status: 'APPROVED' },
    { claimId: 'UTR-222233334444', utrNumber: '222233334444', pcId: 'PC-2', pcName: 'GP-2', amountInr: 30, status: 'APPROVED' },
    { claimId: 'UTR-333344445555', utrNumber: '333344445555', pcId: 'PC-3', pcName: 'GP-3', amountInr: 10, status: 'PENDING' },
    { claimId: 'UTR-444455556666', utrNumber: '444455556666', pcId: 'PC-4', pcName: 'GP-4', amountInr: 10, status: 'REJECTED' }
  ];
  const licenses: Record<string, PcLicenseRecord> = {
    'PC-1': { pcId: 'PC-1', planType: 'PAID_30_DAYS', status: 'ACTIVE', amountInr: 10, validUntilIso: new Date(now + 20 * 86400000).toISOString() },
    'PC-2': { pcId: 'PC-2', planType: 'PAID_30_DAYS', status: 'ACTIVE', amountInr: 10, validUntilIso: new Date(now + 3 * 86400000).toISOString() },
    'PC-3': { pcId: 'PC-3', planType: 'FREE_ACCESS', status: 'ACTIVE', amountInr: 0, validUntilIso: '2099-12-31T00:00:00.000Z' },
    'PC-4': { pcId: 'PC-4', planType: 'PAID_30_DAYS', status: 'REVOKED', amountInr: 0, validUntilIso: new Date(now - 1000).toISOString() }
  };

  const stats = computePaymentHubStats(claims, licenses, now);
  assert.equal(stats.totalApprovedRevenueInr, 40);
  assert.equal(stats.approvedClaimsCount, 2);
  assert.equal(stats.pendingClaimsCount, 1);
  assert.equal(stats.rejectedClaimsCount, 1);
  assert.equal(stats.activePaidPcsCount, 2);
  assert.equal(stats.expiringSoonPcsCount, 1);
  assert.equal(stats.freeBypassPcsCount, 1);
  assert.equal(stats.revokedPcsCount, 1);
});

test('filterPaymentClaims filters by status and search term across UTR, PC, and district', () => {
  const claims: PaymentClaimRecord[] = [
    { claimId: 'UTR-432198765432', utrNumber: '432198765432', pcId: 'EVD-PC-01', pcName: 'GP-MANCHERIAL', district: 'Mancherial', amountInr: 10, status: 'PENDING' },
    { claimId: 'UTR-998877665544', utrNumber: '998877665544', pcId: 'EVD-PC-02', pcName: 'GP-WARANGAL', district: 'Warangal', amountInr: 10, status: 'APPROVED' }
  ];

  assert.equal(filterPaymentClaims(claims, 'ALL', '432198765432').length, 1);
  assert.equal(filterPaymentClaims(claims, 'PENDING', 'warangal').length, 0);
  assert.equal(filterPaymentClaims(claims, 'APPROVED', 'warangal').length, 1);
});

test('buildOperatorCheckoutUrl, buildPaymentsCsv, and getUtrInputFeedback work deterministically', () => {
  const url = buildOperatorCheckoutUrl('EVD-TS-01', 'GP-OFFICE');
  assert.match(url, /\?pay=1&pcId=EVD-TS-01&pcName=GP-OFFICE$/);

  const csv = buildPaymentsCsv([
    {
      claimId: 'UTR-123456789012',
      utrNumber: '123456789012',
      pcId: 'EVD-TS-01',
      pcName: 'GP, Main',
      amountInr: 10,
      status: 'APPROVED',
      note: 'Verified "OK"'
    }
  ]);
  assert.match(csv, /^ClaimID,UTR,PC_ID,/);
  assert.match(csv, /"GP, Main"/);
  assert.match(csv, /"Verified ""OK"""/);

  assert.equal(getUtrInputFeedback('').tone, 'idle');
  assert.equal(getUtrInputFeedback('1234').tone, 'warning');
  assert.equal(getUtrInputFeedback('4321-9876 5432').isValid, true);
  assert.equal(getUtrInputFeedback('4321-9876 5432').cleanUtr, '432198765432');
});
