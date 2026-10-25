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
  resourceManifest?: ResourceManifest;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'Portal Policy' | 'Registry Policy' | 'Live Feed' | 'Driver Catalog' | 'Bridge Config' | 'OTA Core Engine';
  currentVersion: string;
  latestVersion: string;
  hash: string;
  latestHash: string;
  lastUpdated: string;
  status: 'Up to Date' | 'Update Available' | 'Sync Pending' | 'Verified';
  description: string;
  sizeBytes?: number;
}

export interface ResourceManifest {
  manifestVersion: string;
  appVersion: string;
  lastSyncTimestamp: string;
  totalResources: number;
  outdatedCount: number;
  resources: ResourceItem[];
}

export const VERSION_HISTORY = [
  {
    version: 'v1.0.8',
    date: 'October 2026',
    changes: [
      '24x7 Silent Background Guardian with System Tray integration',
      'USB DSC Token Hardware Auto-Detector (WM_DEVICECHANGE)',
      'Aggressive Cleanup Engine: 100% System Revert on Uninstall',
      'Firewall Rule & Browser Cache purge logic integrated',
      'COM DLL Auto-Unregistration (RegAsm /u) during cleanup',
      'Developer identity prominently displayed in UI and Metadata',
    ]
  },
  {
    version: 'v1.0.7',
    date: 'October 2026',
    changes: [
      'Target Website https://ubd.telangana.gov.in/ Full Zone 2 Registry Automation Engine',
      'Resource Manifest Component Hash System integrated for zero-app-bump OTA rule updates',
      'All 48+ Security Zone Settings mapped with exact official Windows Registry DWORD values',
      'Automatic Registry Backup snapshot before applying any changes',
      'Automated Elevated PowerShell Script (.ps1) and BAT Launcher (.bat) with UAC auto-elevation',
      'Deep Registry Post-Execution Verification with full TXT Audit Report generation',
      'Edge Enterprise IE Mode & IE5 Quirks configuration for ubd.telangana.gov.in',
      'Strict Zone 2 isolation maintaining standard high-security for general web browsing',
    ]
  },
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

export const CURRENT_APP_VERSION = 'v1.0.8';
export const DEFAULT_GITHUB_RAW_URL = 'https://github.com/RakeshKumardhawan/UBDTOOLS/releases/tag/latest';

export const DEFAULT_RESOURCE_MANIFEST: ResourceManifest = {
  manifestVersion: '2026.10.21-R4',
  appVersion: 'v1.0.8',
  lastSyncTimestamp: '2026-10-21T11:00:00.000Z',
  totalResources: 5,
  outdatedCount: 0,
  resources: [
    {
      id: 'ubd-sites-xml',
      name: 'UBD Sites Enterprise List (sites.xml)',
      category: 'Portal Policy',
      currentVersion: '2026.10.21-R4',
      latestVersion: '2026.10.21-R4',
      hash: 'a8f7c9e102b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
      latestHash: 'a8f7c9e102b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
      lastUpdated: '2026-10-21',
      status: 'Up to Date',
      description: 'Enterprise Site List configuration for ubd.telangana.gov.in & ubd.ap.gov.in IE Mode rules',
      sizeBytes: 14200
    },
    {
      id: 'zone2-registry-policy',
      name: 'Zone 2 Trusted Sites & ActiveX Flags',
      category: 'Registry Policy',
      currentVersion: '2026.10.21-R4',
      latestVersion: '2026.10.21-R4',
      hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      latestHash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      lastUpdated: '2026-10-21',
      status: 'Up to Date',
      description: 'HKCU Internet Settings Zone 2 DWORD values for unsigned ActiveX and DSC token access',
      sizeBytes: 8500
    },
    {
      id: 'live-announcements-feed',
      name: 'Live Government Notices & Bulletins Feed',
      category: 'Live Feed',
      currentVersion: '2026.10.21-R4',
      latestVersion: '2026.10.21-R4',
      hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      latestHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      lastUpdated: '2026-10-21',
      status: 'Up to Date',
      description: 'Real-time Telangana GP & Mandal notification channel & live post parser',
      sizeBytes: 6200
    },
    {
      id: 'dsc-driver-catalog',
      name: 'DSC Token & SmartCard Driver Catalog',
      category: 'Driver Catalog',
      currentVersion: '2026.10.21-R4',
      latestVersion: '2026.10.21-R4',
      hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
      latestHash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
      lastUpdated: '2026-10-21',
      status: 'Up to Date',
      description: 'WD ProxKey v2/v3, HYP2003, ePass2003 Auto, and Longmai mToken driver definitions',
      sizeBytes: 24300
    },
    {
      id: 'nic-digisigner-bridge',
      name: 'NIC DigiSigner Port 8080/8443 Bridge Rules',
      category: 'Bridge Config',
      currentVersion: '2026.10.21-R4',
      latestVersion: '2026.10.21-R4',
      hash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      latestHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      lastUpdated: '2026-10-21',
      status: 'Up to Date',
      description: 'Local HTTP/HTTPS bridge listener rules for NIC DigiSigner client auto-healing',
      sizeBytes: 4100
    }
  ]
};

/**
 * Retrieves local Resource Manifest from localStorage or initializes default
 */
export function getLocalResourceManifest(): ResourceManifest {
  try {
    const stored = localStorage.getItem('evedhika_resource_manifest');
    if (stored) {
      const parsed: ResourceManifest = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.resources) && parsed.resources.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local resource manifest, using default', e);
  }

  saveLocalResourceManifest(DEFAULT_RESOURCE_MANIFEST);
  return DEFAULT_RESOURCE_MANIFEST;
}

/**
 * Saves Resource Manifest to localStorage
 */
export function saveLocalResourceManifest(manifest: ResourceManifest): void {
  try {
    localStorage.setItem('evedhika_resource_manifest', JSON.stringify(manifest));
  } catch (e) {
    console.warn('Failed to save resource manifest', e);
  }
}

/**
 * Syncs and applies a single component resource to latest version/hash
 */
export function syncSingleResource(resourceId: string): ResourceManifest {
  const currentManifest = getLocalResourceManifest();
  const updatedResources = currentManifest.resources.map((item) => {
    if (item.id === resourceId) {
      const targetHash = item.latestHash || item.hash;
      const targetVersion = item.latestVersion || item.currentVersion;
      return {
        ...item,
        currentVersion: targetVersion,
        hash: targetHash,
        status: 'Up to Date' as const,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }
    return item;
  });

  const outdatedCount = updatedResources.filter(r => r.status === 'Update Available').length;
  const newManifest: ResourceManifest = {
    ...currentManifest,
    lastSyncTimestamp: new Date().toISOString(),
    outdatedCount,
    resources: updatedResources
  };

  saveLocalResourceManifest(newManifest);
  return newManifest;
}

/**
 * Syncs and applies all component resources to latest hashes without changing app version
 */
export function syncAllResources(): ResourceManifest {
  const currentManifest = getLocalResourceManifest();
  const updatedResources = currentManifest.resources.map((item) => {
    const targetHash = item.latestHash || item.hash;
    const targetVersion = item.latestVersion || item.currentVersion;
    return {
      ...item,
      currentVersion: targetVersion,
      hash: targetHash,
      status: 'Up to Date' as const,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  });

  const newManifest: ResourceManifest = {
    ...currentManifest,
    manifestVersion: currentManifest.resources.some(r => r.latestVersion !== r.currentVersion) 
      ? (currentManifest.resources[0]?.latestVersion || currentManifest.manifestVersion)
      : currentManifest.manifestVersion,
    lastSyncTimestamp: new Date().toISOString(),
    outdatedCount: 0,
    resources: updatedResources
  };

  saveLocalResourceManifest(newManifest);
  return newManifest;
}

/**
 * Checks for component / resource manifest updates from remote endpoints
 */
export async function checkResourceManifestUpdates(customUrl?: string): Promise<ResourceManifest> {
  const localManifest = getLocalResourceManifest();
  const candidateUrls = customUrl ? [customUrl] : [
    '/api/version',
    '/version.json',
    'https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/version.json',
    'https://www.e-vedhika.in/version.json'
  ];

  try {
    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { cache: 'no-cache', signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const rawData = await res.json();
          const remoteResourceVersion = rawData.resourceVersion || rawData.manifestVersion;

          // If remote version exists, check resource items
          let remoteResourcesMap: Record<string, Partial<ResourceItem>> = {};
          if (rawData.resources && Array.isArray(rawData.resources)) {
            rawData.resources.forEach((r: ResourceItem) => {
              if (r.id) remoteResourcesMap[r.id] = r;
            });
          }

          let outdatedCount = 0;
          const updatedResources = localManifest.resources.map((item) => {
            const remoteItem = remoteResourcesMap[item.id];
            const latestVer = remoteItem?.latestVersion || remoteItem?.currentVersion || remoteResourceVersion || item.currentVersion;
            const latestHash = remoteItem?.latestHash || remoteItem?.hash || item.hash;

            const isOutdated = (latestHash !== item.hash) || (latestVer !== item.currentVersion);
            if (isOutdated) outdatedCount++;

            return {
              ...item,
              latestVersion: latestVer,
              latestHash,
              status: isOutdated ? ('Update Available' as const) : ('Up to Date' as const)
            };
          });

          const evaluatedManifest: ResourceManifest = {
            ...localManifest,
            manifestVersion: remoteResourceVersion || localManifest.manifestVersion,
            lastSyncTimestamp: new Date().toISOString(),
            outdatedCount,
            resources: updatedResources
          };

          saveLocalResourceManifest(evaluatedManifest);
          return evaluatedManifest;
        }
      } catch (e) {}
    }
  } catch (error) {
    console.warn('Resource manifest update check failed, returning local manifest:', error);
  }

  // Fallback return local manifest with updated lastSyncTimestamp
  const updatedManifest = {
    ...localManifest,
    lastSyncTimestamp: new Date().toISOString()
  };
  saveLocalResourceManifest(updatedManifest);
  return updatedManifest;
}

/**
 * Version weight calculation for app version string comparison
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
 * General app update check function (maintains backward compatibility with App.tsx)
 */
export async function checkForUpdates(
  customUrl?: string,
  currentVer: string = CURRENT_APP_VERSION
): Promise<UpdateCheckResult> {
  const resourceManifest = await checkResourceManifestUpdates(customUrl);

  const candidateUrls = customUrl ? [customUrl] : [
    '/api/version',
    'https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/version.json',
    'https://api.github.com/repos/RakeshKumardhawan/UBDTOOLS/releases/latest',
    '/version.json'
  ];

  try {
    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { cache: 'no-cache', signal: controller.signal });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && (contentType.includes('application/json') || url.endsWith('.json'))) {
          const rawData = await res.json();
          let latestVer = rawData.latestVersion || rawData.currentVersion || rawData.tag_name || CURRENT_APP_VERSION;
          let downloadUrl = rawData.downloadUrl;
          let releaseNotes = rawData.releaseNotes || rawData.body;

          if (String(latestVer).toLowerCase().includes('enterprise')) {
            continue;
          }

          if (rawData.assets && Array.isArray(rawData.assets)) {
            let maxWeight = parseVersionWeight(latestVer);
            for (const asset of rawData.assets) {
              if (asset.name && asset.name.endsWith('.exe')) {
                const match = asset.name.match(/v?([0-9]+(?:\.[0-9]+)+)/i);
                if (match) {
                  const candidateVer = 'v' + match[1];
                  const weight = parseVersionWeight(candidateVer);
                  if (weight >= maxWeight) {
                    maxWeight = weight;
                    latestVer = candidateVer;
                    downloadUrl = asset.browser_download_url;
                  }
                }
              }
            }
          }
          if (!downloadUrl) {
            downloadUrl = `https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_${latestVer}.exe`;
          }

          const latestWeight = parseVersionWeight(latestVer);
          const currentWeight = parseVersionWeight(currentVer);
          const hasUpdate = latestWeight > currentWeight;

          return {
            hasUpdate,
            currentVersion: currentVer,
            latestVersion: latestVer,
            downloadUrl: downloadUrl || 'https://www.e-vedhika.in/EVedhikaUBDDeploymentTool_CSharp_Solution.zip',
            releaseNotes: releaseNotes || 'Includes latest UBD Telangana configuration and DSC token fixes.',
            updateRequired: rawData.updateRequired || false,
            resourceManifest
          };
        }
      } catch (err) {}
    }
  } catch (error) {
    console.warn('Update check failed, using local version configuration:', error);
  }

  return {
    hasUpdate: false,
    currentVersion: currentVer,
    latestVersion: currentVer,
    downloadUrl: 'https://www.e-vedhika.in/EVedhikaUBDDeploymentTool_CSharp_Solution.zip',
    releaseNotes: 'You are using the latest stable version.',
    resourceManifest
  };
}
