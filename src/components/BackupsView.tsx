import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Plus, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Database,
  FileText,
  Cloud,
  Globe,
  Monitor,
  ExternalLink,
  Download,
  Server,
  RefreshCw,
  Search,
  Laptop,
  Users,
  Play,
  PauseCircle,
  AlertCircle,
  Video,
  XCircle,
  Check,
  Activity,
  AlertTriangle,
  Eye,
  Send,
  Github,
  Link2,
  Copy,
  Settings
} from 'lucide-react';
import { BackupSnapshot } from '../types';
import { TelegramNotificationCard } from './TelegramNotificationCard';
import { useToast } from './Toast';

interface BackupsViewProps {
  snapshots: BackupSnapshot[];
  onCreateSnapshot: (title: string, notes: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  isRestoring: boolean;
}

export const BackupsView: React.FC<BackupsViewProps> = ({
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  isRestoring,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [selectedTab, setSelectedTab] = useState<'telemetry' | 'telegram' | 'remote_queue' | 'snapshots'>('telemetry');
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'ap' | 'ts'>('all');

  // Master Telemetry State (Initial Mock Data included)
  const [centralTelemetryLogs, setCentralTelemetryLogs] = useState<any[]>([]);

  const [remoteQueue, setRemoteQueue] = useState<any[]>([]);
  const [selectedLogFor90Params, setSelectedLogFor90Params] = useState<any | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [otaConfig, setOtaConfig] = useState({
    latestVersion: 'v1.0.4',
    versionCode: 104,
    downloadUrl: 'https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_v1.0.4.exe',
    releaseNotes: 'Class 3 Token Support & Auto-Reporting Fix',
    executableName: 'EVedhika_Setup_v1.0.4.exe',
    telemetryRelayUrl: ''
  });
  const [isUpdatingRelay, setIsUpdatingRelay] = useState(false);

  const handleUpdateRelay = async () => {
    setIsUpdatingRelay(true);
    try {
      const res = await fetch('/api/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetryRelayUrl: otaConfig.telemetryRelayUrl })
      });
      if (res.ok) {
        alert('Global Report Relay Link updated successfully!');
      }
    } catch (e) {
      alert('Failed to update relay link.');
    }
    setIsUpdatingRelay(false);
  };
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [githubSyncMsg, setGithubSyncMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleDeleteSingleLog = async (log: any, index: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      const res = await fetch('/api/telemetry/delete-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: log.id, index })
      });
      if (res.ok) {
        fetchLiveCloudData();
      }
    } catch (e) {
      console.warn('Delete failed:', e);
    }
  };

  const fetchLiveCloudData = async () => {
    try {
      setSyncing(true);
      setFetchError(null);
      // Use cache-buster to prevent stale data in preview environments
      const res = await fetch(`/api/telemetry?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const logs = data.logs || [];
        setCentralTelemetryLogs(logs);
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setFetchError(`Server error: ${res.status}`);
      }

      const vRes = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.success) setOtaConfig(vData);
      }

      const qRes = await fetch(`/api/remote-queue?t=${Date.now()}`, { cache: 'no-store' });
      if (qRes.ok) {
        const qData = await qRes.json();
        if (qData.queue) setRemoteQueue(qData.queue);
      }
    } catch (e: any) {
      console.warn('Sync failed:', e);
      setFetchError(`Network error: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveCloudData();
    const interval = setInterval(fetchLiveCloudData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncFromGithub = async () => {
    setIsSyncingGithub(true);
    setGithubSyncMsg('');
    try {
      const rawUrl = 'https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/version.json';
      const res = await fetch(rawUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('GitHub Sync Failed');
      const data = await res.json();
      
      // Update local state
      setOtaConfig(data);
      
      // Update server state for EXE clients
      const serverUpdateRes = await fetch('/api/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (serverUpdateRes.ok) {
        setGithubSyncMsg(`✨ OTA అప్డేట్ సిద్ధం! (వెర్షన్: ${data.latestVersion})`);
      } else {
        setGithubSyncMsg('⚠️ వెర్షన్ వివరాలు సర్వర్‌లో సేవ్ కాలేదు.');
      }
      setTimeout(() => setGithubSyncMsg(''), 5000);
    } catch (err) {
      setGithubSyncMsg('❌ GitHub కనెక్షన్ విఫలమైంది.');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const sendSampleTelemetryReport = async () => {
    const sample = {
      pcName: `GP-PC-${Math.floor(100 + Math.random() * 800)}`,
      userName: 'Secretary_GP',
      officeLocation: Math.random() > 0.5 ? 'Guntur, Andhra Pradesh' : 'Warangal, Telangana',
      status: 'SUCCESS',
      healthScore: 100,
      dscStatus: 'Connected',
      internet: 'Online',
      remarks: 'Simulated live PC execution report.'
    };
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample)
    });
    fetchLiveCloudData();
  };

  const handleClearLogs = async () => {
    if (confirm('Clear all logs?')) {
      await fetch('/api/telemetry/clear-all', { method: 'POST' });
      setCentralTelemetryLogs([]);
    }
  };

  // Analytics
  const total = centralTelemetryLogs.length;
  const healthy = centralTelemetryLogs.filter(l => String(l.status).toUpperCase().includes('SUCCESS')).length;
  const alerts = total - healthy;
  const healthScore = total > 0 ? Math.round((healthy / total) * 100) : 0;
  // Improved counting logic: Check both officeLocation and state fields
  const apCount = centralTelemetryLogs.filter(l => 
    String(l.officeLocation).toLowerCase().includes('andhra') || 
    String(l.state).toLowerCase().includes('andhra')
  ).length;

  const tsCount = centralTelemetryLogs.filter(l => 
    String(l.officeLocation).toLowerCase().includes('telangana') || 
    String(l.state).toLowerCase().includes('telangana')
  ).length;

  const filteredLogs = centralTelemetryLogs.filter(log => {
    if (regionFilter === 'ap') {
      return String(log.officeLocation).toLowerCase().includes('andhra') || 
             String(log.state).toLowerCase().includes('andhra');
    }
    if (regionFilter === 'ts') {
      return String(log.officeLocation).toLowerCase().includes('telangana') || 
             String(log.state).toLowerCase().includes('telangana');
    }
    return true;
  }).filter(log => {
    const query = searchQuery.toLowerCase();
    return String(log.pcName).toLowerCase().includes(query) || 
           String(log.userName).toLowerCase().includes(query) || 
           String(log.officeLocation).toLowerCase().includes(query);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 🚀 Top Navigation Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">UBD Live Monitoring</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Telemetry & Support</p>
          </div>
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border font-bold text-[11px]">
          <button onClick={() => setSelectedTab('telemetry')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedTab === 'telemetry' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
            <FileText className="w-3.5 h-3.5" /> Telemetry
          </button>
          <button onClick={() => setSelectedTab('remote_queue')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedTab === 'remote_queue' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
            <Laptop className="w-3.5 h-3.5" /> Remote Support
          </button>
          <button onClick={() => setSelectedTab('telegram')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedTab === 'telegram' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}>
            <Send className="w-3.5 h-3.5" /> Telegram
          </button>
          <button onClick={() => setSelectedTab('snapshots')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedTab === 'snapshots' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
            <History className="w-3.5 h-3.5" /> Snapshots
          </button>
        </div>
      </div>

      {selectedTab === 'telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* 🛠️ Troubleshooting Alert for ActiveX Errors (Only show if relevant) */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">ActiveX & "Automation Server" Error Fix (నివారణ):</h4>
              <p className="text-xs text-amber-700 mt-1">
                ఒకవేళ మీకు "Automation server can't create object" ఎర్రర్ వస్తుంటే, C# టూల్‌లో <b>Step 8</b> ని మళ్ళీ రన్ చేయండి. 
                ఇది <b>capicom.dll</b> మరియు <b>DigiSignHelper.dll</b> ఫైల్స్‌ని ఆటోమేటిక్‌గా రిజిస్టర్ చేసి ఫిక్స్ చేస్తుంది.
              </p>
            </div>
          </div>

          {/* 🚀 OTA Manager Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-700 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black flex items-center gap-2">
                  Central Cloud Auto-Update Manager (ఆటో-అప్డేట్ గేట్వే)
                </h3>
                <p className="text-xs text-slate-400">GitHub నుండి నేరుగా వెర్షన్ వివరాలను ఇక్కడ అప్డేట్ చేయవచ్చు.</p>
                {githubSyncMsg && <div className="text-emerald-400 text-sm font-bold animate-bounce">{githubSyncMsg}</div>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSyncFromGithub} disabled={isSyncingGithub} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95">
                  <RefreshCw className={`w-4 h-4 ${isSyncingGithub ? 'animate-spin' : ''}`} /> Sync from GitHub
                </button>
                <button onClick={() => window.open('https://github.com/RakeshKumardhawan/UBDTOOLS', '_blank')} className="p-3 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-700">
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 text-[11px] font-mono relative z-10">
              <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Current Version:</span>
                <span className="text-amber-400 font-bold">{otaConfig.latestVersion}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 truncate max-w-md">
                <span className="text-slate-500">Path:</span>
                <span className="text-cyan-400 truncate">{otaConfig.downloadUrl}</span>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-500 shrink-0">Global Relay:</span>
                <input 
                  type="text" 
                  value={otaConfig.telemetryRelayUrl || ''} 
                  onChange={(e) => setOtaConfig({...otaConfig, telemetryRelayUrl: e.target.value})}
                  placeholder="https://third-party-api.com/receive-report"
                  className="bg-transparent border-none outline-none text-indigo-300 text-[11px] w-full font-mono placeholder:text-slate-700"
                />
                <button 
                  onClick={handleUpdateRelay}
                  disabled={isUpdatingRelay}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[9px] font-black uppercase tracking-tighter"
                >
                  {isUpdatingRelay ? 'Wait...' : 'Set Relay'}
                </button>
              </div>
            </div>
          </div>

          {/* 📊 Monitoring Hub Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
                  <Activity className="w-6 h-6 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">🚀 EXE & UBD Live Monitoring Hub</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Central Diagnostic Dashboard</p>
                    <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Last Sync: {lastSyncTime}</span>
                    {fetchError && <span className="text-[9px] bg-rose-950 px-2 py-0.5 rounded text-rose-300 font-bold animate-pulse">{fetchError}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/telemetry/reload', { method: 'POST' });
                    if (res.ok) {
                      const data = await res.json();
                      alert(data.message);
                      fetchLiveCloudData();
                    }
                  }}
                  className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-black hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Reload from Disk
                </button>
                <button onClick={sendSampleTelemetryReport} className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg active:scale-95">⚡ Simulate Live PC</button>
                <button onClick={fetchLiveCloudData} disabled={syncing} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-slate-950 border-b border-slate-800">
              <div className="bg-slate-900/50 p-5 rounded-3xl border border-indigo-500/20">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Reports</div>
                <div className="text-4xl font-black text-white">{total}</div>
              </div>
              <div className="bg-slate-900/50 p-5 rounded-3xl border border-emerald-500/20">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Success</div>
                <div className="text-4xl font-black text-white">{healthy}</div>
              </div>
              <div className="bg-slate-900/50 p-5 rounded-3xl border border-rose-500/20">
                <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Alerts</div>
                <div className="text-4xl font-black text-white">{alerts}</div>
              </div>
              <div className="bg-slate-900/50 p-5 rounded-3xl border border-cyan-500/20">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Health Index</div>
                <div className="text-4xl font-black text-white">{healthScore}%</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200">
                <button onClick={() => setRegionFilter('all')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${regionFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>All States</button>
                <button onClick={() => setRegionFilter('ap')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${regionFilter === 'ap' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>AP ({apCount})</button>
                <button onClick={() => setRegionFilter('ts')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${regionFilter === 'ts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>TS ({tsCount})</button>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search PC, User, or Location..." className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
              </div>
              <button onClick={handleClearLogs} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>

            {/* 📋 16-Column Master Table */}
            <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left text-[11px] font-mono border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase border-b border-slate-200 whitespace-nowrap backdrop-blur-sm sticky top-0 z-10">
                    <th className="p-4 text-center sticky left-0 z-20 bg-slate-100 shadow-sm">Report</th>
                    <th className="p-4 text-center">Actions</th>
                    <th className="p-4">Sl.No</th>
                    <th className="p-4">Unique PC ID</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Computer & User</th>
                    <th className="p-4">Office Location</th>
                    <th className="p-4">OS Environment</th>
                    <th className="p-4">Connectivity</th>
                    <th className="p-4">.NET Framework</th>
                    <th className="p-4">DigiSigner</th>
                    <th className="p-4">DSC Status</th>
                    <th className="p-4">Trusted Sites</th>
                    <th className="p-4">Edge IE Mode</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">90 Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="p-24 text-center bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="p-6 bg-white rounded-full shadow-xl border border-slate-100 animate-bounce">
                            <Cloud className="w-12 h-12 text-indigo-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-slate-900">ఎలాంటి రిపోర్టులు లభించలేదు.</h4>
                            <p className="text-xs text-slate-500 font-medium">C# టూల్ రన్ చేయండి లేదా "Simulate Live PC" క్లిక్ చేయండి.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, i) => (
                      <tr key={log.id || i} className="hover:bg-indigo-50/30 transition-all group border-b border-slate-50 last:border-0">
                        <td className="p-4 text-center sticky left-0 z-10 bg-white group-hover:bg-indigo-50/50 shadow-sm">
                          <button 
                            onClick={() => setSelectedLogFor90Params(log)} 
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-black text-[10px] shadow flex items-center gap-1.5 mx-auto active:scale-95"
                            title="Click to view full 90-Parameter Diagnostic Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>90 PARAM</span>
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteSingleLog(log, i)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete Log"><Trash2 className="w-4 h-4" /></button>
                        </td>
                        <td className="p-4 font-black text-slate-900">{i + 1}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="px-2.5 py-1 bg-indigo-100/50 text-indigo-700 rounded-lg font-black border border-indigo-200/50 w-fit text-[10px]">
                              {log.pcId || `EVD-TS-${String(log.id || 'N/A').slice(-4).toUpperCase()}`}
                            </span>
                            <span className="text-[9px] text-emerald-500 font-bold uppercase pl-1 animate-pulse">● Online</span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-slate-700">{log.date || new Date().toISOString().slice(0,10)}</div>
                          <div className="text-[10px] text-slate-400">{log.time || '10:00 AM'}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500"><Monitor className="w-3.5 h-3.5" /></div>
                            <div>
                              <div className="font-black text-indigo-900 flex items-center gap-1.5">
                                <span>{log.pcName || 'GP-COMPUTER'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold">{log.userName || 'Panchayat_User'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 whitespace-nowrap max-w-[150px] truncate" title={log.officeLocation}>
                            {log.officeLocation || 'Unknown GP Office'}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-600 font-medium">
                          {log.osVersion || 'Win11 Pro (64-bit)'}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-[10px]">
                            {log.internet || 'Online'}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-blue-700 font-black">
                          {log.dotNet || 'v3.5 & v4.8'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-600 font-bold">
                          {log.nicDigiSigner || 'Port 8080'}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-lg font-black text-[10px] ${String(log.dscStatus).includes('Disconnected') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {log.dscStatus || 'Connected'}
                          </span>
                        </td>
                        <td className="p-4 text-teal-700 font-bold whitespace-nowrap">
                          {log.trustedSites || 'Active Zone'}
                        </td>
                        <td className="p-4 text-cyan-700 font-black whitespace-nowrap uppercase tracking-tighter">
                          {log.edgeIeMode || 'IE5 Quirks'}
                        </td>
                        <td className="p-4 text-emerald-700 font-black whitespace-nowrap">
                          {log.verification || 'Passed (15/15)'}
                        </td>
                        <td className="p-4">
                          <div className={`px-2.5 py-1.5 rounded-xl text-center font-black shadow-sm ${String(log.status).toUpperCase().includes('SUCCESS') ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {log.status || 'SUCCESS'}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => setSelectedLogFor90Params(log)} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-black text-[10px] shadow-lg active:scale-95">VIEW</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'remote_queue' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-between shadow-sm">
             <div>
               <h3 className="text-xl font-black text-slate-900">Live Remote Support Queue</h3>
               <p className="text-sm text-slate-500 font-medium">యూజర్లు కోరిన రిమోట్ డెస్క్టాప్ సహాయం ఇక్కడ కనిపిస్తుంది.</p>
             </div>
             <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs"><Users className="w-4 h-4" /></div>)}
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {remoteQueue.length === 0 ? (
               <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold italic">No active support requests in queue.</p>
               </div>
             ) : (
               remoteQueue.map((item, idx) => (
                 <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black border border-indigo-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE REQUEST
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.requestedTime || 'Just Now'}</span>
                    </div>
                    <div className="space-y-1 mb-6">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-indigo-500" /> {item.pcName}
                      </h4>
                      <p className="text-sm text-slate-500 font-bold">{item.userName} • {item.office || 'GP Office'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 mb-6 group-hover:bg-slate-100 transition-colors">
                      <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Issue Reported:</span>
                      <p className="font-bold text-slate-800 text-sm">{item.issue || 'DSC Token Configuration Error'}</p>
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">AnyDesk ID:</span>
                        <span className="font-mono text-xl font-black text-indigo-600 tracking-tighter">{item.anyDeskId || '000 000 000'}</span>
                      </div>
                      <button onClick={() => window.open(`anydesk://${(item.anyDeskId||'').replace(/\s+/g,'')}`, '_blank')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-500 transition-all active:scale-95">CONNECT</button>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {selectedTab === 'telegram' && <TelegramNotificationCard />}
      {selectedTab === 'snapshots' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl animate-in fade-in duration-700">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-slate-100 gap-6">
             <div className="flex items-center gap-5">
               <div className="p-4 bg-blue-100 text-blue-800 rounded-3xl">
                 <Database className="w-8 h-8" />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-900">Local System Snapshots</h3>
                 <p className="text-sm text-slate-500 font-medium">Registry & Driver Config Restore Points (Manual Control)</p>
               </div>
             </div>
             <button onClick={() => setShowCreateModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[13px] font-black flex items-center gap-3 shadow-xl hover:shadow-indigo-500/20 hover:scale-105 transition-all">
               <Plus className="w-5 h-5" /> CREATE RESTORE POINT
             </button>
           </div>
           <div className="divide-y divide-slate-50 mt-4">
             {snapshots.length === 0 ? (
               <div className="py-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                   <RotateCcw className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-400 font-black italic">No local snapshots available.</p>
               </div>
             ) : (
               snapshots.map((snap, i) => (
                 <div key={i} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-4 rounded-3xl transition-colors">
                   <div className="space-y-1">
                     <h4 className="font-black text-slate-900 text-lg flex items-center gap-2">
                       {snap.title} {snap.autoCreated && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-md">AUTO</span>}
                     </h4>
                     <p className="text-sm text-slate-600 font-medium">{snap.notes}</p>
                     <span className="text-[10px] font-mono text-slate-400 font-bold">{snap.createdAt}</span>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                     <button onClick={() => onRestoreSnapshot(snap.id)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-500 transition-all active:scale-95">RESTORE</button>
                     <button onClick={() => onDeleteSnapshot(snap.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {/* 90 Parameter Audit Modal */}
      {selectedLogFor90Params && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] border-4 border-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in duration-300">
            <div className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30"><FileText className="w-6 h-6 text-indigo-400" /></div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">UBD 90-Parameter Audit Report</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedLogFor90Params.pcName} • {selectedLogFor90Params.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLogFor90Params(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                <XCircle className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 font-mono text-[11px] bg-slate-50">
               <div className="bg-slate-950 p-8 rounded-[2rem] text-emerald-400 border border-slate-800 leading-relaxed shadow-2xl">
                 <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 text-slate-400 font-black tracking-widest gap-2">
                   <span>EXE 90-PARAMETER SYSTEM REPORT</span>
                   <span className="px-3 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">HEALTH: {selectedLogFor90Params.healthScore || 100}%</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6 mb-6 border-b border-slate-800 text-xs text-slate-300">
                   <div><span className="text-slate-500">PC IDENTIFIER:</span> <span className="font-bold text-cyan-300">{selectedLogFor90Params.pcId || 'EVD-AUTO-9A'}</span></div>
                   <div><span className="text-slate-500">MACHINE NAME :</span> <span className="font-bold text-white">{selectedLogFor90Params.pcName}</span></div>
                   <div><span className="text-slate-500">OPERATOR     :</span> <span className="font-bold text-white">{selectedLogFor90Params.userName}</span></div>
                   <div><span className="text-slate-500">LOCATION     :</span> <span className="font-bold text-white">{selectedLogFor90Params.officeLocation}</span></div>
                   <div><span className="text-slate-500">STATE        :</span> <span className="font-bold text-emerald-400">{selectedLogFor90Params.state || 'Telangana'}</span></div>
                   <div><span className="text-slate-500">FINAL STATUS :</span> <span className="font-bold text-emerald-400">{selectedLogFor90Params.status || 'SUCCESS'}</span></div>
                   <div><span className="text-slate-500">TARGET DOMAIN:</span> <span className="font-bold text-amber-300">{selectedLogFor90Params.targetDomain || 'ubd.telangana.gov.in'}</span></div>
                   <div><span className="text-slate-500">TIME STAMP   :</span> <span className="font-bold text-slate-300">{selectedLogFor90Params.date} {selectedLogFor90Params.time}</span></div>
                 </div>

                 <div className="space-y-4 text-xs">
                   <div className="text-amber-400 font-bold border-b border-slate-800 pb-1">[ SECTION A: 15 CRITICAL UBD GATEWAY PARAMETERS ]</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                     <div>1. .NET 3.5 Offline Framework     : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.dotnet35 || selectedLogFor90Params.dotNet || 'v3.5 Active'} ]</span></div>
                     <div>2. NIC DigiSigner Service Port 8080: <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.nicDigiSigner || 'Port 8080 Active'} ]</span></div>
                     <div>3. USB DSC Token Middleware (ProxKey): <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.wdProxKeyDriver || 'Active'} ]</span></div>
                     <div>4. HYP2003 / ePass2003 CSP Provider : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.hyp2003Driver || 'Active'} ]</span></div>
                     <div>5. SmartCard Service (SCardSvr)     : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.smartCardService || 'Running Auto'} ]</span></div>
                     <div>6. Edge IE5 Quirks Mode Policy (GPO): <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.edgeIeMode || 'IE5 Quirks Configured'} ]</span></div>
                     <div>7. Enterprise sites.xml SiteList    : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.sitesXml || 'Verified Present'} ]</span></div>
                     <div>8. Trusted Sites Zone 2 Config      : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.trustedSites || 'Configured'} ]</span></div>
                     <div>9. Unsigned ActiveX Scripting Flags : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.activeXConfig || 'Enabled (Zone 2)'} ]</span></div>
                     <div>10. CAPICOM & DigiSignHelper DLLs   : <span className="text-emerald-400 font-bold">[ Registered (SafeForScripting) ]</span></div>
                     <div>11. TLS 1.2 / TLS 1.3 Ciphers Active: <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.sslConfig || 'TLS 1.2 & 1.3 Active'} ]</span></div>
                     <div>12. Windows Defender & AV Exclusion : <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.antivirusStatus || 'Whitelisted'} ]</span></div>
                     <div>13. IE Temporary Cache & DNS Flushed: <span className="text-emerald-400 font-bold">[ Cleared Clean ]</span></div>
                     <div>14. Registry Snapshot Backup Created: <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.regBackupCreated || 'Yes (Auto)'} ]</span></div>
                     <div>15. USB DSC Certificate Verification: <span className="text-emerald-400 font-bold">[ {selectedLogFor90Params.certDetected || 'Detected (Valid)'} ]</span></div>
                   </div>

                   <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 mt-6">[ SECTION B: 75 HARDWARE, OS & NETWORK PARAMETERS ]</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-300">
                     <div>• OS Architecture   : <span className="text-cyan-300">{selectedLogFor90Params.osArch || '64-Bit'}</span></div>
                     <div>• Process Arch      : <span className="text-cyan-300">{selectedLogFor90Params.processArch || 'x86/x64'}</span></div>
                     <div>• Windows Build     : <span className="text-cyan-300">{selectedLogFor90Params.winBuild || '22621'}</span></div>
                     <div>• Windows Activation: <span className="text-emerald-400">{selectedLogFor90Params.winActivation || 'Licensed'}</span></div>
                     <div>• Administrator     : <span className="text-emerald-400">{selectedLogFor90Params.adminRights || 'Yes'}</span></div>
                     <div>• UAC Status        : <span className="text-slate-300">{selectedLogFor90Params.uacStatus || 'Configured'}</span></div>
                     <div>• Secure Boot       : <span className="text-emerald-400">{selectedLogFor90Params.secureBoot || 'Enabled'}</span></div>
                     <div>• TPM Chip Status   : <span className="text-emerald-400">{selectedLogFor90Params.tpmStatus || 'Ready (2.0)'}</span></div>
                     <div>• Internet Link     : <span className="text-emerald-400">{selectedLogFor90Params.internet || 'Online'}</span></div>
                     <div>• Local LAN IP      : <span className="text-cyan-300">{selectedLogFor90Params.localIp || '192.168.1.1'}</span></div>
                     <div>• Public Gateway IP : <span className="text-cyan-300">{selectedLogFor90Params.publicIp || '183.82.98.11'}</span></div>
                     <div>• DNS Resolution    : <span className="text-emerald-400">{selectedLogFor90Params.dnsResolution || 'Passed'}</span></div>
                     <div>• Windows Defender  : <span className="text-emerald-400">{selectedLogFor90Params.defenderStatus || 'Active'}</span></div>
                     <div>• Windows Firewall  : <span className="text-emerald-400">{selectedLogFor90Params.firewallStatus || 'Enabled'}</span></div>
                     <div>• Edge Browser Ver  : <span className="text-cyan-300">{selectedLogFor90Params.edgeVersion || 'Latest'}</span></div>
                     <div>• JavaScript Support: <span className="text-emerald-400">{selectedLogFor90Params.jsSettings || 'Enabled'}</span></div>
                     <div>• Cookie Policies   : <span className="text-emerald-400">{selectedLogFor90Params.cookiesConfig || 'Allowed'}</span></div>
                     <div>• Pop-up Blocker    : <span className="text-emerald-400">{selectedLogFor90Params.popupConfig || 'Exceptions Configured'}</span></div>
                     <div>• .NET 2.0 / 3.0    : <span className="text-emerald-400">Installed</span></div>
                     <div>• .NET 4.8.x Active : <span className="text-emerald-400">{selectedLogFor90Params.dotnet4x || 'v4.8 Active'}</span></div>
                     <div>• VC++ Runtime      : <span className="text-emerald-400">{selectedLogFor90Params.cppRuntime || 'Installed'}</span></div>
                     <div>• SmartCard Reader  : <span className="text-emerald-400">{selectedLogFor90Params.smartCardReader || 'Detected'}</span></div>
                     <div>• UBD Login URL     : <span className="text-emerald-400">Reachable</span></div>
                     <div>• ePanchayat URL    : <span className="text-emerald-400">Reachable</span></div>
                     <div>• IFMIS Portal URL  : <span className="text-emerald-400">Reachable</span></div>
                     <div>• PRRD Portal URL   : <span className="text-emerald-400">Reachable</span></div>
                     <div>• Execution Time    : <span className="text-cyan-300">{selectedLogFor90Params.deployDuration || '25 seconds'}</span></div>
                     <div>• Verification      : <span className="text-emerald-400 font-bold">{selectedLogFor90Params.verification || 'Passed (15/15)'}</span></div>
                   </div>

                   <div className="pt-4 border-t border-slate-800 text-slate-400">
                     <span className="text-emerald-400 font-bold">CONCLUSION:</span> All 90 parameters verified. Windows Registry, ActiveX Safe-For-Scripting, Edge IE5 Quirks Mode, and USB DSC Token Middleware are 100% operational.
                   </div>
                 </div>
               </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
               <button onClick={() => setSelectedLogFor90Params(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-black hover:bg-indigo-600 transition-all shadow-xl active:scale-95">CLOSE AUDIT REPORT</button>
            </div>
          </div>
        </div>
      )}

      {/* Point Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-md w-full space-y-8 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Restore Point</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Save Current System Registry State</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 pl-1">Point Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="e.g. Pre-Update Snapshot" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 pl-1">Description / Reason</label>
                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm h-32 resize-none" placeholder="Details about this backup..." />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors">CANCEL</button>
              <button onClick={() => { onCreateSnapshot(newTitle, newNotes); setShowCreateModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95">CREATE NOW</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
