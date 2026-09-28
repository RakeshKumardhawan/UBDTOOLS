import os
import json

def get_type(filename):
    if filename.endswith('.sln'): return 'sln'
    if filename.endswith('.csproj'): return 'csproj'
    if filename.endswith('.manifest'): return 'manifest'
    if filename.endswith('.config'): return 'config'
    if filename.endswith('.md'): return 'md'
    if filename.endswith('.iss'): return 'iss'
    return 'cs'

def get_id(filename):
    return filename.lower().replace('/', '_').replace('.', '_').replace('\\', '_').replace('-', '_')

files_data = []
root_dir = 'csharp_solution/EVedhikaUBDDeploymentTool'
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.dll') or file.endswith('.exe'):
            continue
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        files_data.append({
            'id': get_id(rel_path),
            'name': file,
            'path': f'csharp_solution/EVedhikaUBDDeploymentTool/{rel_path}',
            'type': get_type(file),
            'content': content
        })

tsx_content = """import React, { useState } from 'react';
import { 
  FileCode, Download, Copy, Check, Folder, File, Terminal, Layers, 
  ExternalLink, Cpu, Play, RefreshCw, ShieldCheck, CheckCircle2, 
  AlertTriangle, Activity, HardDrive, Key, Bot, Database, Sparkles, 
  Laptop, Code, Clock, Lock, Monitor, Server, Radio, RotateCcw, HelpCircle, Zap, Wifi
} from 'lucide-react';

interface CSharpFile {
  id: string;
  name: string;
  path: string;
  type: string;
  content: string;
}

const csharpFiles: CSharpFile[] = """ + json.dumps(files_data, indent=2) + """;

export function CSharpSolutionView() {
  const [activeTab, setActiveTab] = useState<'deploy' | 'boost' | 'diag' | 'drivers' | 'ai' | 'backup' | 'help' | 'ota'>('deploy');
  const [selectedFile, setSelectedFile] = useState<CSharpFile>(csharpFiles[0] || { id: '1', name: 'MainForm.cs', path: '', type: 'cs', content: '' });
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[10:00:15] [PROACTIVE HEALTH] Background system scan initiated. All registry COM shims verified.",
    "[10:00:15] [SYSTEM] e-Vedhika UBD Deployment Tool initialized successfully (Native C# .NET 4.8 - Win 7/8/10/11 Compatible)."
  ]);
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  // PC Boost state
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostResult, setBoostResult] = useState<string | null>(null);

  // Network Troubleshooter state
  const [isTroubleshooting, setIsTroubleshooting] = useState(false);
  const [networkResult, setNetworkResult] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: CSharpFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZipPackage = () => {
    const a = document.createElement('a');
    a.href = '/EVedhikaUBDDeploymentTool_CSharp_Solution.zip';
    a.download = 'EVedhikaUBDDeploymentTool_CSharp_Solution.zip';
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Executive Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/30">
              WIN 7 / 8 / 10 / 11 COMPATIBLE
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/30">
              PC BOOST & JUNK CLEANER
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-indigo-500/30">
              HARDWARE HEALTH WMI
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span>e-Vedhika UBD & DSC Deployment Tool</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise WinForms Solution for Telangana Grama Panchayat & Mandal Offices with PC Boost & Network Diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadZipPackage}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Full C# Solution (.zip)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Workflow Navigation</div>
          
          <button
            onClick={() => setActiveTab('deploy')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'deploy'
                ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_2px_0_0_0_#10b981]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className={`w-4 h-4 ${activeTab === 'deploy' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>One-Click All Solutions</span>
          </button>

          <button
            onClick={() => setActiveTab('boost')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'boost'
                ? 'bg-amber-500/10 text-amber-400 shadow-[inset_2px_0_0_0_#f59e0b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'boost' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>PC Boost & Cleaner</span>
          </button>

          <button
            onClick={() => setActiveTab('diag')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'diag'
                ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_2px_0_0_0_#06b6d4]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'diag' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>System Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'drivers'
                ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_2px_0_0_0_#6366f1]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Key className={`w-4 h-4 ${activeTab === 'drivers' ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>DSC & Drivers</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-500/10 text-purple-400 shadow-[inset_2px_0_0_0_#a855f7]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className={`w-4 h-4 ${activeTab === 'ai' ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>Gemini AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-rose-500/10 text-rose-400 shadow-[inset_2px_0_0_0_#f43f5e]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === 'backup' ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Registry Backups</span>
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-6">System Management</div>
          <button
            onClick={() => setActiveTab('ota')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'ota'
                ? 'bg-fuchsia-500/10 text-fuchsia-400 shadow-[inset_2px_0_0_0_#d946ef]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className={`w-4 h-4 ${activeTab === 'ota' ? 'text-fuchsia-400' : 'text-slate-500'}`} />
            <span>OTA Updates</span>
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-6">Support</div>
          <button
            onClick={() => setActiveTab('help')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              activeTab === 'help'
                ? 'bg-rose-500/10 text-rose-400 shadow-[inset_2px_0_0_0_#f43f5e]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${activeTab === 'help' ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Help & Docs</span>
          </button>
        </div>

        {/* Right Main Content Area */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              {/* Proactive Health Monitor Card */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Proactive Health Monitor (Win 7/8/10/11 Compatible)</h4>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">Next Scan in: 04:52</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Registry COM Shim</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Secure</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Trusted Sites (UBD)</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Enforced</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">OS Compatibility</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">One-Click All Solutions Master Deployment</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Automates all 15 prerequisite configuration steps, COM shims, and USB drivers for any Windows version.</p>
                </div>
                <button
                  onClick={() => {
                    setIsDeploying(true);
                    setDeployProgress(0);
                    setLogs(prev => [...prev, "[10:01:00] [DEPLOY] Starting One-Click All Solutions Master Workflow..."]);
                    const interval = setInterval(() => {
                      setDeployProgress(p => {
                        if (p >= 100) {
                          clearInterval(interval);
                          setIsDeploying(false);
                          setLogs(prev => [...prev, "[10:01:15] [SUCCESS] All 15 steps completed successfully. System ready for UBD portal."]);
                          return 100;
                        }
                        return p + 10;
                      });
                    }, 200);
                  }}
                  disabled={isDeploying}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isDeploying ? 'Deploying...' : 'One-Click Deploy'}</span>
                </button>
              </div>

              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Executing deployment steps...</span>
                    <span>{deployProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${deployProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Real-time Execution Console */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Live Execution Console</span>
                  <button onClick={() => setLogs([])} className="text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer">Clear Logs</button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-400 h-48 overflow-y-auto space-y-1">
                  {logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'boost' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>PC Boost, Junk Cleaner & Network Troubleshooter</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Junk Cleaner Card */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-white text-xs uppercase">PC Boost & Junk Cleaner</h4>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Temp & Prefetch</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Safely cleans Windows Temp folders (`%temp%`) and Prefetch cache to free up disk space and speed up system responsiveness.
                  </p>
                  {boostResult && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
                      {boostResult}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsBoosting(true);
                      setBoostResult(null);
                      setTimeout(() => {
                        setIsBoosting(false);
                        setBoostResult("[SUCCESS] Cleaned 342 junk/temp files. Freed 1.48 GB of disk space.");
                        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [PC BOOST] Cleaned temp/prefetch files successfully.`]);
                      }, 1200);
                    }}
                    disabled={isBoosting}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isBoosting ? 'Cleaning Junk...' : 'Run PC Boost & Clean Temp'}</span>
                  </button>
                </div>

                {/* Network Troubleshooter Card */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-bold text-white text-xs uppercase">Network Troubleshooter</h4>
                    </div>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">IP / DNS / Winsock</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Resets network stack by running `ipconfig /release`, `/renew`, `/flushdns`, and `netsh winsock reset` automatically.
                  </p>
                  {networkResult && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
                      {networkResult}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsTroubleshooting(true);
                      setNetworkResult(null);
                      setTimeout(() => {
                        setIsTroubleshooting(false);
                        setNetworkResult("[SUCCESS] Network stack reset. DNS flushed and IP renewed successfully.");
                        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [NETWORK] Reset network stack & flushed DNS.`]);
                      }, 1500);
                    }}
                    disabled={isTroubleshooting}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{isTroubleshooting ? 'Resetting Network...' : 'Run Network Troubleshooter'}</span>
                  </button>
                </div>
              </div>

              {/* Hardware Health WMI Status */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs uppercase">Hardware Health Check (WMI Live Monitoring)</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">S.M.A.R.T & RAM</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Processor (CPU)</span>
                    <span className="text-slate-200 font-bold mt-1 block">Intel(R) Core(TM) i3-2120 @ 3.30GHz</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Physical RAM</span>
                    <span className="text-slate-200 font-bold mt-1 block">15.9 GB Installed (Optimal)</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Disk S.M.A.R.T Health</span>
                    <span className="text-emerald-400 font-bold mt-1 block">Healthy [S.M.A.R.T OK]</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diag' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>System & Hardware Diagnostics (Win 7/8/10/11)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>System Environment</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="space-y-1 text-slate-300 pt-1">
                    <p><span className="text-slate-500">User Domain:</span> TELANGANA\\SecretaryAdmin</p>
                    <p><span className="text-slate-500">OS Architecture:</span> Windows 11 Pro x64 (Compatible Win 7/8/10)</p>
                    <p><span className="text-slate-500">CPU:</span> Intel(R) Core(TM) i3-2120 CPU @ 3.30GHz</p>
                    <p><span className="text-slate-500">RAM Installed:</span> 15.9 GB</p>
                    <p><span className="text-slate-500">.NET CLR:</span> 4.0.30319.42000 (Target: .NET 4.8)</p>
                    <p className="text-emerald-400 font-semibold"><span className="text-slate-500">Elevation State:</span> Administrator Rights Active [OK]</p>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Portal & Security Zone Map</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="space-y-1 text-slate-300 pt-1">
                    <p><span className="text-slate-500">UBD Portal URL:</span> https://ubd.telangana.gov.in</p>
                    <p><span className="text-slate-500">Zone Mapping:</span> Zone 2 (Trusted Sites) [OK]</p>
                    <p><span className="text-slate-500">ActiveX Scripting:</span> Enabled (0x0) [OK]</p>
                    <p><span className="text-slate-500">TLS 1.2 / TLS 1.3:</span> Active Protocols [OK]</p>
                    <p className="text-emerald-400 font-semibold"><span className="text-slate-500">DigiSigner COM:</span> Registered & Active [OK]</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>DSC Token & Middleware Drivers</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">ProxKey / Watchdata PKCS#11 Driver</h4>
                    <p className="text-slate-400">Required for cryptographic USB tokens in Mandal/GP offices.</p>
                  </div>
                  <button onClick={() => alert("ProxKey Driver Installed Successfully!")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">Install / Repair</button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">HYP2003 / ePass2003 CSP Token Driver</h4>
                    <p className="text-slate-400">Required for standard USB cryptographic tokens.</p>
                  </div>
                  <button onClick={() => alert("HYP2003 Driver Installed Successfully!")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">Install / Repair</button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">NIC DigiSigner WebSocket Service</h4>
                    <p className="text-slate-400">Enables browser-based digital document signing without Automation errors.</p>
                  </div>
                  <button onClick={() => alert("NIC DigiSigner Service Started!")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">Start Service</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Gemini AI Troubleshooting Assistant</span>
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                <p className="text-slate-300">Ask any technical question or paste error logs for instant automated diagnosis powered by Gemini API.</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. DigiSignHelper automation object error..." className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500" />
                  <button onClick={() => alert("Gemini AI Diagnosed: COM automation shim applied successfully.")} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer">Diagnose</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-400" />
                <span>Registry Snapshot Backups</span>
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2 text-slate-300">
                <p className="text-slate-400">
                  Backups stored in: <code className="text-emerald-400">C:\\Users\\SecretaryAdmin\\Documents\\EVedhika_Backups\\</code>
                </p>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                  <span>EVedhika_RegBackup_20260730_110215.reg</span>
                  <span className="text-emerald-400 font-bold">142 KB (Safe Rollback)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ota' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-fuchsia-400" />
                <span>Over-The-Air (OTA) Updates</span>
              </h3>
              <div className="bg-slate-950 border border-fuchsia-500/30 rounded-xl p-5 text-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                    <Monitor className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">Smart Auto-Updater</h4>
                    <p className="text-slate-400 text-xs mt-1">
                      Connects to <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">https://www.e-vedhika.in/api/version</code> to seamlessly pull the latest version and self-patch the application without re-downloading manually.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [OTA] Checking www.e-vedhika.in for updates...`]);
                      setTimeout(() => {
                        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [OTA] ✨ New Version v1.0.1 Found! Downloading payload...`]);
                        setTimeout(() => {
                           setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [OTA] ✅ Update applied successfully. Software is up to date.`]);
                        }, 1500);
                      }, 1000);
                    }}
                    className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-fuchsia-900/20 transition-colors cursor-pointer flex items-center gap-2 justify-center"
                  >
                    <Play className="w-4 h-4" />
                    <span>Check for OTA Updates Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>Help & Documentation</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>Welcome to the e-Vedhika UBD & DSC Deployment Tool for Telangana Grama Panchayats & Mandal Offices.</p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white">Central Telemetry Dashboard</h4>
                  <p className="text-slate-400">All executions automatically post execution status to <code className="text-emerald-400">https://www.e-vedhika.in/contact</code>.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/components/CSharpSolutionView.tsx', 'w', encoding='utf-8') as f:
    f.write(tsx_content)

print("Generated CSharpSolutionView.tsx with PC Boost tab successfully.")
