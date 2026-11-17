export const GITHUB_ADMIN_LIVE_LINK = 'https://rakeshkumardhawan.github.io/UBDTOOLS/live-pc-reports';

const DIRECT_TABS = [
  'dashboard', 'posts', 'post-detail', 'deploy', 'csharp', 'repair', 'diagnostics', 'remote',
  'drivers', 'browser', 'registry', 'auditor', 'dsc', 'ai',
  'downloads', 'backups', 'pcboost', 'settings', 'help', 'about', 'telemetry-dashboard', 'report-center', 'pay-checkout'
] as const;

export interface ResolvedUrlRoute {
  tab: string | null;
  slug?: string;
}

/**
 * Resolves navigation tab from pathname, search query, or hash fragment
 * across both root deployments (/) and GitHub Pages subpath (/UBDTOOLS/).
 */
export function resolveRouteFromLocation(pathname: string, search: string, hash: string = ''): ResolvedUrlRoute {
  const lowerPath = (pathname || '').toLowerCase();
  const lowerHash = (hash || '').toLowerCase();
  const combinedPath = `${lowerPath} ${lowerHash}`;

  // Handle GitHub Pages query-encoded path (?/live-pc-reports) if not yet history-replaced
  let decodedSearchPath = '';
  if (search && search.startsWith('?/')) {
    decodedSearchPath = search.slice(1).split('&')[0].toLowerCase();
  }
  const routeSurface = `${combinedPath} ${decodedSearchPath}`;

  if (
    routeSurface.includes('live-pc-reports') ||
    routeSurface.includes('admin-live-reports') ||
    routeSurface.includes('report-center') ||
    routeSurface.includes('/admin')
  ) {
    return { tab: 'report-center' };
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

  const params = new URLSearchParams(search || '');
  if (params.get('pay') === '1' || lowerPath.endsWith('/pay') || lowerPath.includes('pay-checkout')) {
    return { tab: 'report-center' };
  }

  const slugParam = params.get('slug') || params.get('postId');
  if (slugParam && !lowerPath.includes('monitoring') && !lowerPath.includes('telemetry')) {
    return { tab: 'post-detail', slug: slugParam };
  }

  const tabParam = params.get('tab') || params.get('view');
  if (tabParam) {
    const normalized = tabParam.toLowerCase();
    if (
      normalized === 'report-center' ||
      normalized === 'live-pc-reports' ||
      normalized === 'live-reports'
    ) {
      return { tab: 'report-center' };
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
