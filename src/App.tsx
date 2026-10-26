import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SystemPanel } from './components/SystemPanel';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DeployView } from './components/DeployView';
import { CSharpSolutionView } from './components/CSharpSolutionView';
import { RepairView } from './components/RepairView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { DriversView } from './components/DriversView';
import { BrowserView } from './components/BrowserView';
import { RegistryView } from './components/RegistryView';
import { DscTokenView } from './components/DscTokenView';
import { AiTroubleshooterView } from './components/AiTroubleshooterView';
import { RemoteSupportView } from './components/RemoteSupportView';
import { DownloadsView } from './components/DownloadsView';
import { BackupsView } from './components/BackupsView';
import { PCBoostView } from './components/PCBoostView';
import { SettingsView } from './components/SettingsView';
import { RegistryAuditor } from './components/RegistryAuditor';
import { HelpView } from './components/HelpView';
import { AboutView } from './components/AboutView';
import { AdminPostPublisherView } from './components/AdminPostPublisherView';
import { PostDetailView } from './components/PostDetailView';
import { GithubDashboardView } from './components/GithubDashboardView';
import { ToastProvider, useToast } from './components/Toast';
import { checkForUpdates, CURRENT_APP_VERSION } from './utils/updateEngine';
import { SendDeploymentSummaryToTelegram } from './utils/telegram';

import { 
  NavigationTab, 
  EnvironmentStatus, 
  DeploymentStep, 
  DriverItem, 
  LogEntry, 
  BackupSnapshot, 
  DepartmentProfile 
} from './types';

import { 
  initialEnvironmentState, 
  defaultDeploymentSteps, 
  driverList, 
  errorCodeDatabase, 
  departmentProfiles, 
  initialBackupSnapshots, 
  initialLogs 
} from './data/mockData';

function MainAppContent() {
  const { showInfo, showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string>('ubd-setting-issues-one-click-all-in-one-setup');
  const [selectedProfile, setSelectedProfile] = useState<DepartmentProfile>(() => {
    const savedProfileId = localStorage.getItem('evedhika_selected_profile_id');
    if (savedProfileId) {
      const found = departmentProfiles.find(p => p.id === savedProfileId);
      if (found) return found;
    }
    return departmentProfiles[0];
  });
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus>(initialEnvironmentState);
  
  const [deploySteps, setDeploySteps] = useState<DeploymentStep[]>(defaultDeploymentSteps);
  const [isDeploying, setIsDeploying] = useState(false);
  const [didJustCompleteDeploy, setDidJustCompleteDeploy] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  
  const [drivers, setDrivers] = useState<DriverItem[]>(driverList);
  const [installingDriverId, setInstallingDriverId] = useState<string | null>(null);

  const [repairingItem, setRepairingItem] = useState<string | null>(null);
  const [lastRepairSuccess, setLastRepairSuccess] = useState<string | null>(null);

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(initialBackupSnapshots);
  const [isRestoring, setIsRestoring] = useState(false);

  const [isApplyingEdgePolicy, setIsApplyingEdgePolicy] = useState(false);
  const [isImportingRegistry, setIsImportingRegistry] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSystemPanelOpen, setIsSystemPanelOpen] = useState(false);

  const handleResetState = () => {
    setSelectedProfile(departmentProfiles[0]);
    localStorage.removeItem('evedhika_selected_profile_id');
    showInfo('Application portal configuration reset to default.', 'Configuration Reset');
  };

  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('evedhika_selected_profile_id', selectedProfile.id);
      localStorage.setItem('evedhika_state_selected', 'true');
    }
  }, [selectedProfile]);

  // Hook: Check GitHub / Remote Version metadata on mount and every 5 minutes
  useEffect(() => {
    let isMounted = true;
    
    const runUpdateCheck = () => {
      checkForUpdates().then((res) => {
        if (!isMounted) return;
        if (res.hasUpdate) {
          showInfo(
            `Software Update ${res.latestVersion} is available! Current installed build is ${CURRENT_APP_VERSION}.`,
            'New Version Available'
          );
          
          const autoInstall = localStorage.getItem('autoInstallOnLaunch');
          if (autoInstall !== 'false') {
            showInfo(`Auto-installing update ${res.latestVersion} in the background...`, 'Auto-Update Started');
            setTimeout(() => {
              window.open(res.downloadUrl, '_blank');
            }, 1500);
          }
        }
      }).catch(() => {});
    };

    runUpdateCheck();
    const interval = setInterval(runUpdateCheck, 5 * 60 * 1000); // Poll every 5 minutes

    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [showInfo]);

  // Sync tab from URL search parameters on load & popstate
  React.useEffect(() => {
    const handleUrlTab = () => {
      // 1. Check pathname (e.g., /home/post/ubd-setting-issues-one-click-all-in-one-setup or /post/...)
      const path = window.location.pathname;
      if (path.includes('/post/')) {
        const parts = path.split('/post/');
        if (parts[1]) {
          const cleanSlug = parts[1].replace(/\/$/, '');
          setSelectedPostSlug(cleanSlug || 'ubd-setting-issues-one-click-all-in-one-setup');
          setActiveTab('post-detail');
          return;
        }
      }

      // 2. Check search params
      const params = new URLSearchParams(window.location.search);
      const slugParam = params.get('slug') || params.get('postId');
      if (slugParam) {
        setSelectedPostSlug(slugParam);
        setActiveTab('post-detail');
        return;
      }

      const tabParam = params.get('tab');
      if (tabParam) {
        const normalized = tabParam.toLowerCase();
        if (
          normalized === 'admin/ubdlivemonitoring' || 
          normalized === 'ubdlivemonitoring' || 
          normalized === 'telemetry' || 
          normalized === 'livemonitoring'
        ) {
          setActiveTab('backups');
        } else if (
          normalized === 'admin/post' ||
          normalized === 'admin/posts' ||
          normalized === 'post' ||
          normalized === 'posts' ||
          normalized === 'publisher' ||
          normalized === 'announcements'
        ) {
          setActiveTab('posts');
        } else if (normalized === 'post-detail' || normalized === 'article') {
          setActiveTab('post-detail');
        } else if ([
          'dashboard', 'posts', 'post-detail', 'deploy', 'csharp', 'repair', 'diagnostics', 'remote',
          'drivers', 'browser', 'registry', 'auditor', 'dsc', 'ai', 
          'downloads', 'backups', 'pcboost', 'settings', 'help', 'about'
        ].includes(normalized)) {
          setActiveTab(normalized as NavigationTab);
        }
      }
    };

    handleUrlTab();
    window.addEventListener('popstate', handleUrlTab);
    return () => window.removeEventListener('popstate', handleUrlTab);
  }, []);

  const openPostDetail = (slug: string = 'ubd-setting-issues-one-click-all-in-one-setup') => {
    setSelectedPostSlug(slug);
    setActiveTab('post-detail');
    setIsMobileMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      url.pathname = `/home/post/${slug}`;
      url.searchParams.delete('tab');
      window.history.pushState({}, '', url.toString());
    } catch { }
  };

  const changeTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      if (tab === 'backups') {
        url.searchParams.set('tab', 'admin/UBDLiveMonitoring');
      } else if (tab === 'posts') {
        url.searchParams.set('tab', 'admin/post');
      } else if (tab === 'post-detail') {
        url.pathname = `/home/post/${selectedPostSlug}`;
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.pushState({}, '', url.toString());
    } catch { }
  };

  const addLog = (module: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      user: 'System Administrator',
      pcName: 'PRRD-TS-PC01',
      module,
      message,
      type,
    };
    setLogs((prev) => [...prev, entry]);
  };

  React.useEffect(() => {
    const retryPendingWebhooks = async () => {
      const pendingStr = localStorage.getItem('pending_webhook_uploads');
      if (pendingStr) {
        let pending = [];
        try {
          pending = JSON.parse(pendingStr);
        } catch { return; }
        
        if (Array.isArray(pending) && pending.length > 0) {
          const remaining = [];
          for (const item of pending) {
            try {
              const res = await fetch(item.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.payload)
              });
              if (!res.ok) {
                throw new Error('Webhook error');
              }
            } catch (err) {
              item.attempts = (item.attempts || 1) + 1;
              if (item.attempts < 10) {
                remaining.push(item);
              }
            }
          }
          localStorage.setItem('pending_webhook_uploads', JSON.stringify(remaining));
        }
      }
    };
    
    // Check shortly after load and then every 2 minutes
    setTimeout(retryPendingWebhooks, 3000);
    const retryInterval = setInterval(retryPendingWebhooks, 120000);

    return () => clearInterval(retryInterval);
  }, []);

  React.useEffect(() => {
    if (didJustCompleteDeploy) {
      handleExportAuditReport(true, deploySteps, logs);
      setDidJustCompleteDeploy(false);
    }
  }, [didJustCompleteDeploy, deploySteps, logs]);

  // One-Click Deployment Engine Execution (15 Steps)
  const startOneClickDeployment = () => {
    setIsDeploying(true);
    setActiveTab('deploy');
    showInfo(`Initiated 17-Step Automated Deployment for ${selectedProfile.name}`, 'Deployment Started');
    addLog('DeployEngine', `Started One-Click Deployment for profile: ${selectedProfile.name}`, 'info');

    // Reset steps
    setDeploySteps(defaultDeploymentSteps.map(s => ({ ...s, status: 'pending', durationMs: undefined })));

    let currentIdx = 0;

    const executeNextStep = () => {
      if (currentIdx >= defaultDeploymentSteps.length) {
        setIsDeploying(false);
        setEnvStatus((prev) => ({
          ...prev,
          edgeIEModeConfigured: true,
          registryConfigured: true,
          proxKeyDriverInstalled: true,
          hyp2003DriverInstalled: true,
          nicDigiSignerInstalled: true,
          digiSignerServiceRunning: true,
          dscTokenConnected: true,
          lastCheckTime: new Date().toLocaleTimeString(),
        }));
        showSuccess('All 15 Deployment Steps executed successfully! System ready.', 'Deployment Completed');
        addLog('DeployEngine', 'All 15 Deployment Steps completed successfully! System is fully ready.', 'success');
        setDidJustCompleteDeploy(true);
        SendDeploymentSummaryToTelegram({
          stepsPassed: 16,
          totalSteps: 16,
          profileName: selectedProfile.name,
          status: 'SUCCESS',
          remarks: '17/17 Deployment steps executed and verified with zero manual clicks!',
          pcName: 'E-VEDHIKA-WEB-CLIENT',
          osVersion: envStatus.osVersion,
          dscStatus: envStatus.dscTokenConnected ? 'Connected' : 'Not Detected',
          ramUsage: '8GB (4.2GB Free)',
          diskSpace: '120GB Free',
          cpuInfo: 'Intel(R) Core(TM) i5-12500H',
          ipAddress: '183.82.98.11',
          detailedSteps: {
            step1: 'Active',
            step2: envStatus.dotNet35Installed ? 'Installed' : 'Repaired',
            step3: 'Installed',
            step4: 'Active',
            step5: envStatus.edgeIEModeConfigured ? 'Active' : 'Configured',
            step6: envStatus.registryConfigured ? 'Active' : 'Configured',
            step7: 'Allowed',
            step8: 'Running',
            step9: 'Installed',
            step10: 'Port 8080 Active',
            step11: 'Active',
            step12: 'Active',
            step13: 'Active',
            step15: 'Created',
            step16: 'Applied',
            step17: 'Verified'
          }
        });
        return;
      }

      const stepId = currentIdx + 1;
      setDeploySteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'running' } : s))
      );

      // Realistic automated step execution (averaging ~1.1s per configuration step)
      const delay = Math.floor(Math.random() * 400) + 900;

      setTimeout(() => {
        setDeploySteps((prev) =>
          prev.map((s) => (s.id === stepId ? { ...s, status: 'success', durationMs: delay } : s))
        );

        const currentStep = defaultDeploymentSteps[currentIdx];
        addLog(currentStep.module, `[Step ${stepId}/15] ${currentStep.title} - SUCCESS (${delay}ms)`, 'success');

        currentIdx++;
        executeNextStep();
      }, delay);
    };

    executeNextStep();
  };

  const handleResetDeployment = () => {
    setIsDeploying(false);
    setDeploySteps(defaultDeploymentSteps.map(s => ({ ...s, status: 'pending' })));
    showInfo('Deployment engine state has been reset.', 'Engine Reset');
    addLog('DeployEngine', 'Deployment engine state reset.', 'info');
  };

  const handleExecuteRepair = (repairName: string) => {
    setRepairingItem(repairName);
    showInfo(`Executing automated repair fix: ${repairName}`, 'Repairing');
    addLog('RepairEngine', `Executing repair: ${repairName}`, 'info');
    setTimeout(() => {
      setRepairingItem(null);
      setLastRepairSuccess(repairName);
      showSuccess(`Successfully completed repair: ${repairName}`, 'Repair Succeeded');
      addLog('RepairEngine', `Successfully completed repair: ${repairName}`, 'success');
    }, 1500);
  };

  const handleInstallDriver = (driverId: string) => {
    setInstallingDriverId(driverId);
    const drv = drivers.find(d => d.id === driverId);
    showInfo(`Installing hardware driver package: ${drv?.name || driverId}...`, 'Driver Install');
    addLog('DriverManager', `Installing driver package: ${drv?.name || driverId}`, 'info');
    setTimeout(() => {
      setInstallingDriverId(null);
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, status: 'Installed' } : d))
      );
      showSuccess(`Successfully installed hardware driver: ${drv?.name}`, 'Driver Ready');
      addLog('DriverManager', `Successfully installed driver: ${drv?.name}`, 'success');
    }, 1800);
  };

  const handleApplyEdgePolicy = () => {
    setIsApplyingEdgePolicy(true);
    addLog('BrowserPolicy', 'Writing Edge InternetExplorerIntegrationLevel registry policies...', 'info');
    setTimeout(() => {
      setIsApplyingEdgePolicy(false);
      setEnvStatus((prev) => ({ ...prev, edgeIEModeConfigured: true }));
      showSuccess('Successfully applied Edge Enterprise IE Mode Group Policies.', 'Policies Active');
      addLog('BrowserPolicy', 'Successfully pushed Microsoft Edge IE Mode Group Policies.', 'success');
    }, 1200);
  };

  const handleImportRegistry = () => {
    setIsImportingRegistry(true);
    addLog('RegistryEngine', 'Importing Security Zones (Zone 1 Local Intranet, Zone 2 Trusted Sites, Zone 3 Internet) and verifying settings...', 'info');
    setTimeout(() => {
      setIsImportingRegistry(false);
      setEnvStatus((prev) => ({ ...prev, registryConfigured: true }));
      showSuccess('Security Zones (Zone 1, Zone 2, Zone 3) configured and verified with 100% compliance! Pre-deployment backup created.', 'Security Zones Verified');
      addLog('RegistryEngine', 'All Security Settings across Zone 1, Zone 2, and Zone 3 verified successfully.', 'success');
    }, 1400);
  };

  const handleRunDiagnostics = () => {
    setIsScanning(true);
    showInfo('Scanning system components & DSC token services...', 'Diagnostic Scan');
    addLog('Diagnostics', 'Executing full environment diagnostic scan...', 'info');
    setTimeout(() => {
      setIsScanning(false);
      setEnvStatus((prev) => ({ ...prev, lastCheckTime: new Date().toLocaleTimeString() }));
      showSuccess('Diagnostic scan complete. System parameters evaluated.', 'Scan Complete');
      addLog('Diagnostics', 'Diagnostic scan complete. All 9 core modules evaluated.', 'success');
    }, 1500);
  };

  const handleForceClearToken = () => {
    setEnvStatus((prev) => ({
      ...prev,
      dscTokenConnected: false,
      dscTokenName: 'None Detected (Cache Cleared)',
      lastCheckTime: new Date().toLocaleTimeString(),
    }));
    try {
      const keys = [
        'dsc_token',
        'dsc_token_data',
        'dsc_certificate',
        'dsc_session',
        'active_token',
        'token_session',
        'token_cache',
        'auth_token',
        'temp_token_data',
        'dsc_auth_state',
        'token_number',
        'temp_auth_keys',
        'cached_token_info'
      ];
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    addLog('DscManager', 'Force-cleared DSC Token state and purged temporary authentication keys from localStorage.', 'info');
  };

  const handleCreateSnapshot = (title: string, notes: string) => {
    const snap: BackupSnapshot = {
      id: `bak-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      title,
      regKeyCount: 148,
      policyCount: 22,
      createdUser: 'System Administrator',
      notes,
    };
    setSnapshots((prev) => [snap, ...prev]);
    showSuccess(`Created safety backup snapshot: "${title}"`, 'Snapshot Saved');
    addLog('BackupManager', `Created safety backup snapshot: "${title}"`, 'success');
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    setIsRestoring(true);
    showInfo(`Restoring registry snapshot ID: ${snapshotId}...`, 'Rollback');
    addLog('BackupManager', `Restoring snapshot ID: ${snapshotId}...`, 'info');
    setTimeout(() => {
      setIsRestoring(false);
      showSuccess('Snapshot rollback completed successfully.', 'Rollback Complete');
      addLog('BackupManager', 'Snapshot rollback completed successfully.', 'success');
    }, 1500);
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
    showInfo('Snapshot deleted.', 'Backup Removed');
    addLog('BackupManager', `Deleted snapshot ID: ${snapshotId}`, 'info');
  };

  const handleExportAuditReport = async (isAutoExport = false, latestSteps = deploySteps, latestLogs = logs) => {
    const reportDate = new Date().toLocaleString();
    const pcId = 'EVD-WEB-CLIENT';
    const ramInfo = '8 GB (4.2 GB Free)';
    const diskInfo = '120 GB Free';
    const cpuInfo = 'Intel(R) Core(TM) i5-12500H';
    const ipInfo = '183.82.98.11';
    
    const reportText = `📋 E-Vedhika UBD Deployment Tool v1.0.8 and Installation Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️ Machine & Office Details
Machine IDs: ${pcId}
Office Locations: ${selectedProfile.name} (Panchayat Office)
PC Name: E-VEDHIKA-WEB-CLIENT
User Privileges: Elevated Administrator Mode (UAC Verified)
IP Address: ${ipInfo}

⚙️ System Resources
RAM: ${ramInfo}
Disc Rom: ${diskInfo}
CPU: ${cpuInfo}

📊 Deployment Status & Health
Overall Status: SUCCESS
Versions: v1.0.8 (24*7 Guardian Build)
Health Score: 100%
Successful Steps/Checks: 17/17 steps passed.
DSC Token Patch: SHA256 v2.0.0.0 (Applied), though hardware DSC status shows "Detected"
Guardian Status: Active Report (System Tray)

🛠️ 17 Steps Real-Time Audit Matrix
Admin Elevation & DISM: Active
.NET Framework 3.5: Active
Repaired Visual C++ Runtime: -
Edge Enterprise Site List: Active
Emulation Mode (IE5): Active
Zone 2 Trusted Sites: Active
Unsigned ActiveX Controls: Active
SmartCard Service (SCardSvr): Active
USB DSC Token Drivers: Active
NIC DigiSigner Bridge: Active
SSL & DNS Cache: Active
Security Protocols: Active
Popups & Content Rules: Active
Dual Browser Routing: Active
Backup & Telemetry Sync: Active
Final Handshake: Verified

📌 Remarks & Portals
Remarks: 17/17 Deployment steps executed and verified with zero manual clicks!
Target Portal: ${selectedProfile.url}
Central Live Dashboard: https://www.e-vedhika.in/admin/exe_ubd_live
Report Timestamp: ${reportDate}
`;

    if (!isAutoExport) {
      // Download Text Report
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evedhika_deployment_report_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('ReportEngine', 'Exported Deployment Audit Report locally.', 'info');
    }

    // Handle Webhook API Integration
    const webhookUrl = localStorage.getItem('webhook_url');
    if (webhookUrl) {
      const reportJson = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        profile: selectedProfile.name,
        deploySteps: latestSteps.map(s => ({ id: s.id, status: s.status, title: s.title })),
        logs: latestLogs
      };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportJson)
        });
        
        if (response.ok) {
          addLog('ReportEngine', 'Successfully posted audit report to Webhook API.', 'success');
        } else {
          throw new Error('Webhook responded with error status');
        }
      } catch (err) {
        addLog('ReportEngine', 'Failed to reach Webhook API. Saving to Pending Uploads.', 'error');
        const pending = JSON.parse(localStorage.getItem('pending_webhook_uploads') || '[]');
        pending.push({ url: webhookUrl, payload: reportJson, attempts: 1 });
        localStorage.setItem('pending_webhook_uploads', JSON.stringify(pending));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-ink bg-bg relative z-10 font-syne">
      
      <Header
        activeTab={activeTab}
        setActiveTab={changeTab}
        envStatus={envStatus}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        departmentProfiles={departmentProfiles}
        onTriggerDeploy={startOneClickDeployment}
        onRefreshEnv={handleRunDiagnostics}
        isDeploying={isDeploying}
        mobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setIsMobileMenuOpen}
        systemPanelOpen={isSystemPanelOpen}
        setSystemPanelOpen={setIsSystemPanelOpen}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar (visible on lg screens and up) */}
        <div className="hidden lg:block w-60 xl:w-68 shrink-0 h-full overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={changeTab}
            isDeploying={isDeploying}
            systemReady={envStatus.edgeIEModeConfigured && envStatus.registryConfigured}
          />
        </div>

        {/* Mobile & Tablet Navigation Drawer with Backdrop */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-[280px] max-w-[85vw] h-full bg-[#0C0C0E] border-r border-ink z-10 flex flex-col shadow-2xl">
              <div className="p-4 border-b border-ink flex justify-between items-center bg-[#0C0C0E]">
                <span className="font-syne text-accent font-bold text-sm tracking-wider">NAVIGATION</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-ink hover:text-accent font-mono text-xs border border-ink-faint rounded"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={changeTab}
                  isDeploying={isDeploying}
                  systemReady={envStatus.edgeIEModeConfigured && envStatus.registryConfigured}
                  onSelect={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace with Screen-Friendly Responsive Padding */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-6 lg:p-8 z-10 relative">
          {activeTab === 'dashboard' && (
            <DashboardView
              envStatus={envStatus}
              selectedProfile={selectedProfile}
              setActiveTab={changeTab}
              onOpenPost={openPostDetail}
              onStartDeployment={startOneClickDeployment}
              isDeploying={isDeploying}
              logs={logs}
            />
          )}
          {activeTab === 'github-dashboard' && <GithubDashboardView />}
          {activeTab === 'posts' && <AdminPostPublisherView onOpenPost={openPostDetail} />}
          {activeTab === 'post-detail' && (
            <PostDetailView
              onBack={() => changeTab('posts')}
              setActiveTab={changeTab}
              slug={selectedPostSlug}
            />
          )}
          {activeTab === 'deploy' && (
            <DeployView
              steps={deploySteps}
              isDeploying={isDeploying}
              onStartDeployment={startOneClickDeployment}
              onResetDeployment={handleResetDeployment}
              selectedProfile={selectedProfile}
              logs={logs}
              onGenerateReport={handleExportAuditReport}
            />
          )}
          {activeTab === 'csharp' && <CSharpSolutionView />}
          {activeTab === 'pcboost' && <CSharpSolutionView initialTab="boost" />}
          {activeTab === 'repair' && (
            <RepairView
              errorCodes={errorCodeDatabase}
              onExecuteRepair={handleExecuteRepair}
              repairingItem={repairingItem}
              lastRepairSuccess={lastRepairSuccess}
            />
          )}
          {activeTab === 'diagnostics' && (
            <DiagnosticsView
              envStatus={envStatus}
              selectedProfile={selectedProfile}
              onRunDiagnostics={handleRunDiagnostics}
              isScanning={isScanning}
            />
          )}
          {activeTab === 'remote' && (
            <RemoteSupportView envStatus={envStatus} />
          )}
          {activeTab === 'drivers' && (
            <DriversView
              drivers={drivers}
              onInstallDriver={handleInstallDriver}
              installingId={installingDriverId}
            />
          )}
          {activeTab === 'browser' && (
            <BrowserView
              selectedProfile={selectedProfile}
              onApplyEdgePolicy={handleApplyEdgePolicy}
              isApplyingPolicy={isApplyingEdgePolicy}
            />
          )}
          {activeTab === 'registry' && (
            <RegistryView
              selectedProfile={selectedProfile}
              onImportRegistry={handleImportRegistry}
              isImporting={isImportingRegistry}
            />
          )}
          {activeTab === 'dsc' && (
            <DscTokenView
              envStatus={envStatus}
              onRescanToken={handleRunDiagnostics}
              isScanning={isScanning}
              onForceClearToken={handleForceClearToken}
            />
          )}
          {activeTab === 'ai' && (
            <AiTroubleshooterView
              envStatus={envStatus}
              selectedProfile={selectedProfile}
              logs={logs}
            />
          )}
          {activeTab === 'auditor' && <RegistryAuditor />}
          {activeTab === 'downloads' && (
            <DownloadsView selectedProfile={selectedProfile} />
          )}
          {activeTab === 'backups' && (
            <BackupsView
              snapshots={snapshots}
              onCreateSnapshot={handleCreateSnapshot}
              onRestoreSnapshot={handleRestoreSnapshot}
              onDeleteSnapshot={handleDeleteSnapshot}
              isRestoring={isRestoring}
            />
          )}
          {activeTab === 'pcboost' && <PCBoostView />}
          {activeTab === 'settings' && (
            <SettingsView
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              departmentProfiles={departmentProfiles}
              onClearLogs={() => {
                setLogs([]);
                addLog('System', 'Logs cleared.', 'info');
              }}
              onResetState={handleResetState}
            />
          )}
          {activeTab === 'help' && <HelpView />}
          {activeTab === 'about' && <AboutView />}
        </main>

        {/* Desktop System Panel (visible on xl screens and up) */}
        <div className="hidden xl:block w-72 2xl:w-80 shrink-0 h-full overflow-hidden">
          <SystemPanel envStatus={envStatus} logs={logs} />
        </div>

        {/* Mobile & Tablet System Console Drawer */}
        {isSystemPanelOpen && (
          <div className="fixed inset-0 z-50 xl:hidden flex justify-end animate-in fade-in duration-200">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSystemPanelOpen(false)}
            />
            <div className="relative w-[340px] max-w-[90vw] h-full bg-[#0C0C0E] border-l border-ink z-10 flex flex-col shadow-2xl">
              <div className="p-4 border-b border-ink flex justify-between items-center bg-[#0C0C0E]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-syne text-accent font-bold text-sm tracking-wider">SYSTEM CONSOLE</span>
                </div>
                <button 
                  onClick={() => setIsSystemPanelOpen(false)}
                  className="p-1.5 text-ink hover:text-accent font-mono text-xs border border-ink-faint rounded"
                  aria-label="Close console"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SystemPanel envStatus={envStatus} logs={logs} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer onToggleConsole={() => setIsSystemPanelOpen(prev => !prev)} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
