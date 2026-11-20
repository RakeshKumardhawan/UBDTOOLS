export const GITHUB_ADMIN_LIVE_LINK = 'https://rakeshkumardhawan.github.io/UBDTOOLS/admin/';

const DIRECT_TABS = [
  'dashboard', 'posts', 'post-detail', 'deploy', 'csharp', 'repair', 'diagnostics', 'remote',
  'drivers', 'browser', 'registry', 'auditor', 'dsc', 'ai',
  'downloads', 'backups', 'pcboost', 'settings', 'help', 'about', 'telemetry-dashboard', 'report-center', 'pay-checkout', 'admin-portal'
] as const;

export interface ResolvedUrlRoute {
  tab: string | null;
  slug?: string;
  adminSection?: 'reports' | 'payments';
}

/**
 * Resolves navigation tab from pathname, search query, or hash fragment
 * across both root deployments (/) and GitHub Pages subpath (/UBDTOOLS/).
 */
export function resolveRouteFromLocation(pathname: string, search: string, hash: string = ''): ResolvedUrlRoute {
  const lowerPath = (pathname || '').toLowerCase();
  const lowerHash = (hash || '').toLowerCase();
  const combinedPath = `${lowerPath} ${lowerHash}`;

  // Handle GitHub Pages query-encoded path (?/live-pc-reports or ?/admin/) if not yet history-replaced
  let decodedSearchPath = '';
  let decodedQueryParams = '';
  if (search && search.startsWith('?/')) {
    const [pathPart, ...rest] = search.slice(1).split('&');
    decodedSearchPath = (pathPart || '').toLowerCase();
    if (rest.length > 0) {
      decodedQueryParams = rest.join('&').replace(/~and~/g, '&');
    }
  }
  const routeSurface = `${combinedPath} ${decodedSearchPath}`;
  const effectiveSearch = decodedQueryParams ? `?${decodedQueryParams}` : (search || '');
  const params = new URLSearchParams(effectiveSearch);

  const cleanNoTrailingSlash = lowerPath.replace(/\/+$/, '');
  const cleanSearchPath = decodedSearchPath.replace(/\/+$/, '');
  const cleanHash = lowerHash.replace(/\/+$/, '');
  const tabQuery = (params.get('tab') || params.get('view') || '').toLowerCase();

  const isLegacyTelemetryAdminSubpath =
    cleanNoTrailingSlash.includes('/admin/ubd') ||
    cleanNoTrailingSlash.includes('/admin/telemetry') ||
    cleanNoTrailingSlash.includes('/admin/monitoring') ||
    cleanSearchPath.includes('/admin/ubd') ||
    cleanSearchPath.includes('/admin/telemetry') ||
    cleanSearchPath.includes('/admin/monitoring');

  const isDedicatedAdminRoot =
    !isLegacyTelemetryAdminSubpath &&
    (cleanNoTrailingSlash === '/admin' ||
      cleanNoTrailingSlash === '/admin/index.html' ||
      cleanNoTrailingSlash === '/admin/reports' ||
      cleanNoTrailingSlash === '/admin/payments' ||
      cleanNoTrailingSlash === '/ubdtools/admin' ||
      cleanNoTrailingSlash === '/ubdtools/admin/index.html' ||
      cleanNoTrailingSlash === '/ubdtools/admin/reports' ||
      cleanNoTrailingSlash === '/ubdtools/admin/payments' ||
      cleanSearchPath === '/admin' ||
      cleanSearchPath === '/admin/reports' ||
      cleanSearchPath === '/admin/payments' ||
      cleanHash === '#/admin' ||
      cleanHash === '#/admin/reports' ||
      cleanHash === '#/admin/payments' ||
      tabQuery === 'admin-portal');

  if (isDedicatedAdminRoot) {
    const secParam = (params.get('section') || '').toLowerCase();
    const isPaymentsSection =
      cleanNoTrailingSlash.endsWith('/admin/payments') ||
      cleanSearchPath.endsWith('/admin/payments') ||
      cleanHash.endsWith('/admin/payments') ||
      secParam === 'payments' ||
      secParam === 'admin-license' ||
      params.get('pay') === '1';

    return {
      tab: 'admin-portal',
      adminSection: isPaymentsSection ? 'payments' : 'reports'
    };
  }

  if (
    params.get('pay') === '1' ||
    Boolean(params.get('pcId')) ||
    lowerPath.endsWith('/pay') ||
    routeSurface.includes('pay-checkout') ||
    routeSurface.includes('payment-hub')
  ) {
    return { tab: 'pay-checkout' };
  }

  if (
    routeSurface.includes('live-pc-reports') ||
    routeSurface.includes('admin-live-reports') ||
    routeSurface.includes('report-center') ||
    (routeSurface.includes('/admin') && !isLegacyTelemetryAdminSubpath)
  ) {
    return { tab: 'admin-portal', adminSection: 'reports' };
  }

  if (routeSurface.includes('version-fleet') || routeSurface.includes('fleet') || routeSurface.includes('v1-fleet')) {
    return { tab: 'version-fleet' };
  }

  if (
    routeSurface.includes('telemetry') ||
    routeSurface.includes('monitoring') ||
    routeSurface.includes('ubd_monitoring') ||
    routeSurface.includes('ubdlivemonitoring') ||
    routeSurface.includes('/admin/ubd') ||
    routeSurface.includes('/admin/telemetry') ||
    routeSurface.includes('/admin/monitoring') ||
    routeSurface.includes('telemetry-dashboar') ||
    routeSurface.includes('telemetry-dashboard')
  ) {
    return { tab: 'telemetry-dashboard' };
  }

  if (lowerPath.includes('/post/')) {
    const parts = (pathname || '').split('/post/');
    if (parts[1]) {
      const cleanSlug = parts[1].replace(/\/$/, '');
      return {
        tab: 'post-detail',
        slug: cleanSlug || 'ubd-setting-issues-one-click-all-in-one-setup'
      };
    }
  }

  const slugParam = params.get('slug') || params.get('postId');
  if (slugParam && !lowerPath.includes('monitoring') && !lowerPath.includes('telemetry')) {
    return { tab: 'post-detail', slug: slugParam };
  }

  const tabParam = params.get('tab') || params.get('view');
  if (tabParam) {
    const normalized = tabParam.toLowerCase();
    if (
      normalized === 'pay-checkout' ||
      normalized === 'payment' ||
      normalized === 'payment-hub' ||
      normalized === 'license' ||
      normalized === 'licensing'
    ) {
      return { tab: 'pay-checkout' };
    }
    if (
      normalized === 'report-center' ||
      normalized === 'live-pc-reports' ||
      normalized === 'live-reports'
    ) {
      return { tab: 'admin-portal', adminSection: 'reports' };
    }
    if (
      normalized.includes('monitoring') ||
      normalized.includes('telemetry') ||
      normalized === 'ubd_monitoring' ||
      normalized === 'ubdlivemonitoring' ||
      normalized === 'livemonitoring'
    ) {
      return { tab: 'telemetry-dashboard' };
    }
    if (
      normalized === 'admin/post' ||
      normalized === 'admin/posts' ||
      normalized === 'post' ||
      normalized === 'posts' ||
      normalized === 'publisher' ||
      normalized === 'announcements'
    ) {
      return { tab: 'posts' };
    }
    if (normalized === 'post-detail' || normalized === 'article') {
      return { tab: 'post-detail' };
    }
    if ((DIRECT_TABS as readonly string[]).includes(normalized)) {
      return { tab: normalized };
    }
  }

  return { tab: null };
}
