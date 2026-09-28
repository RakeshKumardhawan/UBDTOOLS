import React from 'react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isDeploying: boolean;
  systemReady: boolean;
  onSelect?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDeploying,
  onSelect,
}) => {

  const workflowItems = [
    { id: 'dashboard' as NavigationTab, label: 'DASHBOARD' },
    { id: 'deploy' as NavigationTab, label: 'DEPLOY_ALL', tag: isDeploying ? 'RUN' : '' },
    { id: 'csharp' as NavigationTab, label: 'C#_VS_SLN', tag: '.NET + BOOST' },
  ];

  const engineItems = [
    { id: 'repair' as NavigationTab, label: 'REPAIR_ENGINE' },
    { id: 'diagnostics' as NavigationTab, label: 'DIAGNOSTICS' },
    { id: 'remote' as NavigationTab, label: 'REMOTE_SUPPORT' },
    { id: 'drivers' as NavigationTab, label: 'DRIVER_MANAGER' },
  ];

  const systemItems = [
    { id: 'browser' as NavigationTab, label: 'BROWSER_IE_MODE' },
    { id: 'registry' as NavigationTab, label: 'REGISTRY_ENGINE' },
    { id: 'dsc' as NavigationTab, label: 'DSC_DIGISIGNER' },
    { id: 'downloads' as NavigationTab, label: 'DOWNLOADS' },
  ];

  const configItems = [
    { id: 'ai' as NavigationTab, label: 'AI_ASSISTANT', tag: 'AI' },
    { id: 'backups' as NavigationTab, label: 'BACKUPS_LOGS' },
    { id: 'settings' as NavigationTab, label: 'SETTINGS' },
    { id: 'help' as NavigationTab, label: 'HELP_DOCS' },
    { id: 'about' as NavigationTab, label: 'ABOUT' },
  ];

  const handleItemClick = (id: NavigationTab) => {
    setActiveTab(id);
    if (onSelect) {
      onSelect();
    }
  };

  const renderNavGroup = (title: string, items: typeof workflowItems) => (
    <div className="nav-group">
      <p className="label text-[0.6rem] sm:text-[0.65rem] text-ink-medium/70">{title}</p>
      {items.map(item => (
        <a 
          key={item.id} 
          onClick={(e) => { e.preventDefault(); handleItemClick(item.id); }}
          className={`nav-item ${activeTab === item.id ? 'active font-bold' : ''}`}
        >
          <span className="truncate">{item.label}</span>
          {item.tag && <span className="tag shrink-0 ml-2">{item.tag}</span>}
        </a>
      ))}
    </div>
  );

  return (
    <aside className="p-5 sm:p-6 lg:p-7 flex flex-col gap-6 sm:gap-7 h-full bg-[#0C0C0E]/95 overflow-y-auto custom-scrollbar border-r border-ink-faint">
      {renderNavGroup('[01] Workflow', workflowItems)}
      {renderNavGroup('[02] Engines', engineItems)}
      {renderNavGroup('[03] System', systemItems)}
      {renderNavGroup('[04] Config', configItems)}
    </aside>
  );
};
