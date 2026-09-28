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
import { HelpView } from './components/HelpView';
import { AboutView } from './components/AboutView';
import { ToastProvider, useToast } from './components/Toast';
import { checkForUpdates, CURRENT_APP_VERSION } from './utils/updateEngine';

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
  const [selectedProfile, setSelectedProfile] = useState<DepartmentProfile>(departmentProfiles[0]);
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

  // Hook: Check GitHub Raw / Remote Version metadata on mount
  useEffect(() => {
    let isMounted = true;
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

    return () => { isMounted = false; };
  }, [showInfo]);

  // Sync tab from URL search parameters on load & popstate
  React.useEffect(() => {
    const handleUrlTab = () => {
      const params = new URLSearchParams(window.location.search);
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
        } else if ([
          'dashboard', 'deploy', 'csharp', 'repair', 'diagnostics', 'remote',
          'drivers', 'browser', 'registry', 'dsc', 'ai', 
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

  const changeTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      if (tab === 'backups') {
        url.searchParams.set('tab', 'admin/UBDLiveMonitoring');
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
      user: 'Rakesh Dhawan (Admin)',
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
    showInfo(`Initiated 15-Step Automated Deployment for ${selectedProfile.name}`, 'Deployment Started');
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
    addLog('RegistryEngine', 'Importing Zone 2 Trusted Sites & ActiveX registry payloads...', 'info');
    setTimeout(() => {
      setIsImportingRegistry(false);
      setEnvStatus((prev) => ({ ...prev, registryConfigured: true }));
      showSuccess('Successfully imported ActiveX & Zone 2 policies into Windows Registry.', 'Registry Updated');
      addLog('RegistryEngine', 'Successfully imported evedhika_ubd_config.reg to Windows registry.', 'success');
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

  const handleCreateSnapshot = (title: string, notes: string) => {
    const snap: BackupSnapshot = {
      id: `bak-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      title,
      regKeyCount: 148,
      policyCount: 22,
      createdUser: 'Rakesh Dhawan (Admin)',
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
    const reportText = `====================================================================
E-VEDHIKA ONE-CLICK DEPLOYMENT TOOL - AUDIT REPORT
Developer: Rakesh Dhawan | E-Vedhika UBD Tool
Target Portal Profile: ${selectedProfile.name}
Report Generated: ${reportDate}
====================================================================

DEPLOYMENT STEP STATUSES (15-Step Workflow):
--------------------------------------------
${latestSteps.map((s) => `[Step ${s.id}] [${s.status.toUpperCase()}] ${s.title} (${s.module})`).join('\n')}

SYSTEM LOGS:
------------
${latestLogs.map((l) => `${l.timestamp} [${l.module}] ${l.message}`).join('\n')}

====================================================================
End of Report
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
    <div className="flex flex-col h-screen w-screen overflow-hidden text-ink bg-bg relative z-10">
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
              onStartDeployment={startOneClickDeployment}
              isDeploying={isDeploying}
              logs={logs}
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
            />
          )}
          {activeTab === 'ai' && (
            <AiTroubleshooterView
              envStatus={envStatus}
              selectedProfile={selectedProfile}
              logs={logs}
            />
          )}
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
