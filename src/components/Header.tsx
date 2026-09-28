import React from 'react';
import { Menu, X, Terminal, ShieldCheck, ChevronDown } from 'lucide-react';
import { EnvironmentStatus, DepartmentProfile, NavigationTab } from '../types';
import { EVedhikaLogo } from './EVedhikaLogo';
import { LiveSystemStatsWidget } from './LiveSystemStatsWidget';

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
  selectedProfile,
  setSelectedProfile,
  departmentProfiles,
  mobileMenuOpen = false,
  setMobileMenuOpen,
  systemPanelOpen = false,
  setSystemPanelOpen,
}) => {
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
          <EVedhikaLogo size={32} className="w-7 h-7 sm:w-8 sm:h-8" />
          <div>
            <h1 className="font-syne text-[1.15rem] sm:text-[1.4rem] tracking-[-0.04em] text-accent leading-none">
              E-VEDHIKA
            </h1>
            <p className="label mt-0.5 text-[0.55rem] sm:text-[0.62rem] hidden xs:block">
              Universal Deployment Framework
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Profile dropdown, Admin pill & System Console button */}
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

        {/* Admin Badge */}
        <div className="pill text-accent border-accent font-bold hidden md:inline-flex items-center gap-1">
          <ShieldCheck size={11} />
          <span>ADMIN_MODE</span>
        </div>


      </div>
    </header>
  );
};
