export interface VersionMetadata {
  appName?: string;
  currentVersion?: string;
  latestVersion?: string;
  versionCode?: number;
  downloadUrl?: string;
  releaseNotes?: string;
  updateRequired?: boolean;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
  updateRequired?: boolean;
}

export const VERSION_HISTORY = [
  {
    version: 'v1.0.6',
    date: 'October 2026',
    changes: [
      'Unified 16-Step C# Deployment Engine & Live Telemetry Synchronized',
      'Prerequisite Auto-Detection: Skips .NET 4.8, VC++, and DigiSigner if already installed',
      'Instant Live Error Telemetry & Telegram Alert Dispatch on exception',
      'Cleaned up legacy Add/Remove Programs Control Panel entries & shortcut duplicates',
      'Edge IE Mode & Zone 2 ActiveX Policies automatically enforced',
    ]
  },
  {
    version: 'v1.0.4',
    date: 'October 2026',
    changes: [
      'Added legacy Windows 7 & 8 support via .NET 4.8 Architecture',
      'Bundled Universal CRT auto-repair in setup package',
      'Enabled detailed startup logging for diagnostic readiness',
      'Enforced TLS 1.2 secure handshake for government networks',
      'Added support for Longmai mToken (Class 3) - FIPS 140-3 Level 3',
      'Fixed telemetry report delivery issues for corporate firewalls',
      'Integrated live Website Posts / News Feed into C# Dashboard',
      'Automated CSP registry repairs for consistent token handshake',
    ]
  },
  {
    version: 'v1.0.1',
    date: 'September 2026',
    changes: [
      'Stable Official Release - Integrated ActiveX Auto-Heal',
      'Central Monitoring Gateway established',
    ]
  },
  {
    version: 'V3.5',
    date: 'August 2026',
    changes: [
      'Added Central Cloud Telemetry Dashboard & Logs',
      'Integrated Gemini AI 3.6 Diagnostic Engine',
      'Improved WD ProxKey and HYP2003 DSC driver compatibility',
    ]
  },
  {
    version: 'V3.0',
    date: 'June 2026',
    changes: [
      'Full architectural rewrite in React + Vite and C# .NET 4.8',
      'Added One-Click Deployment for UBD, eGramSwaraj, and IFMIS',
      'Automated Zone 2 Registry ActiveX security configurations',
    ]
  },
  {
    version: 'V1.0',
    date: 'January 2026',
    changes: [
      'Initial release of E-Vedhika UBD Deployment Tool',
      'Basic Internet Explorer 11 compatibility mode',
    ]
  }
];

export const CURRENT_APP_VERSION = 'v1.0.6';
export const DEFAULT_GITHUB_RAW_URL = 'https://github.com/RakeshKumardhawan/UBDTOOLS/releases/tag/latest';

/**
 * Parses version string into numeric weight for comparison (e.g. "V1.0.0" -> 1000, "V1.0" -> 10000)
 */
export function parseVersionWeight(versionStr: string): number {
  if (!versionStr) return 10000;
  const clean = versionStr.replace(/[^0-9.]/g, '');
  const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
  const major = parts[0] || 1;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  return major * 10000 + minor * 100 + patch;
}

/**
 * Utility function to fetch version metadata from GitHub Raw URL or server API endpoint.
 */
export async function checkForUpdates(
  customUrl?: string,
  currentVer: string = CURRENT_APP_VERSION
): Promise<UpdateCheckResult> {
  const githubUrl = customUrl || DEFAULT_GITHUB_RAW_URL;

  try {
    // Try GitHub raw URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    let res = await fetch(githubUrl, { cache: 'no-cache', signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);

    // Fallback to local API endpoint if GitHub raw URL is unreachable
    if (!res || !res.ok) {
      res = await fetch('/api/version', { cache: 'no-cache' }).catch(() => null);
    }

    if (res && res.ok) {
      const data: VersionMetadata = await res.json();
      const latestVer = data.latestVersion || data.currentVersion || CURRENT_APP_VERSION;

      const latestWeight = parseVersionWeight(latestVer);
      const currentWeight = parseVersionWeight(currentVer);

      const hasUpdate = latestWeight > currentWeight || Boolean(data.updateRequired);

      return {
        hasUpdate,
        currentVersion: currentVer,
        latestVersion: latestVer,
        downloadUrl: data.downloadUrl || 'https://www.e-vedhika.in/EVedhikaUBDDeploymentTool_CSharp_Solution.zip',
        releaseNotes: data.releaseNotes || 'Includes ActiveX policies, DSC drivers, and live cloud telemetry.',
        updateRequired: data.updateRequired || false,
      };
    }
  } catch (error) {
    console.warn('Update check failed, using local version configuration:', error);
  }

  // Graceful fallback
  return {
    hasUpdate: false,
    currentVersion: currentVer,
    latestVersion: currentVer,
    downloadUrl: 'https://www.e-vedhika.in/EVedhikaUBDDeploymentTool_CSharp_Solution.zip',
    releaseNotes: 'You are using the latest stable version.',
  };
}
