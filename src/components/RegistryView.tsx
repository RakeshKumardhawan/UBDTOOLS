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
  RefreshCw,
  Terminal,
  FileCode,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState<'reg' | 'ps1' | 'bat'>('ps1');
  const [copied, setCopied] = useState<string | null>(null);

  const regContent = `Windows Registry Editor Version 5.00

; ====================================================================
; E-Vedhika One-Click Deployment Tool - Master Zone 2 Configuration
; Target Website: https://ubd.telangana.gov.in/
; Developer: Rakesh Dhawan | E-Vedhika
; ====================================================================

; 1. Add ubd.telangana.gov.in to Trusted Sites Zone 2 (HKCU and HKLM)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

; 2. Configure Zone 2 (Trusted Sites) Specific Settings
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"CurrentLevel"=dword:00000000
"Flags"=dword:00000047
"MinLevel"=dword:00010000
"1001"=dword:00000000 ; Download signed ActiveX
"1004"=dword:00000000 ; Download unsigned ActiveX
"1200"=dword:00000000 ; Run ActiveX controls and plug-ins
"1201"=dword:00000000 ; Initialize & script ActiveX not marked as safe
"1206"=dword:00000000 ; Scripting of Web Browser control
"1208"=dword:00000000 ; Run unused ActiveX controls without prompt
"1209"=dword:00000000 ; Scriptlets
"120A"=dword:00000000 ; Override Antivirus protection for ActiveX
"120B"=dword:00000000 ; Override SmartScreen filter for ActiveX
"1400"=dword:00000000 ; Active scripting
"1402"=dword:00000000 ; Scripting of Java applets
"1405"=dword:00000000 ; Script ActiveX controls marked safe
"1406"=dword:00000000 ; Access data sources across domains
"1407"=dword:00000000 ; Allow Programmatic clipboard access
"1408"=dword:00000000 ; Active scripting
"1601"=dword:00000000 ; Submit encrypted/non-encrypted form data
"1604"=dword:00000000 ; Font download
"1606"=dword:00000000 ; Userdata persistence
"1607"=dword:00000000 ; Navigate windows and frames across domains
"1608"=dword:00000000 ; Allow META REFRESH
"1609"=dword:00000000 ; Display mixed content
"160A"=dword:00000000 ; Include local path when uploading files
"1802"=dword:00000000 ; Drag and drop or copy and paste files
"1803"=dword:00000000 ; File download
"1804"=dword:00000000 ; Launching programs and files in an IFRAME
"1806"=dword:00000000 ; Launching applications and unsafe files
"1807"=dword:00000000 ; Navigate sub-frames across different domains
"1808"=dword:00000000 ; Font download
"1809"=dword:00000003 ; Disable Pop-up Blocker (Allow PIN popups)
"2000"=dword:00000000 ; Binary and script behaviors
"2001"=dword:00000000 ; Run .NET-reliant components
"2004"=dword:00000000 ; Run components not signed with Authenticode
"2100"=dword:00000000 ; Open files based on content (MIME Sniffing)
"2101"=dword:00000000 ; Less privileged zone navigation
"2102"=dword:00000000 ; Script-initiated windows without constraints
"2103"=dword:00000000 ; Status bar updates via script
"2104"=dword:00000000 ; Windows without address or status bars
"2105"=dword:00000000 ; Allow scripted prompt windows
"2200"=dword:00000000 ; Automatic prompting for file downloads
"2201"=dword:00000000 ; Automatic prompting for ActiveX
"2300"=dword:00000000 ; Web sites navigation into this zone
"2400"=dword:00000000 ; .NET: XAML browser applications
"2401"=dword:00000000 ; .NET: XPS documents
"2402"=dword:00000000 ; .NET: Loose XAML
"2500"=dword:00000003 ; Turn off Protected Mode for Zone 2 (Allow USB Token)
"2702"=dword:00000003 ; Disable ActiveX Filtering
"2708"=dword:00000000 ; Allow approved domains to use ActiveX
"2709"=dword:00000003 ; Disable Antimalware scan hang on ActiveX
"270C"=dword:00000000 ; Allow Silverlight / COM components

; 3. Enable Microsoft Edge IE Mode Policies & Enterprise Site List
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001

[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001
`;

  const batContent = `@echo off
:: ============================================================================
:: E-Vedhika One-Click Launcher for UBD Telangana Registry Configuration
:: Developed by Rakesh Dhawan | Target: https://ubd.telangana.gov.in/
:: ============================================================================

title E-Vedhika UBD Registry Automation Launcher
color 0B

echo ======================================================================
echo    E-VEDHIKA ONE-CLICK UBD REGISTRY CONFIGURATION LAUNCHER
echo    Target: https://ubd.telangana.gov.in/
echo ======================================================================
echo.

:: Check for Administrative Privileges and Auto-Elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Elevation...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    "%temp%\\getadmin.vbs"
    del "%temp%\\getadmin.vbs"
    exit /b
)

:: Current Directory of the Batch File
cd /d "%~dp0"

echo [1/3] Administrative privileges confirmed.
echo [2/3] Bypassing PowerShell execution restriction for deployment script...
echo [3/3] Launching Configure_UBD_Registry.ps1 ...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Configure_UBD_Registry.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred during PowerShell execution (Exit Code: %errorlevel%).
    echo Please check the error message above.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [SUCCESS] All UBD Registry settings configured and verified!
echo  Audit Report has been saved to C:\\EVedhika_UBD_Backups\\
echo ======================================================================
echo.
pause
`;

  const ps1DownloadUrl = "/scripts/Configure_UBD_Registry.ps1";
  const batDownloadUrl = "/scripts/Launch_UBD_Deployment.bat";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regKeyTable = [
    { id: 'Domain', name: 'ubd.telangana.gov.in', value: 'Zone 2 (Trusted)', desc: 'Added to ZoneMap for https, http, and *' },
    { id: '1200', name: 'Run ActiveX controls and plug-ins', value: 'dword:0 (Enable)', desc: 'Crucial for UBD USB DSC token applets' },
    { id: '1201', name: 'Initialize and script ActiveX not marked safe', value: 'dword:0 (Enable)', desc: 'Allows NIC DigiSigner Helper & ProxKey/ePass to prompt PIN' },
    { id: '1001 & 1004', name: 'Download signed & unsigned ActiveX', value: 'dword:0 (Enable)', desc: 'Allows downloading required digital signing components' },
    { id: '1400', name: 'Active scripting (JavaScript)', value: 'dword:0 (Enable)', desc: 'Enables all form validation and dynamic portal behaviors' },
    { id: '1407', name: 'Programmatic clipboard access', value: 'dword:0 (Enable)', desc: 'Allows copying application numbers and tokens' },
    { id: '1803', name: 'File download', value: 'dword:0 (Enable)', desc: 'Fixes download block error for birth/death certificates and receipts' },
    { id: '1809', name: 'Use Pop-up Blocker', value: 'dword:3 (Disable Blocker)', desc: 'Prevents blocking of DSC PIN modal password dialog' },
    { id: '2001', name: 'Run .NET-reliant components', value: 'dword:0 (Enable)', desc: 'Executes .NET Framework 3.5/4.8 client signing tools' },
    { id: '2500', name: 'Protected Mode in Zone 2', value: 'dword:3 (Disable Mode)', desc: 'Removes sandbox isolation so USB token reader is detected' },
    { id: 'Edge Policy', name: 'InternetExplorerIntegrationLevel', value: 'dword:1 (IE Mode)', desc: 'Routes ubd.telangana.gov.in automatically into IE5 Quirks Mode' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">UBD Registry & Security Zones Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Target: ubd.telangana.gov.in
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automates Zone 2 (Trusted Sites) Registry settings, takes automatic backups, enables ActiveX/DSC tokens, and verifies each setting.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-import-reg-now"
            onClick={onImportRegistry}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
            <span>{isImporting ? 'Applying to Registry...' : 'One-Click Apply Now'}</span>
          </button>

          <a
            href={ps1DownloadUrl}
            download="Configure_UBD_Registry.ps1"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .PS1 Script</span>
          </a>

          <a
            href={batDownloadUrl}
            download="Launch_UBD_Deployment.bat"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Terminal className="w-4 h-4" />
            <span>Download .BAT</span>
          </a>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ముఖ్యమైన భద్రతా గమనిక (Scope & Safety): </span>
          ఈ సెట్టింగ్స్ అన్నీ కేవలం <b>Zone 2 (Trusted Sites)</b> లో మాత్రమే వర్తిస్తాయి. మీ సాధారణ ఇంటర్నెట్ బ్రౌజింగ్ (Zone 3) ఎప్పటిలాగే విండోస్ హై-సెక్యూరిటీ మోడ్‌లోనే సురక్షితంగా ఉంటుంది. అలాగే మార్పులు చేసే ముందు స్క్రిప్ట్ ఆటోమేటిక్‌గా <code>C:\EVedhika_UBD_Backups\</code> లో పూర్తి Registry Backup తీసుకుంటుంది.
        </div>
      </div>

      {/* Script View / Code Selector Tabs */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ps1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'ps1' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>PowerShell Script (.ps1) + Auto-Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('bat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'bat' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>BAT Launcher (.bat)</span>
            </button>

            <button
              onClick={() => setActiveTab('reg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'reg' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Registry File (.reg)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentContent = activeTab === 'ps1' 
                  ? 'Get script from /scripts/Configure_UBD_Registry.ps1' 
                  : activeTab === 'bat' ? batContent : regContent;
                handleCopy(currentContent, activeTab);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied === activeTab ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied === activeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'reg') downloadFile('UBD_TrustedSites_Master.reg', regContent);
                else if (activeTab === 'bat') downloadFile('Launch_UBD_Deployment.bat', batContent);
                else {
                  const link = document.createElement('a');
                  link.href = ps1DownloadUrl;
                  link.download = 'Configure_UBD_Registry.ps1';
                  link.click();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'ps1' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Includes: 1. Auto Self-Elevation (No Right-Click Needed) | 2. Registry Backup | 3. Zone 2 Setting Injection | 4. Deep Verification | 5. TXT Audit Report</span>
              <span className="font-mono text-emerald-400">Status: 1-Click Zero Manual Work</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[380px]">
{`# 1-Click Direct Execution (Auto-Elevates, No Manual Work):
# Double-click or run Configure_UBD_Registry.ps1 directly.
# The script automatically detects admin privileges and self-elevates without requiring manual 'Run as administrator'!

# Highlights of Configure_UBD_Registry.ps1:
1. Auto Self-Elevation: Directly requests Windows elevation without manual right-clicking
2. Current User (HKCU) Fallback: Applies Zone 2 settings even if running on restricted standard accounts
3. Automatically creates full backup in C:\\EVedhika_UBD_Backups\\
4. Adds https://ubd.telangana.gov.in/ to ZoneMap (Zone 2)
5. Maps all 45+ security settings with exact official Windows DWORD values
6. Reads back each key to verify actual vs expected
7. Generates detailed TXT Audit Report: C:\\EVedhika_UBD_Backups\\UBD_Registry_Audit_Report_*.txt`}
            </pre>
          </div>
        )}

        {activeTab === 'bat' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">
              1-Click Double-Click Launcher with built-in UAC VBS elevation shim. Auto-elevates without any manual right-click and triggers the PowerShell engine seamlessly.
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[380px]">
              {batContent}
            </pre>
          </div>
        )}

        {activeTab === 'reg' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">
              Raw Windows Registry (.REG) file for manual import via <code>reg import</code>.
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[380px]">
              {regContent}
            </pre>
          </div>
        )}
      </div>

      {/* Summary Matrix of Mapped Security Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registry Value Mapping Matrix (Zone 2)</h3>
            <p className="text-xs text-slate-500">Every single setting is mapped with its official Windows Registry Value ID and specific Data value:</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            100% Non-Uniform Exact Mapping
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Registry ID</th>
                <th className="py-2.5 px-3">Official Security Setting Name</th>
                <th className="py-2.5 px-3">Configured Value</th>
                <th className="py-2.5 px-3">Operational Purpose for UBD Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regKeyTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{row.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700">{row.value}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
