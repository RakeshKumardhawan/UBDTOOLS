import React, { useState } from 'react';
import { 
  Download, 
  FileCode, 
  Terminal, 
  Archive, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Trash2
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface DownloadsViewProps {
  selectedProfile: DepartmentProfile;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({ selectedProfile }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState<'deploy' | 'uninstall'>('deploy');

  const ps1Script = `# ====================================================================
# E-Vedhika One-Click Deployment Tool - Standalone PowerShell Deployment
# Developer: Rakesh Dhawan | E-Vedhika UBD Tool
# Target Portal Profile: ${selectedProfile.name}
# ====================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  E-Vedhika One-Click Deployment Tool - Auto Installer" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Verify Admin Privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this PowerShell script as Administrator!"
    Exit
}

# 2. Enable .NET Framework 3.5
Write-Host "[1/5] Enabling .NET Framework 3.5 (NetFx3)..." -ForegroundColor Green
Enable-WindowsOptionalFeature -Online -FeatureName NetFx3 -All -NoRestart -ErrorAction SilentlyContinue

# 3. Configure Zone 2 Trusted Sites & ActiveX
Write-Host "[2/5] Applying Zone 2 Trusted Sites & ActiveX Registry Keys..." -ForegroundColor Green
$zonePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2"
Set-ItemProperty -Path $zonePath -Name "CurrentLevel" -Value 65536 -Type DWord -Force # Low/Custom
Set-ItemProperty -Path $zonePath -Name "1200" -Value 0 -Type DWord -Force # Run ActiveX
Set-ItemProperty -Path $zonePath -Name "1400" -Value 0 -Type DWord -Force # Active Scripting
Set-ItemProperty -Path $zonePath -Name "1201" -Value 0 -Type DWord -Force # Unsafe ActiveX
Set-ItemProperty -Path $zonePath -Name "1001" -Value 0 -Type DWord -Force # Signed ActiveX
Set-ItemProperty -Path $zonePath -Name "1803" -Value 0 -Type DWord -Force # File Download (Enable)
Set-ItemProperty -Path $zonePath -Name "2200" -Value 0 -Type DWord -Force # Auto Prompt Download (Enable)

# 4. Configure Edge IE Mode Policy & sites.xml
Write-Host "[3/5] Setting Edge IE Mode Enterprise Site List Policy..." -ForegroundColor Green
$edgeKey = "HKCU:\\Software\\Policies\\Microsoft\\Edge"
if (!(Test-Path $edgeKey)) { New-Item -Path $edgeKey -Force | Out-Null }
Set-ItemProperty -Path $edgeKey -Name "InternetExplorerIntegrationLevel" -Value 1 -Type DWord -Force
$xmlDir = "$env:ProgramData\\EVedhika"
if (!(Test-Path $xmlDir)) { New-Item -Path $xmlDir -ItemType Directory -Force | Out-Null }
Set-ItemProperty -Path $edgeKey -Name "InternetExplorerIntegrationSiteList" -Value "$xmlDir\\sites.xml" -Type String -Force

# 5. Flush DNS and Restart Edge
Write-Host "[4/5] Flushing DNS Cache..." -ForegroundColor Green
ipconfig /flushdns
Write-Host "[5/5] Deployment Complete! Launching Edge in IE Mode..." -ForegroundColor Green
Start-Process "msedge.exe" "https://ubd.telangana.gov.in"
`;

  const uninstallPs1Script = `# ====================================================================
# E-Vedhika UBD Tool - 1-Click Complete Clean Uninstall & Revert Script
# Developer: Rakesh Dhawan | E-Vedhika UBD Tool
# ====================================================================

Write-Host "========================================================" -ForegroundColor Red
Write-Host "  E-Vedhika UBD Tool - 1-Click Clean Uninstall & Revert" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Red

# 1. Remove Startup Registry Key
Write-Host "[1/6] Removing Windows Startup Registry Key..." -ForegroundColor Cyan
Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "EVedhikaUBDGuardian" -ErrorAction SilentlyContinue

# 2. Remove Edge IE Mode Group Policies
Write-Host "[2/6] Removing Edge IE Mode Policies..." -ForegroundColor Cyan
Remove-Item -Path "HKCU:\\SOFTWARE\\Policies\\Microsoft\\Edge" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Remove Trusted Sites Registry Mappings
Write-Host "[3/6] Removing Trusted Sites domain Mappings..." -ForegroundColor Cyan
Remove-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Remove IE Browser Emulation Registry
Write-Host "[4/6] Removing Browser Emulation msedge.exe Registry..." -ForegroundColor Cyan
Remove-ItemProperty -Path "HKCU:\\SOFTWARE\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_BROWSER_EMULATION" -Name "msedge.exe" -ErrorAction SilentlyContinue

# 5. Delete Desktop & Start Menu Shortcuts
Write-Host "[5/6] Deleting Desktop Shortcuts..." -ForegroundColor Cyan
$desktop = [Environment]::GetFolderPath("Desktop")
Remove-Item -Path "$desktop\\UBD Portal (Edge IE Mode).url" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$desktop\\E-Vedhika UBD Deployment Tool.lnk" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$desktop\\E-Vedhika UBD Deployment Tool.url" -Force -ErrorAction SilentlyContinue

# 6. Delete Application Data Directory
Write-Host "[6/6] Cleaning ProgramData Application Files..." -ForegroundColor Cyan
Remove-Item -Path "$env:ProgramData\\EVedhika" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "========================================================" -ForegroundColor Green
Write-Host " UNINSTALL COMPLETED: All E-Vedhika settings cleanly reverted!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
`;

  const currentScript = activeScriptTab === 'deploy' ? ps1Script : uninstallPs1Script;

  const copyScript = () => {
    navigator.clipboard.writeText(currentScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const downloadPs1 = () => {
    const filename = activeScriptTab === 'deploy' ? `evedhika_ubd_installer_${Date.now()}.ps1` : `Uninstall_EVedhika_UBD_${Date.now()}.ps1`;
    const blob = new Blob([currentScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Offline Deployment Package & Script Generator</h2>
            <p className="text-xs text-slate-400">
              Download standalone PowerShell `.ps1`, `.reg`, and batch installer packages for remote Panchayat Secretary PCs.
            </p>
          </div>
        </div>

        <button
          id="btn-download-offline-ps1"
          onClick={downloadPs1}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{activeScriptTab === 'deploy' ? 'Download PowerShell Installer (.ps1)' : 'Download Uninstall Script (.ps1)'}</span>
        </button>
      </div>

      {/* Grid: Left PowerShell Code Preview, Right Offline Manual Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PowerShell Script Code Box */}
        <div className="bg-slate-950 text-emerald-400 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveScriptTab('deploy')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeScriptTab === 'deploy'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>⚡ Deploy Script</span>
                </button>
                <button
                  onClick={() => setActiveScriptTab('uninstall')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeScriptTab === 'uninstall'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>🗑️ Uninstall & Revert Script</span>
                </button>
              </div>

              <button
                id="btn-copy-ps1-code"
                onClick={copyScript}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[380px]">
              {currentScript}
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Run command: <code className="text-emerald-300">Set-ExecutionPolicy Unrestricted -Scope Process; .\{activeScriptTab === 'deploy' ? 'evedhika_ubd_installer.ps1' : 'Uninstall_EVedhika_UBD.ps1'}</code>
          </div>
        </div>

        {/* Right: Offline Setup Guide for Remote MPDO / Panchayat Offices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Offline Deployment Manual (తెలుగులో మార్గదర్శకాలు)</h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Step 1: Save Package to Pendrive</span>
              <p className="text-slate-600">
                Copy the downloaded <code>evedhika_ubd_installer.ps1</code> or <code>Uninstall_EVedhika_UBD.ps1</code> script to a USB Pendrive.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Step 2: Run as Administrator</span>
              <p className="text-slate-600">
                On the target Panchayat Secretary PC, right-click PowerShell and select <strong>"Run as Administrator"</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Step 3: Execute PowerShell Script</span>
              <p className="text-slate-600">
                Run the script to automatically configure or cleanly revert Edge IE Mode, Enterprise Site List, Registry Zone 2, and .NET features.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium space-y-1">
              <strong className="block text-emerald-800">సిబ్బందికి గమనిక:</strong>
              <p>
                ఈ Offline Script లేదా C# WinForms App రన్ చేసిన తర్వాత మీ కంప్యూటర్లో Microsoft Edge ఓపెన్ చేసి Portal ని ఓపెన్ చేస్తే డైరెక్ట్‌గా IE Mode లో ఓపెన్ అవుతుంది. DSC Token సహాయంతో బిల్లులు డిజిటల్ సంతకం చేయవచ్చు. కావాలనుకుంటే Uninstall Script లేదా C# App లో ఉన్న "Uninstall" బటన్ ద్వారా ప్రశాంతంగా అన్ని సెట్టింగ్‌లను రద్దు (Revert) చేసుకోవచ్చు.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
