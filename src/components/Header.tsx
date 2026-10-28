import React, { useState } from 'react';
import { Menu, X, ShieldCheck, ChevronDown, Github, Megaphone, Cpu, QrCode } from 'lucide-react';
import { EnvironmentStatus, DepartmentProfile, NavigationTab } from '../types';
import { EVedhikaLogo } from './EVedhikaLogo';
import { LiveSystemStatsWidget } from './LiveSystemStatsWidget';
import { getDeviceHardwareIdentity } from '../utils/hardwareIdentity';
import { DeviceIdentityCard } from './DeviceIdentityCard';
import { InstallationCounter } from './InstallationCounter';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  envStatus: EnvironmentStatus;
  selectedProfile: DepartmentProfile;
  setSelectedProfile: (profile: DepartmentProfile) => void;
  departmentProfiles: DepartmentProfile[];
  onTriggerDeploy: () => void;
  onRefreshEnv: () => void;
  isDeploying: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  systemPanelOpen?: boolean;
  setSystemPanelOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  selectedProfile,
  setSelectedProfile,
  departmentProfiles,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) => {
  const deviceHw = getDeviceHardwareIdentity();
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  return (
    <header className="border-b-[1.5px] border-ink px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center z-20 bg-bg shrink-0">
      {/* Left: Hamburger (mobile/tablet) + Logo & App Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {setMobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-ink hover:text-accent border border-ink-faint rounded hover:border-accent transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <EVedhikaLogo size={36} className="w-8 h-8 sm:w-9 sm:h-9" />
          <div>
            <h1 className="font-syne text-[1.25rem] sm:text-[1.5rem] font-black tracking-tight text-accent leading-none">
              E-VEDHIKA
            </h1>
            <p className="label mt-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold tracking-[0.1em] text-ink-medium hidden xs:block uppercase">
              UBD ENTERPRISE SOLUTION
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Profile dropdown, Post button, Admin pill & System Console button */}
      <div className="flex gap-2 sm:gap-3 items-center">
        {/* Real-Time System RAM & Junk Stats */}
        <div className="hidden lg:block">
          <LiveSystemStatsWidget mode="compact" />
        </div>

        {/* Profile Selector */}
        <div className="relative">
          <select
            className="btn py-1.5 sm:py-2 px-2.5 sm:px-4 text-[0.6rem] sm:text-[0.68rem] bg-bg outline-none appearance-none pr-7 cursor-pointer max-w-[200px] sm:max-w-none truncate"
            value={selectedProfile.id}
            onChange={(e) => {
              const found = departmentProfiles.find(p => p.id === e.target.value);
              if (found) setSelectedProfile(found);
            }}
          >
            {departmentProfiles.map((prof) => (
              <option key={prof.id} value={prof.id} className="bg-bg text-ink">
                {prof.name}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-medium pointer-events-none" />
        </div>

        {/* Post Publisher Quick Button */}
        <button
          onClick={() => setActiveTab('posts')}
          className="pill text-amber-300 border-amber-400/40 hover:border-amber-300 hover:bg-amber-400/10 transition-colors inline-flex items-center gap-1.5 font-mono text-[0.65rem] cursor-pointer"
          title="Open Post Publisher & Broadcast Manager"
        >
          <Megaphone size={12} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">📢 Post Publisher</span>
          <span className="sm:hidden">Post</span>
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/Rakeshkumardhawan/UBDTOOLS"
          target="_blank"
          rel="noopener noreferrer"
          className="pill text-cyan-400 border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors inline-flex items-center gap-1.5 font-mono text-[0.65rem]"
          title="Open Official GitHub Repository (UBDTOOLS)"
        >
          <Github size={12} />
          <span className="hidden sm:inline">GitHub:</span>
          <span>UBDTOOLS</span>
        </a>

        {/* Installation Counter (Total Unique PCs) */}
        <div className="hidden xs:block">
          <InstallationCounter />
        </div>

        {/* Device Hardware Identity Badge Pill (Clickable) */}
        <button 
          onClick={() => setShowBadgeModal(true)}
          className="pill text-emerald-300 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all font-mono text-[0.62rem] inline-flex items-center gap-1.5 cursor-pointer"
          title={`Click to open printable hardware verification badge for ${deviceHw.hardwareId}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cpu size={11} className="text-emerald-400" />
          <span className="hidden xl:inline text-slate-400">Device ID:</span>
          <span className="font-bold text-emerald-300">{deviceHw.hardwareId}</span>
          <QrCode size={11} className="text-emerald-400 ml-0.5" />
        </button>

        {/* Admin Badge */}
        <div className="pill text-accent border-accent font-bold hidden md:inline-flex items-center gap-1">
          <ShieldCheck size={11} />
          <span>ADMIN_MODE</span>
        </div>
      </div>

      {/* Badge Modal Overlay */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <DeviceIdentityCard
            deviceIdentity={deviceHw}
            officeLocation={selectedProfile.name}
            onClose={() => setShowBadgeModal(false)}
            isModal={true}
          />
        </div>
      )}
    </header>
  );
};
