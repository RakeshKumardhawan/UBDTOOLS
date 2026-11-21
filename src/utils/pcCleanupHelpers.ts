export interface InstalledPcLike {
  pcId: string;
  pcName?: string;
  userName?: string;
  district?: string;
  state?: string;
  officeLocation?: string;
  isOnline?: boolean;
  healthScore?: number;
  lastSeenEpoch?: number;
  lastSeenAt?: string;
  appVersion?: string;
  [key: string]: any;
}

export interface ReportEventLike {
  eventId?: string;
  reportId?: string;
  reportType?: string;
  pcId?: string;
  pcName?: string;
  appVersion?: string;
  timestampUtc?: string;
  timestampIst?: string;
  [key: string]: any;
}

export interface DuplicatePcGroup<T extends InstalledPcLike = InstalledPcLike> {
  groupKey: string;
  displayName: string;
  primary: T;
  duplicates: T[];
}

export interface DuplicatePcAnalysis<T extends InstalledPcLike = InstalledPcLike> {
  groups: DuplicatePcGroup<T>[];
  duplicatePcIds: Set<string>;
  primaryPcIds: Set<string>;
  allInvolvedPcIds: Set<string>;
  duplicateCount: number;
}

export interface DuplicateReportAnalysis {
  duplicateReportIds: Set<string>;
  duplicateCount: number;
}

const GENERIC_PC_NAMES = new Set([
  '',
  'PC',
  'COMPUTER',
  'GP-OFFICE-PC',
  'GPOFFICEPC',
  'OFFICE-PC',
  'OFFICEPC',
  'DESKTOP',
  'LAPTOP',
  'UNKNOWN',
  'OPERATOR',
  'LOCALHOST',
  'ADMIN',
  'USER',
  'WEB-PORTAL-USER'
]);

const TRIAL_DUMMY_PATTERN =
  /\b(DUMMY|MOCK|SAMPLE|TEST[-_ ]?PC|TRIAL[-_ ]?PC|DEMO[-_ ]?PC|FAKE[-_ ]?PC|VERIFY_SCHEMA|WEB-PORTAL-USER)\b/i;

export function normalizePcIdentityToken(raw?: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isGenericPcName(pcName?: string): boolean {
  const token = normalizePcIdentityToken(pcName);
  return GENERIC_PC_NAMES.has(token);
}

export function isTrialOrDummyPc(pc: InstalledPcLike): boolean {
  const haystack = [pc.pcId, pc.pcName, pc.officeLocation, pc.userName]
    .map((v) => String(v || '').trim())
    .join(' ');
  return TRIAL_DUMMY_PATTERN.test(haystack);
}

function getPcPriorityScore(pc: InstalledPcLike): [number, number, number, number] {
  const onlineScore = pc.isOnline ? 1 : 0;
  const canonicalIdScore = /^EVD-/i.test(String(pc.pcId || '').trim()) ? 1 : 0;
  const epochScore = Number(pc.lastSeenEpoch) || Date.parse(String(pc.lastSeenAt || '')) || 0;
  const healthScore = Number(pc.healthScore) || 0;
  return [onlineScore, canonicalIdScore, Number.isFinite(epochScore) ? epochScore : 0, healthScore];
}

function comparePcPriorityDesc(a: InstalledPcLike, b: InstalledPcLike): number {
  const sa = getPcPriorityScore(a);
  const sb = getPcPriorityScore(b);
  for (let i = 0; i < sa.length; i++) {
    if (sb[i] !== sa[i]) return sb[i] - sa[i];
  }
  return String(a.pcId || '').localeCompare(String(b.pcId || ''));
}

/**
 * Detects Double-Report PCs ("డబుల్ రిపోర్ట్ PCలు"):
 * - Specific PC names (e.g. "ROSI", "DESKTOP-4H2K") appearing under 2+ distinct pcIds
 * - Generic PC names (e.g. "GP-OFFICE-PC") only when officeLocation + district + userName also match
 * Keeps the highest-priority (online / canonical EVD- ID / newest) record as Primary and marks older ones as Duplicates.
 */
export function findDuplicateInstalledPcs<T extends InstalledPcLike>(pcs: T[]): DuplicatePcAnalysis<T> {
  const buckets = new Map<string, { displayName: string; items: T[] }>();

  for (const pc of pcs || []) {
    const cleanId = String(pc?.pcId || '').trim();
    if (!cleanId) continue;

    const nameToken = normalizePcIdentityToken(pc.pcName);
    let groupKey = '';
    let displayName = String(pc.pcName || cleanId).trim();

    if (nameToken && !isGenericPcName(pc.pcName)) {
      groupKey = `NAME:${nameToken}`;
    } else {
      const officeToken = normalizePcIdentityToken(pc.officeLocation);
      const districtToken = normalizePcIdentityToken(pc.district);
      const userToken = normalizePcIdentityToken(pc.userName);
      if (officeToken && officeToken !== 'GRAMA-PANCHAYAT-OFFICE' && officeToken !== 'GRAM-PANCHAYAT-OFFICE') {
        groupKey = `OFFICE:${nameToken || 'PC'}|${districtToken}|${officeToken}|${userToken}`;
        displayName = `${pc.pcName || 'PC'} (${pc.officeLocation})`;
      } else {
        // Cannot safely assume two unrelated generic offices are duplicates
        groupKey = `ID:${cleanId.toUpperCase()}`;
      }
    }

    const bucket = buckets.get(groupKey);
    if (bucket) {
      bucket.items.push(pc);
    } else {
      buckets.set(groupKey, { displayName, items: [pc] });
    }
  }

  const groups: DuplicatePcGroup<T>[] = [];
  const duplicatePcIds = new Set<string>();
  const primaryPcIds = new Set<string>();
  const allInvolvedPcIds = new Set<string>();

  for (const [groupKey, bucket] of buckets.entries()) {
    if (bucket.items.length < 2) continue;
    const sorted = [...bucket.items].sort(comparePcPriorityDesc);
    const [primary, ...duplicates] = sorted;
    groups.push({
      groupKey,
      displayName: bucket.displayName,
      primary,
      duplicates
    });
    primaryPcIds.add(String(primary.pcId));
    allInvolvedPcIds.add(String(primary.pcId));
    for (const dup of duplicates) {
      duplicatePcIds.add(String(dup.pcId));
      allInvolvedPcIds.add(String(dup.pcId));
    }
  }

  return {
    groups,
    duplicatePcIds,
    primaryPcIds,
    allInvolvedPcIds,
    duplicateCount: duplicatePcIds.size
  };
}

function extractReportYmd(r: ReportEventLike): string {
  const iso = String(r.timestampUtc || '');
  const isoMatch = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const parsed = Date.parse(String(r.timestampUtc || r.timestampIst || ''));
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return 'UNKNOWN';
}

function getReportTimestampMs(r: ReportEventLike): number {
  const ms = Date.parse(String(r.timestampUtc || r.timestampIst || ''));
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Detects duplicate report event rows for the same PC + reportType + appVersion on the same day.
 * Keeps the most recent event and marks older duplicate log entries for safe deletion.
 */
export function findDuplicateReportEvents(reports: ReportEventLike[]): DuplicateReportAnalysis {
  const buckets = new Map<string, ReportEventLike[]>();

  for (const r of reports || []) {
    const id = String(r.reportId || r.eventId || '').trim();
    if (!id) continue;
    const pcKey = normalizePcIdentityToken(r.pcId || r.pcName);
    const typeKey = normalizePcIdentityToken(r.reportType || 'REPORT');
    const verKey = normalizePcIdentityToken(r.appVersion || 'V1');
    const ymd = extractReportYmd(r);
    if (!pcKey) continue;

    const key = `${pcKey}|${typeKey}|${verKey}|${ymd}`;
    const list = buckets.get(key);
    if (list) list.push(r);
    else buckets.set(key, [r]);
  }

  const duplicateReportIds = new Set<string>();
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => getReportTimestampMs(b) - getReportTimestampMs(a));
    for (let i = 1; i < sorted.length; i++) {
      const id = String(sorted[i].reportId || sorted[i].eventId || '').trim();
      if (id) duplicateReportIds.add(id);
    }
  }

  return {
    duplicateReportIds,
    duplicateCount: duplicateReportIds.size
  };
}
