export type LicenseMode = 'FREE_FOR_ALL' | 'PAID_MONTHLY';

export interface LicensePolicyConfig {
  policyId: string;
  mode: LicenseMode;
  monthlyPriceInr: number;
  durationDays: number;
  upiId: string;
  paymentLinkUrl?: string;
  paymentNote: string;
}

export interface PcLicenseRecord {
  pcId: string;
  pcName?: string;
  planType: 'FREE_ACCESS' | 'PAID_30_DAYS';
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  amountInr: number;
  validUntilIso: string;
  paymentRef?: string;
}

export interface LicenseEvaluation {
  allowed: boolean;
  badgeText: string;
  reason: string;
  daysRemaining: number;
}

export const DEFAULT_LICENSE_POLICY: LicensePolicyConfig = {
  policyId: 'licensing',
  mode: 'FREE_FOR_ALL',
  monthlyPriceInr: 10,
  durationDays: 30,
  upiId: '',
  paymentLinkUrl: '',
  paymentNote:
    'ప్రస్తుతం అందరికీ 100% ఉచితం (Free Early Access). భవిష్యత్తులో Admin PAID_MONTHLY ఆన్ చేసినప్పుడు నెలకు ₹10 (30 రోజులు) ప్లాన్ వర్తిస్తుంది.'
};

export function computeRenewalExpiryIso(
  baseIso?: string,
  durationDays: number = 30,
  nowMs: number = Date.now()
): string {
  const safeDays = Math.max(1, Math.min(3650, Math.floor(durationDays || 30)));
  const parsedBase = baseIso ? Date.parse(baseIso) : NaN;
  const startMs = !Number.isNaN(parsedBase) && parsedBase > nowMs ? parsedBase : nowMs;
  const expiryMs = startMs + safeDays * 86400 * 1000;
  return new Date(expiryMs).toISOString();
}

export interface PaymentClaimRecord {
  claimId: string;
  utrNumber: string;
  pcId: string;
  pcName: string;
  operatorName?: string;
  district?: string;
  state?: string;
  amountInr: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  createdAtIso?: string;
}

export interface DuplicateClaimCheckResult {
  isValidFormat: boolean;
  normalizedUtr: string;
  claimId: string;
  isExactUtrDuplicate: boolean;
  existingUtrClaim?: PaymentClaimRecord | null;
  samePcRepeatCount: number;
  hasSamePcDoublePaymentRisk: boolean;
  warningMessage: string;
}

export function normalizeUtrNumber(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function buildClaimDocId(utr: string): string {
  const clean = normalizeUtrNumber(utr);
  if (clean.length < 8 || clean.length > 36) return '';
  return `UTR-${clean}`;
}

export function inspectPaymentClaimDuplicate(
  existingClaims: PaymentClaimRecord[],
  rawUtr: string,
  targetPcId: string
): DuplicateClaimCheckResult {
  const normalizedUtr = normalizeUtrNumber(rawUtr);
  const isValidFormat = normalizedUtr.length >= 8 && normalizedUtr.length <= 36;
  const claimId = isValidFormat ? `UTR-${normalizedUtr}` : '';
  const cleanPcId = String(targetPcId || '').trim().toUpperCase();

  const exactMatch = isValidFormat
    ? existingClaims.find(
        (c) =>
          normalizeUtrNumber(c.utrNumber) === normalizedUtr ||
          String(c.claimId || '').toUpperCase() === claimId
      ) || null
    : null;

  const samePcClaims = existingClaims.filter(
    (c) =>
      String(c.pcId || '').trim().toUpperCase() === cleanPcId &&
      c.status !== 'REJECTED'
  );
  const hasSamePcDoublePaymentRisk = samePcClaims.length > 1 || (samePcClaims.length === 1 && !exactMatch);

  let warningMessage = '';
  if (!isValidFormat) {
    warningMessage = 'చెల్లని UTR నంబర్ (కనీసం 8–36 అక్షరాలు/అంకెలు ఉండాలి).';
  } else if (exactMatch) {
    warningMessage = `Duplicate UTR! ఈ UTR (${normalizedUtr}) ఇప్పటికే ${exactMatch.pcName || exactMatch.pcId} (${exactMatch.status}) పేరుతో ఉంది.`;
  } else if (hasSamePcDoublePaymentRisk) {
    warningMessage = `ఒకే PC (${targetPcId}) నుండి ఒకటి కంటే ఎక్కువ పేమెంట్ క్లెయిమ్‌లు వచ్చాయి (Double Payment Check).`;
  }

  return {
    isValidFormat,
    normalizedUtr,
    claimId,
    isExactUtrDuplicate: Boolean(exactMatch),
    existingUtrClaim: exactMatch,
    samePcRepeatCount: samePcClaims.length,
    hasSamePcDoublePaymentRisk,
    warningMessage
  };
}

export function detectPhoneExposedInUpi(upiId: string): boolean {
  const clean = String(upiId || '').trim();
  if (!clean) return false;
  const localPart = clean.split('@')[0] || '';
  return /\d{10}/.test(localPart);
}

export function buildUpiPaymentUri(
  upiId: string,
  amountInr: number = 10,
  pcId: string = ''
): string {
  const cleanVpa = String(upiId || '').trim();
  if (!cleanVpa) return '';
  const safeAmt = Math.max(1, Math.round(Number(amountInr) || 10));
  const note = pcId ? `EVD ${pcId.slice(0, 32)}` : 'E-Vedhika UBD Subscription';
  const params = new URLSearchParams({
    pa: cleanVpa,
    pn: 'E-Vedhika Solutions',
    am: String(safeAmt),
    cu: 'INR',
    tn: note
  });
  return `upi://pay?${params.toString()}`;
}

export function isPcPaymentExempt(pcLicense?: PcLicenseRecord | null): boolean {
  return Boolean(
    pcLicense &&
      pcLicense.status === 'ACTIVE' &&
      pcLicense.planType === 'FREE_ACCESS'
  );
}

export function evaluateLicenseState(
  policy: LicensePolicyConfig,
  pcLicense?: PcLicenseRecord | null,
  nowMs: number = Date.now()
): LicenseEvaluation {
  if (isPcPaymentExempt(pcLicense)) {
    return {
      allowed: true,
      badgeText: 'FREE BYPASS (Payment OFF for this PC)',
      reason: 'Admin disabled payment requirement for this PC',
      daysRemaining: 9999
    };
  }

  if (!policy || policy.mode === 'FREE_FOR_ALL') {
    return {
      allowed: true,
      badgeText: `FREE ACCESS (₹${policy?.monthlyPriceInr ?? 10}/Mo Future Plan)`,
      reason: 'Currently Free for all operators',
      daysRemaining: 999
    };
  }

  if (!pcLicense || pcLicense.status === 'REVOKED') {
    return {
      allowed: false,
      badgeText: `PAYMENT REQUIRED (₹${policy.monthlyPriceInr}/${policy.durationDays}d)`,
      reason: pcLicense?.status === 'REVOKED' ? 'License revoked by Admin' : 'No active monthly subscription',
      daysRemaining: 0
    };
  }

  const expiryMs = Date.parse(pcLicense.validUntilIso || '');
  if (Number.isNaN(expiryMs) || expiryMs <= nowMs || pcLicense.status === 'EXPIRED') {
    return {
      allowed: false,
      badgeText: `EXPIRED (Renew ₹${policy.monthlyPriceInr}/${policy.durationDays}d)`,
      reason: '30-day validity expired',
      daysRemaining: 0
    };
  }

  const daysRemaining = Math.max(1, Math.ceil((expiryMs - nowMs) / (86400 * 1000)));
  return {
    allowed: true,
    badgeText: `ACTIVE (₹${pcLicense.amountInr}/30d • ${daysRemaining}d left)`,
    reason: 'Paid subscription active',
    daysRemaining
  };
}

