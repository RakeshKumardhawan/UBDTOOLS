import { 
  EnvironmentStatus, 
  DeploymentStep, 
  DriverItem, 
  ErrorCodeInfo, 
  BackupSnapshot, 
  DepartmentProfile,
  LogEntry
} from '../types';

export const initialEnvironmentState: EnvironmentStatus = {
  osVersion: 'Waiting...',
  osBuild: 'Unknown',
  arch: 'Unknown',
  isAdmin: false,
  internetConnected: false,
  dotNet35Installed: false,
  dotNet4xInstalled: false,
  edgeIEModeConfigured: false,
  registryConfigured: false,
  proxKeyDriverInstalled: false,
  hyp2003DriverInstalled: false,
  nicDigiSignerInstalled: false,
  dscTokenConnected: false,
  dscTokenName: 'Not Detected',
  digiSignerServiceRunning: false,
  lastCheckTime: 'Waiting...',
};

export const defaultDeploymentSteps: DeploymentStep[] = [
  {
    id: 1,
    module: 'Permissions',
    title: 'Verify Administrator Privileges',
    description: 'Ensure token registration and registry modification rights are present.',
    status: 'pending',
  },
  {
    id: 2,
    module: 'Environment',
    title: 'Detect Operating System & Architecture',
    description: 'Confirm Windows 7/8/10/11 x64/x86 compatibility.',
    status: 'pending',
  },
  {
    id: 3,
    module: 'Network & Portal',
    title: 'UBD Portal Domain Reachability',
    description: 'Verify connectivity to ubd.telangana.gov.in and e-vedhika.in servers.',
    status: 'pending',
  },
  {
    id: 4,
    module: 'Browser Policy',
    title: 'Configure Microsoft Edge IE Mode',
    description: 'Enable InternetExplorerIntegrationLevel & allow reloading in IE Mode.',
    status: 'pending',
  },
  {
    id: 5,
    module: 'Enterprise List',
    title: 'Deploy Enterprise Mode Site List (sites.xml)',
    description: 'Map UBD Portal domain (TS/AP) to IE5 Quirks Mode.',
    status: 'pending',
  },
  {
    id: 6,
    module: 'Trusted Sites',
    title: 'Configure Zone 2 Trusted Sites Registry',
    description: 'Add Government portals to Zone 2 with relaxed ActiveX prompts.',
    status: 'pending',
  },
  {
    id: 7,
    module: 'ActiveX Engine',
    title: 'Configure ActiveX Controls & Security Policies',
    description: 'Allow unsigned ActiveX controls, binary scripting & safe initialization.',
    status: 'pending',
  },
  {
    id: 8,
    module: 'COM Registration',
    title: 'Register DigiSignHelper COM Component',
    description: 'Register capicom.dll, MSXML 6.0, and CryptoAPI COM dependencies.',
    status: 'pending',
  },
  {
    id: 9,
    module: 'Driver Manager',
    title: 'PKCS#11 USB DSC Token Driver Engine',
    description: 'Verify WD ProxKey & HYP2003 smart card drivers for secretarial signing.',
    status: 'pending',
  },
  {
    id: 10,
    module: 'DLL Security',
    title: 'SignatureDemoLib.dll SHA256 Patch (V3.3)',
    description: 'Patch DLL checksum and bypass legacy MD5 hash verification errors.',
    status: 'pending',
  },
  {
    id: 11,
    module: '.NET Framework',
    title: 'Verify .NET Framework 3.5 & 4.8 Runtime',
    description: 'Check required runtime libraries for NIC DigiSigner.',
    status: 'pending',
  },
  {
    id: 12,
    module: 'Service Binding',
    title: 'Port 8080/8443 Service Binding Audit',
    description: 'Verify NIC DigiSigner local web service port binding & SSL cert.',
    status: 'pending',
  },
  {
    id: 13,
    module: 'Performance',
    title: 'System RAM & Cache Optimization',
    description: 'Flush IE temp cache, prefetch data & optimize memory allocation.',
    status: 'pending',
  },
  {
    id: 14,
    module: 'Cloud Sync',
    title: 'Central Cloud Telemetry Gateway Sync',
    description: 'Post full execution telemetry to https://www.e-vedhika.in/api/telemetry.',
    status: 'pending',
  },
  {
    id: 15,
    module: 'Telegram Dispatch',
    title: 'Direct Telegram Guardian Dispatch',
    description: 'Send instant installation alert & health audit report to admin bot.',
    status: 'pending',
  },
  {
    id: 16,
    module: 'Auto-Update',
    title: 'OTA Auto-Update Check Engine',
    description: 'Query GitHub release API for version updates (v1.0.7 -> v1.0.8+).',
    status: 'pending',
  },
  {
    id: 17,
    module: 'Portal Launch',
    title: 'UBD Portal Readiness & Desktop Shortcut',
    description: 'Generate IE Mode Desktop Shortcut for direct 1-click Portal launch.',
    status: 'pending',
  }
];

export const driverList: DriverItem[] = [
  {
    id: 'proxkey',
    name: 'WD ProxKey Token Driver (WatchData)',
    version: '3.0.1.8',
    publisher: 'WatchData Technologies',
    status: 'Installed',
    supportedTokens: ['WD ProxKey v2/v3', 'Enterprise Gold Token', 'NIC ProxKey'],
    description: 'Required for all WatchData ProxKey USB tokens used by Secretaries for digital signing.',
  },
  {
    id: 'hyp2003',
    name: 'Hypersecu HYP2003 Token Middleware',
    version: '2.1.0.4',
    publisher: 'Hypersecu Information Systems',
    status: 'Installed',
    supportedTokens: ['HYP2003 Token', 'ePass2003 Auto', 'HyperPKI'],
    description: 'Driver suite for Hypersecu HYP2003 USB tokens used across Offices and Treasury portals.',
  },
  {
    id: 'nicdigisigner',
    name: 'NIC DigiSigner Client Service (Enterprise Edition)',
    version: '4.2.1',
    publisher: 'National Informatics Centre (NIC)',
    status: 'Installed',
    supportedTokens: ['All PKCS#11 Compliant DSC Tokens'],
    description: 'Core web service bridge communicating between UBD portal ActiveX/JavaScript and DSC Token.',
  },
  {
    id: 'safenet',
    name: 'SafeNet Authentication Client',
    version: '10.8.2',
    publisher: 'Thales / Gemalto',
    status: 'Missing',
    supportedTokens: ['eToken 5110', 'SafeNet 5100'],
    description: 'Optional driver for legacy Gemalto SafeNet tokens used in specific state treasury portals.',
  }
];

export const errorCodeDatabase: ErrorCodeInfo[] = [
  {
    code: 'UBD-1001',
    title: 'Administrator Rights Required',
    category: 'Permissions',
    cause: 'The tool or browser was launched without Administrator elevated privileges.',
    impact: 'Unable to write to HKLM registry, register ActiveX DLLs, or update Edge Enterprise Site List.',
    autoFixAction: 'Auto-Relaunch Tool in Elevated Admin Mode',
    manualSteps: [
      'Right click the E-Vedhika Deployment Tool shortcut or executable.',
      'Select "Run as Administrator".',
      'Confirm Windows User Account Control (UAC) prompt.'
    ]
  },
  {
    code: 'UBD-1002',
    title: '.NET Framework 3.5 Missing or Disabled',
    category: '.NET',
    cause: 'Windows feature "NetFx3" is not activated on Windows 10/11.',
    impact: 'NIC DigiSigner service crashes on launch with missing assembly error.',
    autoFixAction: 'Invoke DISM Online Feature Activation',
    manualSteps: [
      'Open Command Prompt as Administrator.',
      'Execute: DISM /Online /Enable-Feature /FeatureName:NetFx3 /All',
      'Restart computer if requested.'
    ]
  },
  {
    code: 'UBD-1003',
    title: 'DSC USB Token Not Detected',
    category: 'DSC Token',
    cause: 'USB Token is unplugged, driver is missing, or Smart Card service is stopped.',
    impact: 'UBD portal displays "Token Not Found" or "Insert Certificate" error during approval.',
    autoFixAction: 'Restart Smart Card Windows Service & Scan USB Bus',
    manualSteps: [
      'Unplug DSC Token from USB port and re-insert into a primary USB 2.0/3.0 port.',
      'Verify LED light is glowing solid on the Token.',
      'Check Task Manager for "WDProxKey.exe" or "HYP2003Manager.exe".'
    ]
  },
  {
    code: 'UBD-1004',
    title: 'Edge IE Mode Policy Missing or Disabled',
    category: 'Browser',
    cause: 'Microsoft Edge InternetExplorerIntegrationLevel policy registry key is missing.',
    impact: 'UBD login page opens in standard Edge Chromium mode instead of IE Mode, causing ActiveX load failure.',
    autoFixAction: 'Write Edge Group Policy Registry Keys & Reload Edge',
    manualSteps: [
      'Open Microsoft Edge and type edge://policy in address bar.',
      'Check if InternetExplorerIntegrationLevel is set to 1.',
      'Click "Reload Policies" in Edge.'
    ]
  },
  {
    code: 'UBD-1005',
    title: 'ActiveX Control Blocked by Zone Policy',
    category: 'Registry',
    cause: 'Internet Explorer Zone 2 settings have "Initialize ActiveX not marked safe" set to Disable (0x03).',
    impact: 'Panchayat UBD login screen remains blank or displays yellow security bar blocking execution.',
    autoFixAction: 'Apply Zone 2 ActiveX Registry Preset',
    manualSteps: [
      'Press Win+R, type inetcpl.cpl and press Enter.',
      'Go to Security tab -> Trusted Sites -> Custom level.',
      'Enable "Initialize and script ActiveX controls not marked as safe for scripting".'
    ]
  },
  {
    code: 'UBD-1006',
    title: 'NIC DigiSigner Service Connection Refused',
    category: 'DigiSigner',
    cause: 'DigiSigner service process on port 8080/8443 is blocked by Windows Firewall or not running.',
    impact: 'Digital signature fails during bill verification or Panchayat worker registration.',
    autoFixAction: 'Restart NIC DigiSigner Service & Add Firewall Rule',
    manualSteps: [
      'Search for "NIC DigiSigner" in Windows Start Menu and launch as Admin.',
      'Verify icon appears in Windows System Tray (bottom right near clock).',
      'Ensure Firewall allows port 8080 local loopback communication.'
    ]
  },
  {
    code: 'UBD-1007',
    title: 'Security Alert: File Download Blocked (1803 / 2200)',
    category: 'Registry',
    cause: 'Internet Explorer / Edge IE Mode Zone 2/3 setting "File download" (Value 1803) or "Automatic prompting for file downloads" (Value 2200) was disabled or missing.',
    impact: 'Browser displays "Your current security settings do not allow this file to be downloaded" when downloading reports, receipts, tokens, or update packages.',
    autoFixAction: 'Apply Zone 2/3 File Download Registry Policy (1803=0, 2200=0)',
    manualSteps: [
      'Open Internet Options (inetcpl.cpl) -> Security tab.',
      'Select "Trusted sites" -> click "Custom level...".',
      'Scroll down to "Downloads" -> set "File download" to "Enable" and "Automatic prompting for file downloads" to "Enable".',
      'Click OK and Apply.'
    ]
  },
  {
    code: 'UBD-1008',
    title: 'Could Not Create DigiSignHelper (Error -2146827859)',
    category: 'DigiSigner',
    cause: 'ActiveX control initialization blocked by Zone 2 registry policy (Value 1201) or NIC DigiSigner component (NEW-NIC-AP-DIGISIGNER.msi) is missing/unregistered.',
    impact: 'Token Number Registration fails at Step 3 with popup "Automation server can\'t create object (Error -2146827859)".',
    autoFixAction: 'Apply Zone 2 ActiveX Unsigned Registry Fix (1201=0) & Register NIC DigiSigner DLL',
    manualSteps: [
      'Run E-Vedhika One-Click Deployment Tool as Administrator.',
      'Click "One-Click Deploy & Repair" to set Zone 2 ActiveX policy (1201=0) and deploy IE5 Quirks Mode for ubd.telangana.gov.in.',
      'Install NEW-NIC-AP-DIGISIGNER.msi from Drivers & Installers section.',
      'Restart Microsoft Edge browser.'
    ]
  }
];

export const departmentProfiles: DepartmentProfile[] = [
  {
    id: 'ubd-portal-ts',
    name: 'E-Vedhika UBD Portal (Telangana)',
    code: 'UBD_PORTAL_TS',
    primaryUrl: 'https://ubd.telangana.gov.in',
    siteList: ['ubd.telangana.gov.in'],
    compatibilityMode: 'IE5',
    description: 'Government UBD Portal for Telangana in IE5 Quirks Mode (Edge IE Mode).',
  },
  {
    id: 'ubd-portal-ap',
    name: 'E-Vedhika UBD Portal (Andhra Pradesh)',
    code: 'UBD_PORTAL_AP',
    primaryUrl: 'http://www.ubd.ap.gov.in:8080/UBDNEW',
    siteList: ['ubd.ap.gov.in', 'www.ubd.ap.gov.in', 'www.ubd.ap.gov.in:8080'],
    compatibilityMode: 'IE5',
    description: 'Government UBD Portal for Andhra Pradesh in IE5 Quirks Mode (Edge IE Mode).',
  },
  {
    id: 'egramswaraj',
    name: 'eGramSwaraj National Portal',
    code: 'EGS_PORTAL',
    primaryUrl: 'https://egramswaraj.gov.in',
    siteList: ['egramswaraj.gov.in', 'egramswaraj.gov.in/payment'],
    compatibilityMode: 'IE11',
    description: 'Centralized Gram Panchayat accounting, voucher entry, and PFMS DSC online voucher signing.',
  },
  {
    id: 'treasury-portal',
    name: 'Treasury & IFMIS Portal',
    code: 'TREASURY_PORTAL',
    primaryUrl: 'https://ifmis.telangana.gov.in',
    siteList: ['ifmis.telangana.gov.in', 'treasury.telangana.gov.in'],
    compatibilityMode: 'IE11',
    description: 'District Treasury officer payroll submission, bill verification, and fund disbursements.',
  }
];

export const initialBackupSnapshots: BackupSnapshot[] = [
  {
    id: 'bak-20260729-01',
    timestamp: '2026-07-29 09:15 AM',
    title: 'Pre-Deployment Baseline Backup',
    regKeyCount: 142,
    policyCount: 18,
    createdUser: 'System Administrator',
    notes: 'Automatic snapshot captured prior to initial E-Vedhika UBD deployment run.',
  }
];

export const initialLogs: LogEntry[] = [
  {
    id: 'LOG-006',
    timestamp: '09:55:12 AM',
    user: 'SYSTEM',
    pcName: 'CENTRAL-SERVER',
    module: 'OTA Broadcast',
    message: 'Successfully received push command: [UPDATE_AVAILABLE] v1.7.0. Scheduled silent download.',
    type: 'success'
  },
  {
    id: 'LOG-007',
    timestamp: '09:56:01 AM',
    user: 'SYSTEM',
    pcName: 'CENTRAL-SERVER',
    module: 'OTA Broadcast',
    message: 'Verifying OTA Gateway heartbeat on port 443... connection stable.',
    type: 'info'
  },
  {
    id: 'log-1',
    timestamp: '09:00:12 AM',
    user: 'System Administrator',
    pcName: 'PRRD-MPDO-PC01',
    module: 'System',
    message: 'E-Vedhika UBD Deployment Tool initialized successfully.',
    type: 'info',
  },
  {
    id: 'log-2',
    timestamp: '09:00:15 AM',
    user: 'System Administrator',
    pcName: 'PRRD-MPDO-PC01',
    module: 'Permissions',
    message: 'Elevated Administrator rights verified (Process token HAS_ADMIN_PRIVILEGES).',
    type: 'success',
  },
  {
    id: 'log-3',
    timestamp: '09:00:18 AM',
    user: 'Rakesh Dhawan',
    pcName: 'PRRD-MPDO-PC01',
    module: 'Environment',
    message: 'Windows 11 Pro Enterprise x64 (Build 22621) detected.',
    type: 'info',
  }
];
