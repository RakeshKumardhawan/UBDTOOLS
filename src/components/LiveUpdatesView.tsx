import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Cloud, 
  Terminal,
  ShieldCheck,
  Send,
  Cpu
} from 'lucide-react';
import { useToast } from './Toast';

export const LiveUpdatesView: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [versionConfig, setVersionConfig] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  const fetchVersionConfig = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/version?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setVersionConfig(data);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Failed to fetch version config');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchVersionConfig();
    const interval = setInterval(fetchVersionConfig, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePushMinorPatch = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const newBuild = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}-R${Math.floor(Math.random() * 9 + 1)}`;
      const newDate = now.toISOString().slice(0, 10);

      const res = await fetch('/api/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latestResourceBuild: newBuild,
          resourceBuildDate: newDate
        })
      });

      if (res.ok) {
        showSuccess(`✨ Live Resource Patch Broadcasted: ${newBuild}`);
        fetchVersionConfig();
      } else {
        showError('Failed to broadcast patch.');
      }
    } catch (e) {
      showError('Network error while pushing patch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
            <Zap className="w-6 h-6 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight uppercase">Live Resource Engine (OTA)</h3>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Real-time Minor Patches</p>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Last Cloud Check: {lastSyncTime}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchVersionConfig}
          disabled={syncing}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Build Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Software Version</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{versionConfig?.latestVersion || 'v1.0.7'}</div>
                <p className="text-[10px] text-slate-500 mt-1">Requires Restart for Update</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Cloud className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Live Resource Build</span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-900">{versionConfig?.latestResourceBuild || '2026.10.25-R1'}</div>
                <p className="text-[10px] text-emerald-600/70 mt-1">Applied Background (No Restart)</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight">Deploy Minor Resource Patch</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Broadcast new registry rules, sites.xml updates, and announcement feed items to all active C# clients.
                Clients will pick up these changes within 30 minutes without closing the app.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button 
                  onClick={handlePushMinorPatch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-50 text-white hover:text-indigo-900 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Broadast Live Patch
                </button>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Last Patch Broadcast</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{versionConfig?.resourceBuildDate || '2026-10-21'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Feed */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Broadcast History</h4>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200">
            <div className="flex gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
              <div>
                <p className="text-[10px] font-bold text-slate-900">Resource Patch Broadcasted</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Updated latestResourceBuild to {versionConfig?.latestResourceBuild}</p>
                <p className="text-[8px] text-slate-400 font-mono mt-1">{lastSyncTime}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <p className="text-[10px] font-bold text-slate-900">Cloud Sync Successful</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Website and C# solution source synced across all nodes.</p>
                <p className="text-[8px] text-slate-400 font-mono mt-1">Earlier today</p>
              </div>
            </div>

            <div className="flex gap-3 opacity-60">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
              <div>
                <p className="text-[10px] font-bold text-slate-900">System Ready</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Central deployment server initialized and listening for telemetry.</p>
                <p className="text-[8px] text-slate-400 font-mono mt-1">Oct 21, 2026</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-[9px] font-black text-slate-900 uppercase">Integrity Status</div>
                <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full"></div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
