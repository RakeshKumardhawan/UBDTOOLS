export type UbdStateKey = 'Telangana' | 'Andhra Pradesh';

export const TELANGANA_UBD_SITES: readonly string[] = [
  'https://ubd.telangana.gov.in/',
  'https://ubd.telangana.gov.in/login.do',
  'ubd.telangana.gov.in',
];

export const ANDHRA_PRADESH_UBD_SITES: readonly string[] = [
  'http://www.ubd.ap.gov.in:8080/UBDNEW/',
  'www.ubd.ap.gov.in:8080/UBDNEW',
  'www.ubd.ap.gov.in:8080',
  'www.ubd.ap.gov.in',
  'ubd.ap.gov.in',
];

const EXCLUDED_DOMAIN_PATTERNS = [
  'e-vedhika.in',
  'pfms.nic.in',
  'egramswaraj.gov.in',
  'ifmis.telangana.gov.in',
  'treasury.telangana.gov.in',
];

export function resolveUbdState(input?: string | null): UbdStateKey {
  const normalized = (input ?? '').trim().toLowerCase();
  if (
    normalized.includes('andhra') ||
    normalized === 'ap' ||
    normalized.includes('ubd_portal_ap') ||
    normalized.includes('ubd-portal-ap') ||
    normalized.includes('ap.gov.in')
  ) {
    return 'Andhra Pradesh';
  }
  return 'Telangana';
}

export function getStateUbdSiteList(stateInput?: string | null): string[] {
  const state = resolveUbdState(stateInput);
  return state === 'Andhra Pradesh'
    ? [...ANDHRA_PRADESH_UBD_SITES]
    : [...TELANGANA_UBD_SITES];
}

export function getStateDefaultCompatMode(stateInput?: string | null): 'IE5' | 'IE7' {
  return resolveUbdState(stateInput) === 'Andhra Pradesh' ? 'IE7' : 'IE5';
}

export function filterSitesForState(stateInput: string | null | undefined, sites: string[]): string[] {
  const state = resolveUbdState(stateInput);
  const oppositePattern = state === 'Andhra Pradesh' ? 'telangana.gov.in' : 'ap.gov.in';

  const seen = new Set<string>();
  const clean: string[] = [];

  for (const raw of sites) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();

    if (lower.includes(oppositePattern)) continue;
    if (EXCLUDED_DOMAIN_PATTERNS.some((pattern) => lower.includes(pattern))) continue;

    if (!seen.has(lower)) {
      seen.add(lower);
      clean.push(trimmed);
    }
  }

  return clean;
}

export function buildStateSiteListXml(
  stateInput: string | null | undefined,
  sites?: string[],
  compatModeOverride?: 'IE5' | 'IE7' | 'IE8Enterprise' | 'IE11'
): string {
  const state = resolveUbdState(stateInput);
  const compatMode = compatModeOverride ?? getStateDefaultCompatMode(state);
  const stateLabel = state === 'Andhra Pradesh' ? 'Andhra Pradesh UBD' : 'Telangana UBD';
  const targetSites = filterSitesForState(
    state,
    sites && sites.length > 0 ? sites : getStateUbdSiteList(state)
  );

  const entries = targetSites
    .map(
      (site) => `  <site url="${site}">
    <compat-mode>${compatMode}</compat-mode>
    <open-in>IE11</open-in>
  </site>`
    )
    .join('\n');

  return `<site-list version="2">
  <created-by>
    <tool>E-Vedhika UBD C# Deployment Tool (${stateLabel})</tool>
  </created-by>
${entries}
</site-list>`;
}
