import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for SystemPanel and Footer
if "SystemPanel" not in content:
    content = content.replace("import { Sidebar } from './components/Sidebar';", "import { Sidebar } from './components/Sidebar';\nimport { SystemPanel } from './components/SystemPanel';\nimport { Footer } from './components/Footer';")

# Replace the layout
old_layout = r'<div className="flex h-screen w-screen corporate-mesh-bg overflow-hidden font-sans text-slate-800 antialiased relative">.*?</ToastProvider>\s*\);\s*}'
new_layout = """<div className="grid grid-cols-[280px_1fr_320px] grid-rows-[auto_1fr_auto] h-screen w-screen overflow-hidden text-ink bg-bg relative z-10">
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
      />
      
      <Sidebar
        activeTab={activeTab}
        setActiveTab={changeTab}
        isDeploying={isDeploying}
        systemReady={envStatus.edgeIEModeConfigured && envStatus.registryConfigured}
      />
      
      <main className="overflow-y-auto custom-scrollbar p-12 z-10 relative">
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

      <SystemPanel envStatus={envStatus} logs={logs} />
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}"""

content = re.sub(old_layout, new_layout, content, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated App.tsx layout!")
