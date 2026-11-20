import React from 'react';
import { EnvironmentStatus, DepartmentProfile, NavigationTab, LogEntry } from '../types';
import { Download, Play, Shield, CheckCircle2, Cpu, Activity, Layers } from 'lucide-react';
import { LiveSystemStatsWidget } from './LiveSystemStatsWidget';
import { LiveAnnouncementWidget } from './LiveAnnouncementWidget';
import { LiveUpdatesView } from './LiveUpdatesView';
import { ReleaseNotes } from './ReleaseNotes';
import { InstallationCounter } from './InstallationCounter';
import { LiveStepMonitoringWidget } from './LiveStepMonitoringWidget';
import { VersionFleetLiveDashboardView } from './VersionFleetLiveDashboardView';
import { SoftwareVersionCard } from './SoftwareVersionCard';
import { SystemPulseWidget } from './SystemPulseWidget';

interface DashboardViewProps {
  envStatus: EnvironmentStatus;
  selectedProfile: DepartmentProfile;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenPost?: (slug: string) => void;
  onStartDeployment: () => void;
  isDeploying: boolean;
  logs: LogEntry[];
  onAddLog?: (moduleName: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenPost,
  onStartDeployment,
  isDeploying,
  envStatus,
  onAddLog
}) => {
  return (
    <div className="w-full space-y-3.5 sm:space-y-4">
      {/* Real-time v1.0 to v1.0.8 Live PC Fleet Monitoring Dashboard (Main Landing View) */}
      <div>
        <VersionFleetLiveDashboardView />
      </div>

      {/* System Status Section Header */}
      <div className="pt-2 border-t border-ink-faint/60">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-accent" />
          <h2 className="font-syne font-bold text-base text-ink tracking-tight">
            System Status & Software Control
          </h2>
        </div>

        {/* Software Version Card & System Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Software Version Card (Card under System Status section as requested) */}
          <div className="lg:col-span-7">
            <SoftwareVersionCard onLogUpdateAction={onAddLog} />
          </div>

          {/* Quick System Readiness & Resource Metrics */}
          <div className="lg:col-span-5">
            <div className="status-card p-4 bg-[#0D0E12] border-2 border-blue-500/30 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> System Policy Readiness
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold">
                    100% OPERATIONAL
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Edge IE Mode Policy:</span>
                    <span className={envStatus.edgeIEModeConfigured ? "text-emerald-400 font-bold flex items-center gap-1" : "text-amber-400 font-bold"}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {envStatus.edgeIEModeConfigured ? "Configured & Enforced" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Zone 2 Registry Shim:</span>
                    <span className={envStatus.registryConfigured ? "text-emerald-400 font-bold flex items-center gap-1" : "text-amber-400 font-bold"}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {envStatus.registryConfigured ? "48 DWORD Keys Active" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">DSC Token Middleware:</span>
                    <span className={envStatus.proxKeyInstalled ? "text-emerald-400 font-bold flex items-center gap-1" : "text-amber-400 font-bold"}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {envStatus.proxKeyInstalled ? "ProxKey & HYP2003 Active" : "Ready"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>OS: WIN 7 / 8 / 10 / 11 (x86/x64)</span>
                <span className="text-emerald-400 font-bold">15/15 Steps Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Time System Pulse D3 Gauge Widget */}
      <div>
        <SystemPulseWidget />
      </div>

      <LiveSystemStatsWidget mode="card" onOpenPcBoost={() => setActiveTab('pcboost')} />

      {/* Real-time 17-Step Live Deployment Monitoring Visualizer Widget */}
      <div>
        <LiveStepMonitoringWidget 
          isDeploying={isDeploying} 
          onStartDeployment={onStartDeployment} 
        />
      </div>

      {/* Live OTA Resource Engine & Update Manager */}
      <div>
        <LiveUpdatesView />
      </div>

      {/* Live Broadcast Announcement Widget */}
      <div>
        <LiveAnnouncementWidget setActiveTab={setActiveTab} onOpenPost={onOpenPost} />
      </div>

      {/* Hero Section */}
      <div className="py-2">
        <p className="label text-accent mb-1.5 tracking-widest">[ SYSTEM_V1.1.0 - TELANGANA PR&RD ]</p>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-2.5">
          <h2 className="font-syne text-[clamp(1.65rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em]">
            ALL PROBLEMS,<br />ONE SOLUTION.
          </h2>
          <div className="shrink-0">
            <InstallationCounter />
          </div>
        </div>
        <p className="max-w-[560px] text-xs sm:text-sm leading-relaxed text-ink-medium">
          Enterprise-grade WinForms deployment framework for Telangana Grama Panchayath & Mandal operations. 
          Automated ActiveX policies, USB token PKCS#11 drivers, and UBD IE5 Quirks Mode integration.
        </p>
      </div>

      {/* Release Notes Component */}
      <div>
        <ReleaseNotes />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-2">
        <button 
          className="btn btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => setActiveTab('csharp')}
        >
          <Download size={15} />
          <span>Download C# Solution</span>
        </button>
        <button 
          className="btn btn-accent w-full sm:w-auto text-center flex items-center justify-center gap-2 cursor-pointer"
          onClick={onStartDeployment}
          disabled={isDeploying}
        >
          <Play size={15} />
          <span>{isDeploying ? 'Deploying...' : 'One-Click Deploy'}</span>
        </button>
      </div>
    </div>
  );
};
