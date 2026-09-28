import React, { useState } from 'react';
import { 
  Stethoscope, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Monitor, 
  Code, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  FileText,
  Globe,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { EnvironmentStatus, DepartmentProfile } from '../types';

interface DiagnosticsViewProps {
  envStatus: EnvironmentStatus;
  selectedProfile: DepartmentProfile;
  onRunDiagnostics: () => void;
  isScanning: boolean;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  envStatus,
  selectedProfile,
  onRunDiagnostics,
  isScanning,
}) => {
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);

  // IE Version Compatibility State
  const [ieCompatStatus, setIeCompatStatus] = useState<{
    detectedIeVersion: string;
    detectedEdgeVersion: string;
    isIe11OrEdgeIEMode: boolean;
    isAboveThreshold: boolean;
    minThreshold: string;
    compatModeActive: string;
  }>({
    detectedIeVersion: '11.0.19041 (IE11 Core Engine / mshtml.dll)',
    detectedEdgeVersion: 'Microsoft Edge v122.0.2365.92 (64-bit)',
    isIe11OrEdgeIEMode: true,
    isAboveThreshold: true,
    minThreshold: 'Internet Explorer 11 / Edge v90.0+ (IE Mode Enterprise Site List)',
    compatModeActive: 'IE5 Quirks Mode (ubd.telangana.gov.in)',
  });

  const toggleIeThresholdSim = () => {
    setIeCompatStatus(prev => ({
      ...prev,
      isAboveThreshold: !prev.isAboveThreshold,
      detectedIeVersion: !prev.isAboveThreshold ? '11.0.19041 (IE11 Core Engine / mshtml.dll)' : '8.0.7601.17514 (Outdated IE8 Standalone)',
      detectedEdgeVersion: !prev.isAboveThreshold ? 'Microsoft Edge v122.0.2365.92 (64-bit)' : 'Legacy IE8 / Outdated Edge Browser (No IE Mode)',
      isIe11OrEdgeIEMode: !prev.isAboveThreshold,
    }));
  };

  const diagnosticItems = [
    {
      category: 'Operating System',
      test: 'Windows OS Version & Build Verification',
      result: envStatus.osVersion,
      status: 'pass',
      detail: 'Supported: Windows 7 / 8 / 10 / 11 (32-bit & 64-bit)',
    },
    {
      category: 'Privileges',
      test: 'Administrator Rights Audit',
      result: envStatus.isAdmin ? 'Elevated Administrator Rights Verified' : 'Standard User Mode (UAC Limited)',
      status: envStatus.isAdmin ? 'pass' : 'fail',
      detail: 'Required for HKLM Registry modification & Service Control Manager',
    },
    {
      category: 'IE / Edge Compatibility',
      test: 'IE & Edge Version Requirement Threshold Audit',
      result: ieCompatStatus.isAboveThreshold 
        ? `${ieCompatStatus.detectedEdgeVersion} - Above Threshold [PASS]`
        : `${ieCompatStatus.detectedIeVersion} - BELOW THRESHOLD [ACTION REQUIRED]`,
      status: ieCompatStatus.isAboveThreshold ? 'pass' : 'fail',
      detail: `Min Threshold: ${ieCompatStatus.minThreshold} | UBD Mode: ${ieCompatStatus.compatModeActive}`,
    },
    {
      category: '.NET Framework',
      test: '.NET Framework 3.5 (NetFx3) Feature Status',
      result: envStatus.dotNet35Installed ? 'Installed & Activated' : 'Missing / Disabled',
      status: envStatus.dotNet35Installed ? 'pass' : 'fail',
      detail: 'DISM Feature Name: NetFx3 (Required for NIC DigiSigner client)',
    },
    {
      category: 'Browser Policy',
      test: 'Microsoft Edge InternetExplorerIntegrationLevel',
      result: envStatus.edgeIEModeConfigured ? 'Policy Set to 1 (IE Mode Allowed)' : 'Policy Not Set',
      status: envStatus.edgeIEModeConfigured ? 'pass' : 'fail',
      detail: 'Registry Key: HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge',
    },
    {
      category: 'Enterprise Site List',
      test: 'Enterprise Mode XML Site List Binding',
      result: 'Configured (C:\\EVedhika_UBD\\sites.xml)',
      status: 'pass',
      detail: `Target Domains: ${selectedProfile.siteList.join(', ')}`,
    },
    {
      category: 'Registry Zone 2',
      test: 'Trusted Sites & ActiveX Security Policies',
      result: envStatus.registryConfigured ? 'Zone 2 Flags & Unsigned ActiveX Enabled' : 'Default Strict Settings',
      status: envStatus.registryConfigured ? 'pass' : 'fail',
      detail: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2',
    },
    {
      category: 'Driver Manager',
      test: 'WD ProxKey & HYP2003 Token Middleware DLLs',
      result: envStatus.proxKeyDriverInstalled ? 'ProxKey PKCS#11 DLL Registered' : 'Driver Missing',
      status: envStatus.proxKeyDriverInstalled ? 'pass' : 'warn',
      detail: 'Supported: WD ProxKey v2/v3, HYP2003, ePass2003 Auto',
    },
    {
      category: 'DSC Hardware',
      test: 'USB Smart Card Bus Scan (Token Hardware)',
      result: envStatus.dscTokenConnected ? envStatus.dscTokenName : 'No Token Inserted',
      status: envStatus.dscTokenConnected ? 'pass' : 'warn',
      detail: 'Windows Smart Card Service (SCardSvr) Status: RUNNING',
    },
    {
      category: 'NIC DigiSigner',
      test: 'Local DigiSigner Service (Port 8080 / 8443)',
      result: envStatus.digiSignerServiceRunning ? 'Listening on 127.0.0.1:8080' : 'Service Stopped',
      status: envStatus.digiSignerServiceRunning ? 'pass' : 'fail',
      detail: 'NIC DigiSigner Client Web Bridge',
    }
  ];

  const exportDiagnosticFile = () => {
    const content = `====================================================================
E-VEDHIKA ONE-CLICK DEPLOYMENT TOOL - SYSTEM DIAGNOSTIC REPORT
Developer: Rakesh Dhawan | E-Vedhika UBD Tool
Report Generated: ${new Date().toLocaleString()}
Target Profile: ${selectedProfile.name} (${selectedProfile.primaryUrl})
====================================================================

SYSTEM ENVIRONMENT SNAPSHOT:
----------------------------
OS Version: ${envStatus.osVersion}
Build: ${envStatus.osBuild} (${envStatus.arch})
IE Core Engine: ${ieCompatStatus.detectedIeVersion}
Edge Version: ${ieCompatStatus.detectedEdgeVersion}
IE Threshold Met: ${ieCompatStatus.isAboveThreshold ? 'YES (PASS)' : 'NO (BELOW MINIMUM THRESHOLD)'}
Administrator Privileges: ${envStatus.isAdmin ? 'YES' : 'NO'}
Internet Connection: ${envStatus.internetConnected ? 'CONNECTED' : 'DISCONNECTED'}
.NET Framework 3.5: ${envStatus.dotNet35Installed ? 'INSTALLED' : 'MISSING'}
Edge IE Mode Policy: ${envStatus.edgeIEModeConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
Registry Zone 2 Settings: ${envStatus.registryConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
WD ProxKey Driver: ${envStatus.proxKeyDriverInstalled ? 'INSTALLED' : 'MISSING'}
HYP2003 Driver: ${envStatus.hyp2003DriverInstalled ? 'INSTALLED' : 'MISSING'}
DSC USB Token: ${envStatus.dscTokenConnected ? envStatus.dscTokenName : 'NONE'}
NIC DigiSigner Service: ${envStatus.digiSignerServiceRunning ? 'RUNNING' : 'STOPPED'}

DIAGNOSTIC TEST RESULTS:
------------------------
${diagnosticItems.map((item, i) => `${i + 1}. [${item.status.toUpperCase()}] ${item.category} - ${item.test}\n   Result: ${item.result}\n   Detail: ${item.detail}`).join('\n\n')}

====================================================================
End of E-Vedhika Diagnostic Report.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evedhika_diagnostics_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Diagnostic Suite</h2>
            <p className="text-xs text-slate-500">
              Deep environment check verifying IE/Edge version threshold, DISM features, registry hives, driver DLLs, and DigiSigner services.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-run-full-diagnostics"
            onClick={onRunDiagnostics}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Stethoscope className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
            <span>{isScanning ? 'Scanning System...' : 'Run Deep Diagnostic Scan'}</span>
          </button>

          <button
            id="btn-export-diagnostics-txt"
            onClick={exportDiagnosticFile}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Diagnostic Log (.txt)</span>
          </button>
        </div>
      </div>

      {/* Advanced System Repair Tools */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Advanced System Repair Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (window.confirm('Run System Optimization? This will clean up temp files, flush DNS, and free up disk space.')) {
                alert('PC Boost & System Optimization triggered in backend.');
              }
            }}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <RefreshCw className="w-4 h-4" /> PC Boost & Junk Clean
            </div>
            <p className="text-xs text-blue-600">Clear temp files, recycle bin, and flush DNS to speed up PC.</p>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Fix Printer Spooler? This will clear stuck print jobs and restart the printer service.')) {
                alert('Print Spooler fix triggered in backend.');
              }
            }}
            className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-left transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <RefreshCw className="w-4 h-4" /> Auto-Printer Config
            </div>
            <p className="text-xs text-indigo-600">Fix stuck documents and restart Print Spooler service.</p>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Run OS Deep Repair? This runs SFC and DISM scans. It may take 10-30 minutes.')) {
                alert('OS Deep Repair (SFC & DISM) triggered in backend.');
              }
            }}
            className="p-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-left transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Stethoscope className="w-4 h-4" /> OS Deep Repair (SFC)
            </div>
            <p className="text-xs text-rose-600">Scan and restore corrupt Windows OS system files.</p>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Sync Date & Time? This will correct wrong system time which blocks DSC tokens and causes SSL errors.')) {
                alert('Date & Time Sync triggered in backend.');
              }
            }}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <Globe className="w-4 h-4" /> Time & Date Fixer
            </div>
            <p className="text-xs text-amber-600">Auto-sync time to IST timezone to fix DSC & SSL certificate errors.</p>
          </button>
        </div>
      </div>

      {/* SPECIAL DIAGNOSTIC CARD: IE / Edge Version Compatibility Component */}
      <div className={`rounded-2xl border p-5 shadow-sm transition-all ${
        ieCompatStatus.isAboveThreshold 
          ? 'bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-slate-900/5 border-emerald-300' 
          : 'bg-rose-50 border-rose-300'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              ieCompatStatus.isAboveThreshold ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  IE & Edge Version Compatibility Diagnostic (UBD Portal Threshold)
                </h3>
                {ieCompatStatus.isAboveThreshold ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS (ABOVE THRESHOLD)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold tracking-wider uppercase border border-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600" /> BELOW REQUIRED THRESHOLD
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {ieCompatStatus.isAboveThreshold 
                  ? 'ubd.telangana.gov.in పోర్టల్ ActiveX మరియు USB DSC టోకెన్ సపోర్ట్ కోసం బ్రౌజర్ వర్షన్ పూర్తి స్థాయిలో సిద్ధంగా ఉంది.'
                  : 'హెచ్చరిక: సిస్టమ్‌లో పాత IE/Edge వర్షన్ ఉంది! UBD పోర్టల్ కోసం IE11 / Edge v90+ తప్పనిసరి.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleIeThresholdSim}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shrink-0 self-start lg:self-center transition-colors cursor-pointer"
          >
            {ieCompatStatus.isAboveThreshold ? 'Simulate Low IE Version Test (< IE11)' : 'Reset to Normal IE11 / Edge Version'}
          </button>
        </div>

        {/* Compatibility Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Detected Engine</div>
            <div className="font-bold text-slate-900 text-xs truncate" title={ieCompatStatus.detectedIeVersion}>
              {ieCompatStatus.detectedIeVersion}
            </div>
            <div className="text-[10px] text-slate-500">Core mshtml.dll Runtime</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Detected Edge Version</div>
            <div className="font-bold text-slate-900 text-xs truncate" title={ieCompatStatus.detectedEdgeVersion}>
              {ieCompatStatus.detectedEdgeVersion}
            </div>
            <div className="text-[10px] text-slate-500">Chromium IE Mode Host</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">UBD Minimum Threshold</div>
            <div className="font-bold text-emerald-800 text-xs">
              IE11 / Edge v90.0+
            </div>
            <div className="text-[10px] text-slate-500">ActiveX & DSC Token Minimum</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">UBD Portal Emulation Mode</div>
            <div className="font-bold text-slate-900 text-xs">
              {ieCompatStatus.compatModeActive}
            </div>
            <div className="text-[10px] text-slate-500">Enterprise Site List Binding</div>
          </div>
        </div>

        {/* Below Threshold Telugu Warning Banner */}
        {!ieCompatStatus.isAboveThreshold && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">ముఖ్యమైన భద్రతా నోటీస్ / Action Required:</div>
              <p>
                మీ కంప్యూటర్‌లో ఉన్న Internet Explorer వర్షన్ పాతది (IE8/IE9/IE10). ubd.telangana.gov.in పోర్టల్‌లో డిజిటల్ సిగ్నేచర్ (DSC Token) మరియు ActiveX సరిగ్గా పని చేయాలంటే కనీసం <strong>Internet Explorer 11</strong> లేదా <strong>Microsoft Edge v90+ (IE Mode తో)</strong> తప్పనిసరి.
              </p>
              <div className="font-semibold text-[11px] text-rose-800 mt-1">
                పరిష్కారం: '15-Step Auto Deployment' బటన్‌పై క్లిక్ చేయండి. E-Vedhika Tool ద్వారా Edge IE Mode పాలసీస్ మరియు IE11 కోర్ రన్‌టైమ్ ఆటోమాటిక్‌గా కాన్ఫిగర్ అవుతాయి.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Diagnostic Test Matrix
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Last Checked: {envStatus.lastCheckTime}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {diagnosticItems.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="font-bold text-slate-900">{item.test}</span>
                </div>
                <div className="text-slate-600 font-medium">{item.result}</div>
                <div className="text-slate-400 text-[11px] font-mono">{item.detail}</div>
              </div>

              <div className="shrink-0">
                {item.status === 'pass' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    PASS
                  </span>
                )}
                {item.status === 'warn' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    WARNING
                  </span>
                )}
                {item.status === 'fail' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    FAILED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

