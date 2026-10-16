import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code, 
  FileText,
  Zap,
  RefreshCw
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface RegistryViewProps {
  selectedProfile: DepartmentProfile;
  onImportRegistry: () => void;
  isImporting: boolean;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  selectedProfile,
  onImportRegistry,
  isImporting,
}) => {
  const [copiedReg, setCopiedReg] = useState(false);

  const regContent = `Windows Registry Editor Version 5.00

; ====================================================================
; E-Vedhika One-Click Deployment Tool - Registry Configuration Script
; Developer: Rakesh Dhawan | E-Vedhika UBD Tool
; Target Profile: ${selectedProfile.name}
; Generated Date: ${new Date().toISOString()}
; ====================================================================

; 1. Add Enterprise Domains to Internet Explorer Zone 2 (Trusted Sites)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in]
"*"=dword:00000002

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002

; 2. Configure Zone 2 (Trusted Sites) ActiveX Controls & Execution Privileges
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"1200"=dword:00000000 ; Run ActiveX controls and plug-ins (Enable)
"1201"=dword:00000000 ; Initialize and script ActiveX controls not marked as safe (Enable)
"1400"=dword:00000000 ; Active scripting (Enable)
"1405"=dword:00000000 ; Script ActiveX controls marked safe for scripting (Enable)
"1803"=dword:00000000 ; File download (Enable - Fixes Security Alert Download Error)
"2200"=dword:00000000 ; Automatic prompting for file downloads (Enable)
"2201"=dword:00000000 ; ActiveX controls without prompt (Enable)

; 3. Enable Microsoft Edge IE Mode Policies
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\enterprise_compat\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001
`;

  const copyRegToClipboard = () => {
    navigator.clipboard.writeText(regContent);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 2000);
  };

  const downloadRegFile = () => {
    const blob = new Blob([regContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise_compat_config_${Date.now()}.reg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regKeyTable = [
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\ZoneMap\\Domains\\internal.domain.com',
      value: '*=0x00000002',
      purpose: 'Maps *.internal.domain.com to Trusted Sites (Zone 2)',
    },
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\Zones\\2\\1200',
      value: '1200=0x00000000',
      purpose: 'Allows ActiveX controls to execute without blocking',
    },
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\Zones\\2\\1201',
      value: '1201=0x00000000',
      purpose: 'Allows unsigned NIC DigiSigner ActiveX initialization',
    },
    {
      hive: 'HKLM',
      path: 'SOFTWARE\\Policies\\Microsoft\\Edge',
      value: 'InternetExplorerIntegrationLevel=1',
      purpose: 'Enables Microsoft Edge Internet Explorer Integration Mode',
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Windows Registry & Policy Engine</h2>
            <p className="text-xs text-slate-500">
              Automates registry writes for Internet Explorer security zones, ActiveX permissions, and Edge Group Policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-import-reg-now"
            onClick={onImportRegistry}
            disabled={isImporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
            <span>{isImporting ? 'Importing Registry...' : 'Import Registry Settings'}</span>
          </button>

          <button
            id="btn-download-reg-file"
            onClick={downloadRegFile}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .REG Script</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Key Table, Right .REG Script Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Registry Key Matrix */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Configured Registry Keys & Policies</h3>

          <div className="space-y-3">
            {regKeyTable.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 font-mono">{item.hive}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                    {item.value}
                  </span>
                </div>
                <div className="text-slate-700 font-mono text-[11px] truncate">{item.path}</div>
                <div className="text-slate-500 text-[11px] pt-1">{item.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Raw .REG Script Payload Preview */}
        <div className="bg-slate-950 text-emerald-400 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>evedhika_ubd_config.reg Payload</span>
              </div>

              <button
                id="btn-copy-reg-text"
                onClick={copyRegToClipboard}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedReg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReg ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[350px]">
              {regContent}
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Executable command: <code className="text-emerald-300">reg import evedhika_ubd_config.reg</code>
          </div>
        </div>
      </div>
    </div>
  );
};
