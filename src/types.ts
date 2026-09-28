export interface EnvironmentStatus {
  osVersion: string;
  osBuild: string;
  arch: string; // "64-bit (x64)" or "32-bit (x86)"
  isAdmin: boolean;
  internetConnected: boolean;
  dotNet35Installed: boolean;
  dotNet4xInstalled: boolean;
  edgeIEModeConfigured: boolean;
  registryConfigured: boolean;
  proxKeyDriverInstalled: boolean;
  hyp2003DriverInstalled: boolean;
  nicDigiSignerInstalled: boolean;
  dscTokenConnected: boolean;
  dscTokenName: string | null;
  digiSignerServiceRunning: boolean;
  lastCheckTime: string;
}

export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface DeploymentStep {
  id: number;
  title: string;
  module: string;
  description: string;
  status: StepStatus;
  durationMs?: number;
  details?: string;
  errorCode?: string;
}

export interface DriverItem {
  id: string;
  name: string;
  version: string;
  publisher: string;
  status: 'Installed' | 'Missing' | 'Update Available' | 'Corrupted';
  supportedTokens: string[];
  downloadUrl?: string;
  description: string;
}

export interface ErrorCodeInfo {
  code: string;
  title: string;
  category: 'Permissions' | '.NET' | 'Browser' | 'Registry' | 'DSC Token' | 'DigiSigner';
  cause: string;
  impact: string;
  autoFixAction: string;
  manualSteps: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  pcName: string;
  module: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  title: string;
  regKeyCount: number;
  policyCount: number;
  createdUser: string;
  notes: string;
}

export interface DepartmentProfile {
  id: string;
  name: string;
  code: string;
  primaryUrl: string;
  siteList: string[];
  compatibilityMode: 'IE5' | 'IE5Quirks' | 'IE8Enterprise' | 'IE11' | 'IE7';
  description: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'deploy'
  | 'csharp'
  | 'repair'
  | 'diagnostics'
  | 'remote'
  | 'drivers'
  | 'browser'
  | 'registry'
  | 'dsc'
  | 'ai'
  | 'downloads'
  | 'backups'
  | 'pcboost'
  | 'settings'
  | 'help'
  | 'about';

export interface SystemResourceStats {
  ram: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    totalGB: number;
    usedGB: number;
    freeGB: number;
    percentage: number;
    status: 'Optimal' | 'Moderate' | 'Critical';
    statusTelugu: string;
  };
  junk: {
    totalMB: number;
    totalGB: number;
    tempFilesCount: number;
    status: string;
    statusTelugu: string;
    breakdown: {
      userTempMB: number;
      prefetchMB: number;
      browserCacheMB: number;
      sysLogsMB: number;
    };
  };
  cpu?: {
    cores: number;
    model: string;
    loadAvg: number[];
  };
  os?: {
    platform: string;
    arch: string;
    uptimeSeconds: number;
  };
  serverTime?: string;
}

