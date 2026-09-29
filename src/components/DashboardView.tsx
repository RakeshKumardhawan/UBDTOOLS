import React from 'react';
import { EnvironmentStatus, DepartmentProfile, NavigationTab, LogEntry } from '../types';
import { Download, Play, Shield, CheckCircle2 } from 'lucide-react';
import { LiveSystemStatsWidget } from './LiveSystemStatsWidget';
import { ReleaseNotes } from './ReleaseNotes';

interface DashboardViewProps {
  envStatus: EnvironmentStatus;
  selectedProfile: DepartmentProfile;
  setActiveTab: (tab: NavigationTab) => void;
  onStartDeployment: () => void;
  isDeploying: boolean;
  logs: LogEntry[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onStartDeployment,
  isDeploying,
  envStatus,
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 sm:space-y-10">
      <LiveSystemStatsWidget mode="card" onOpenPcBoost={() => setActiveTab('pcboost')} className="mb-6" />

      {/* Hero Section */}
      <div className="mb-8 sm:mb-12 lg:mb-14">
        <p className="label text-accent mb-2 sm:mb-3 tracking-widest">[ SYSTEM_V1.0.2 - TELANGANA PR&RD ]</p>
        <h2 className="font-syne text-[clamp(1.85rem,4.8vw,3.6rem)] leading-[1.05] sm:leading-[0.95] tracking-[-0.04em] mb-4 sm:mb-6">
          ALL PROBLEMS,<br />ONE SOLUTION.
        </h2>
        <p className="max-w-[560px] text-xs sm:text-sm md:text-base leading-relaxed text-ink-medium">
          Enterprise-grade WinForms deployment framework for Telangana Grama Panchayath & Mandal operations. 
          Automated ActiveX policies, USB token PKCS#11 drivers, and UBD IE5 Quirks Mode integration.
        </p>
      </div>

      {/* Release Notes Component */}
      <div className="mb-10">
        <ReleaseNotes />
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="status-card flex flex-col justify-between">
          <p className="label text-[0.6rem] sm:text-[0.68rem]">OS_COMPATIBILITY</p>
          <div className="flex items-center justify-between mt-3">
            <p className="font-syne text-[1.1rem] sm:text-[1.3rem] text-ink">WIN 7 / 8 / 10 / 11</p>
            <span className="pill text-emerald-400 border-emerald-400/40 text-[0.55rem]">x86 / x64</span>
          </div>
        </div>

        <div className="status-card flex flex-col justify-between">
          <p className="label text-[0.6rem] sm:text-[0.68rem]">CONFIGURATION_STEPS</p>
          <div className="flex items-center justify-between mt-3">
            <p className="font-syne text-[1.1rem] sm:text-[1.3rem] text-accent">15 AUTOMATED</p>
            <span className="pill text-accent border-accent/40 text-[0.55rem]">100% OFFLINE</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
        <button 
          className="btn btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2"
          onClick={() => setActiveTab('csharp')}
        >
          <Download size={15} />
          <span>Download C# Solution</span>
        </button>
        <button 
          className="btn btn-accent w-full sm:w-auto text-center flex items-center justify-center gap-2"
          onClick={onStartDeployment}
          disabled={isDeploying}
        >
          <Play size={15} />
          <span>{isDeploying ? 'Deploying...' : 'One-Click Deploy'}</span>
        </button>
      </div>

      {/* Quick Status Highlights for Small Devices */}
      <div className="border border-ink-faint/60 p-4 sm:p-5 rounded-lg bg-white/[0.01]">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-accent" />
          <span className="font-mono text-xs font-bold text-ink">QUICK READINESS SUMMARY</span>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-ink-faint">
            <span className="text-ink-medium">IE Mode:</span>
            <span className={envStatus.edgeIEModeConfigured ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {envStatus.edgeIEModeConfigured ? "Configured" : "Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-ink-faint">
            <span className="text-ink-medium">Registry:</span>
            <span className={envStatus.registryConfigured ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {envStatus.registryConfigured ? "Configured" : "Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-ink-faint">
            <span className="text-ink-medium">DSC Middleware:</span>
            <span className={envStatus.proxKeyInstalled ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {envStatus.proxKeyInstalled ? "Active" : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
