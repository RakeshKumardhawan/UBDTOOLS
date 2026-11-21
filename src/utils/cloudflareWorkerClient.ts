import { LicensePolicyConfig, PcLicenseRecord, PaymentClaimRecord, DEFAULT_LICENSE_POLICY } from './licensePolicy';

export const CLOUDFLARE_WORKER_DASHBOARD_URL =
  'https://dash.cloudflare.com/8ace4e3f2324eda23d28f8e8ddd1ffb4/workers/services/view/ubdtools/production';

export const DEFAULT_CLOUDFLARE_WORKER_URL = 'https://ubdtools.rakeshkumardhawan123.workers.dev';

export const CLOUDFLARE_WORKER_STORAGE_KEY = 'evedhika_cf_worker_url_v1';

export function normalizeCloudflareWorkerUrl(raw: string): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if (!parsed.hostname || parsed.hostname.includes('dash.cloudflare.com')) {
      return '';
    }
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function isDashboardLinkNotWorkerUrl(raw: string): boolean {
  return /dash\.cloudflare\.com/i.test(String(raw || ''));
}

export function getSavedCloudflareWorkerUrl(): string {
  try {
    const saved = window.localStorage.getItem(CLOUDFLARE_WORKER_STORAGE_KEY) || '';
    return normalizeCloudflareWorkerUrl(saved);
  } catch {
    return '';
  }
}

export function saveCloudflareWorkerUrl(raw: string): string {
  const normalized = normalizeCloudflareWorkerUrl(raw);
  try {
    if (normalized) {
      window.localStorage.setItem(CLOUDFLARE_WORKER_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(CLOUDFLARE_WORKER_STORAGE_KEY);
    }
  } catch {}
  return normalized;
}

export async function discoverCloudflareWorkerUrl(): Promise<string> {
  const saved = getSavedCloudflareWorkerUrl();
  if (saved) return saved;
  try {
    const base = (import.meta as any).env?.BASE_URL || '/';
    const manifestUrl = `${base.replace(/\/$/, '')}/version.json?t=${Date.now()}`;
    const resp = await fetch(manifestUrl, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      const fromManifest = normalizeCloudflareWorkerUrl(data?.cloudflareWorkerUrl || '');
      if (fromManifest) return fromManifest;
    }
  } catch {}
  return DEFAULT_CLOUDFLARE_WORKER_URL;
}

export interface WorkerHealthResult {
  ok: boolean;
  kvBound: boolean;
  service: string;
  version: string;
  hint: string;
  error?: string;
}

export async function checkCloudflareWorkerHealth(workerUrl: string): Promise<WorkerHealthResult> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  if (!base) {
    return {
      ok: false,
      kvBound: false,
      service: '',
      version: '',
      hint: '',
      error: 'Invalid Worker URL. Use your live workers.dev URL (e.g. https://ubdtools.<subdomain>.workers.dev).'
    };
  }
  try {
    const resp = await fetch(`${base}/api/health?t=${Date.now()}`, { cache: 'no-store' });
    const data = await resp.json();
    if (!resp.ok || !data?.ok) {
      return {
        ok: false,
        kvBound: false,
        service: '',
        version: '',
        hint: '',
        error: data?.message || data?.error || `HTTP ${resp.status}`
      };
    }
    return {
      ok: true,
      kvBound: Boolean(data.kvBound),
      service: String(data.service || 'ubdtools-cloudflare-worker'),
      version: String(data.version || '1.0.0'),
      hint: String(data.hint || '')
    };
  } catch (err: any) {
    return {
      ok: false,
      kvBound: false,
      service: '',
      version: '',
      hint: '',
      error: err?.message || 'Failed to connect to Cloudflare Worker'
    };
  }
}

export interface WorkerPublicCheckResult {
  policy: LicensePolicyConfig;
  pcLicense: PcLicenseRecord | null;
  kvBound: boolean;
}

export async function fetchWorkerPublicCheck(
  workerUrl: string,
  pcId?: string
): Promise<WorkerPublicCheckResult | null> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  if (!base) return null;
  const qs = pcId ? `?pcId=${encodeURIComponent(pcId)}&t=${Date.now()}` : `?t=${Date.now()}`;
  const resp = await fetch(`${base}/api/license/check${qs}`, { cache: 'no-store' });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data?.ok) return null;

  const p = data.policy || data;
  const policy: LicensePolicyConfig = {
    policyId: 'licensing',
    mode: p.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL',
    monthlyPriceInr: Number(p.monthlyPriceInr ?? 10),
    durationDays: Number(p.durationDays ?? 30),
    upiId: String(p.upiId || ''),
    paymentLinkUrl: String(p.paymentLinkUrl || ''),
    paymentNote: String(p.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote)
  };

  const rawPc = data.pcLicense;
  const pcLicense: PcLicenseRecord | null =
    rawPc && rawPc.pcId
      ? {
          pcId: String(rawPc.pcId),
          pcName: String(rawPc.pcName || ''),
          planType: rawPc.planType === 'FREE_ACCESS' ? 'FREE_ACCESS' : 'PAID_30_DAYS',
          status: rawPc.status || 'ACTIVE',
          amountInr: Number(rawPc.amountInr ?? 0),
          validUntilIso: String(rawPc.validUntilIso || ''),
          paymentRef: String(rawPc.paymentRef || '')
        }
      : null;

  return { policy, pcLicense, kvBound: Boolean(data.kvBound) };
}

export async function submitWorkerUtrClaim(
  workerUrl: string,
  payload: {
    utrNumber: string;
    pcId: string;
    pcName: string;
    operatorName: string;
    district: string;
    state: string;
    amountInr: number;
    note?: string;
    skipTelegram?: boolean;
  }
): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  if (!base) return { ok: false, error: 'Worker URL not configured' };

  const resp = await fetch(`${base}/api/license/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(() => ({}));
  if (resp.status === 409 || data?.error === 'ALREADY_EXISTS') {
    return { ok: false, duplicate: true, error: data?.message || 'Duplicate UTR' };
  }
  if (!resp.ok || !data?.ok) {
    return { ok: false, error: data?.message || data?.error || `HTTP ${resp.status}` };
  }
  return { ok: true };
}

export interface WorkerAdminState {
  policy: LicensePolicyConfig;
  pcLicenses: Record<string, PcLicenseRecord>;
  claims: PaymentClaimRecord[];
  syncedAt: string;
}

export async function fetchWorkerAdminState(
  workerUrl: string,
  idToken: string
): Promise<WorkerAdminState> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/state?t=${Date.now()}`, {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: 'no-store'
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return {
    policy: {
      policyId: 'licensing',
      mode: data.policy?.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL',
      monthlyPriceInr: Number(data.policy?.monthlyPriceInr ?? 10),
      durationDays: Number(data.policy?.durationDays ?? 30),
      upiId: String(data.policy?.upiId || ''),
      paymentLinkUrl: String(data.policy?.paymentLinkUrl || ''),
      paymentNote: String(data.policy?.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote)
    },
    pcLicenses: data.pcLicenses || {},
    claims: Array.isArray(data.claims) ? data.claims : [],
    syncedAt: String(data.syncedAt || '')
  };
}

export async function saveWorkerPolicy(
  workerUrl: string,
  idToken: string,
  policy: LicensePolicyConfig
): Promise<LicensePolicyConfig> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/policy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(policy)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return data.policy;
}

export async function saveWorkerPcLicense(
  workerUrl: string,
  idToken: string,
  record: PcLicenseRecord
): Promise<PcLicenseRecord> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/pc-license`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(record)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return data.pcLicense;
}

export async function reviewWorkerClaim(
  workerUrl: string,
  idToken: string,
  payload: {
    claimId: string;
    decision: 'APPROVED' | 'REJECTED';
    utrNumber: string;
    pcId: string;
    pcName: string;
    operatorName?: string;
    district?: string;
    state?: string;
    amountInr?: number;
    durationDays?: number;
    validUntilIso?: string;
    note?: string;
  }
): Promise<{ claim: PaymentClaimRecord; pcLicense: PcLicenseRecord | null }> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/claim-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return { claim: data.claim, pcLicense: data.pcLicense || null };
}

export async function resetWorkerPcLicense(
  workerUrl: string,
  idToken: string,
  pcId: string,
  pcName?: string
): Promise<{ ok: boolean; mode: 'kv-deleted' | 'kv-reset-fallback'; fallbackRecord?: PcLicenseRecord }> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/pc-license/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ pcId })
  });

  if (resp.status === 404) {
    // Graceful compatibility if live Cloudflare Worker is still on v1.0.0 before Admin clicks Deploy:
    // Clear Free Bypass / Active Paid immediately by writing a clean EXPIRED reset record.
    const fallbackRecord: PcLicenseRecord = {
      pcId,
      pcName: String(pcName || pcId).trim().slice(0, 128),
      planType: 'PAID_30_DAYS',
      status: 'EXPIRED',
      amountInr: 0,
      validUntilIso: new Date(Date.now() - 60000).toISOString(),
      paymentRef: 'TRIAL_RESET_BY_ADMIN'
    };
    await saveWorkerPcLicense(base, idToken, fallbackRecord);
    return { ok: true, mode: 'kv-reset-fallback', fallbackRecord };
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return { ok: true, mode: 'kv-deleted' };
}

export async function resetMultipleWorkerPcLicenses(
  workerUrl: string,
  idToken: string,
  pcs: Array<{ pcId: string; pcName?: string }>
): Promise<{ ok: boolean; mode: 'kv-deleted' | 'kv-reset-fallback'; count: number }> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const pcIds = pcs.map((p) => p.pcId).filter(Boolean);
  if (pcIds.length === 0) return { ok: true, mode: 'kv-deleted', count: 0 };

  const resp = await fetch(`${base}/api/admin/pc-license/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ pcIds })
  });

  if (resp.status === 404) {
    for (const pc of pcs) {
      if (!pc.pcId) continue;
      await resetWorkerPcLicense(base, idToken, pc.pcId, pc.pcName);
    }
    return { ok: true, mode: 'kv-reset-fallback', count: pcIds.length };
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return { ok: true, mode: 'kv-deleted', count: Number(data.resetCount ?? pcIds.length) };
}

export async function deleteWorkerClaim(
  workerUrl: string,
  idToken: string,
  claimId: string
): Promise<{ ok: boolean; supported: boolean }> {
  const base = normalizeCloudflareWorkerUrl(workerUrl);
  const resp = await fetch(`${base}/api/admin/claim/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ claimId })
  });
  if (resp.status === 404) {
    return { ok: false, supported: false };
  }
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `Worker HTTP ${resp.status}`);
  }
  return { ok: true, supported: true };
}

