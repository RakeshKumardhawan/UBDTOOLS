import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Globe, 
  Send, 
  Monitor, 
  Database, 
  ArrowRight, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Activity,
  HardDrive
} from 'lucide-react';
import { useToast } from './Toast';

export const NetworkDataFlowDiagram: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/network-flow/status');
      if (res.ok) {
        const data = await res.json();
        setNetworkStatus(data);
      }
    } catch (e) {
      console.warn('Network flow status fetch:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTestTelegram = async () => {
    setTestingTg(true);
    try {
      const res = await fetch('/api/telegram/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 <b>E-Vedhika Network Pipeline Test</b>\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `✅ <b>Pipeline 3: Telegram Bot Verified</b>\n` +
                `🤖 <b>Bot:</b> @UBD_LIVE_UPDATES_bot\n` +
                `📡 <b>Network Architecture:</b> 3-Pillar Data Flow Online\n` +
                `⏰ <b>Timestamp:</b> ${new Date().toLocaleString('en-IN')}`
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Test report delivered to Telegram Admin Chat (431228008)', 'Telegram Pipeline Active');
      } else {
        showError(data.error || 'Telegram dispatch failed', 'Pipeline 3 Error');
      }
    } catch (e: any) {
      showError(e.message, 'Telegram Error');
    } finally {
      setTestingTg(false);
      fetchStatus();
    }
  };

  const handleSyncColdWithWebsite = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cold-server/sync-to-website', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message, 'Bidirectional Sync Completed');
      } else {
        showError(data.error || 'Sync failed', 'Sync Error');
      }
    } catch (e: any) {
      showError(e.message, 'Sync Error');
    } finally {
      setSyncing(false);
      fetchStatus();
    }
  };

  const handleCreateColdBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch('/api/cold-server/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Snapshot: ${data.backupFileName} (${data.recordsBackedUp} records)`, 'Cold Backup Created');
      } else {
        showError(data.error || 'Backup creation failed', 'Backup Error');
      }
    } catch (e: any) {
      showError(e.message, 'Backup Error');
    } finally {
      setCreatingBackup(false);
      fetchStatus();
    }
  };

  const coldCount = networkStatus?.pipelines?.coldServer?.totalRecords ?? 0;
  const webActive = networkStatus?.pipelines?.website?.activeMachineCount ?? 0;
  const tgStatus = networkStatus?.pipelines?.telegram?.status === 'ONLINE';

  return (
    <div className="bg-[#0C0C0E] border border-cyan-500/30 rounded-xl p-5 sm:p-6 mb-8 text-white relative overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-ink-faint">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-syne font-bold text-lg sm:text-xl text-white tracking-wide">
              Application Data Flow — Network Architecture
            </h2>
          </div>
          <p className="text-xs text-ink-medium mt-1">
            Real-time live multi-channel data distribution pipeline across Cold Database, Web Central, and Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161A] hover:bg-ink-faint text-xs text-ink-light font-mono rounded border border-ink-faint transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Pipelines
          </button>
        </div>
      </div>

      {/* Embedded Original Architecture Reference Toggle & View */}
      <div className="mb-6 p-4 bg-black/40 border border-ink-faint/80 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Network Topology (User Blueprint Specification)
          </span>
          <span className="text-[11px] text-ink-muted font-mono">3-Pillar Data Pipeline</span>
        </div>

        {/* 3-Pillars Visual Network Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Node 0: E-Vedhika Tool (C# Client) */}
          <div className="lg:col-span-3 bg-[#131419] border-2 border-blue-500/40 rounded-xl p-4 relative shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-blue-400">E-Vedhika Tool</h3>
                <span className="text-[10px] text-ink-muted font-mono">C# WinForms Client v1.0.8</span>
              </div>
            </div>
            <p className="text-xs text-ink-medium mb-3">
              Client execution engine running in GP & Mandal offices (Telangana/AP).
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-ink-light">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>1. Direct Cold Ingest</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>2. Web Live Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>3. Direct Telegram Alert</span>
              </div>
            </div>
          </div>

          {/* Connectors & 3 Target Nodes */}
          <div className="lg:col-span-9 space-y-3">

            {/* Pipeline 1: Cold Server */}
            <div className="bg-[#0f1b16] border-2 border-emerald-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-emerald-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">1</span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-emerald-400">Cold Server (Database / Data Storage)</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {coldCount} Records Stored
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-emerald-200/80 mb-2">
                • Store Application Data &nbsp;• Backup &nbsp;• Data Processing & Integrity Audits
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                <span className="text-ink-muted font-mono">Vault: cold_server_storage.json</span>
                <button
                  onClick={handleCreateColdBackup}
                  disabled={creatingBackup}
                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  {creatingBackup ? 'Creating Snapshot...' : 'Create Cold Backup'}
                </button>
              </div>
            </div>

            {/* Bidirectional Connector 1 */}
            <div className="flex items-center justify-center -my-1">
              <button
                onClick={handleSyncColdWithWebsite}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-1 bg-[#1a122e] border border-purple-500/40 hover:border-purple-500/70 text-purple-300 rounded-full text-xs font-mono shadow-sm hover:scale-105 transition-all"
                title="Bidirectional sync between Cold Server and Website"
              >
                <ArrowLeftRight className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
                <span>Data Sync / API (Bidirectional: Cold Server ⟷ Website)</span>
              </button>
            </div>

            {/* Pipeline 2: Website */}
            <div className="bg-[#0e1726] border-2 border-blue-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-blue-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-sm text-blue-400">Website (www.e-vedhika.in)</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Dashboard Active
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-blue-200/80 mb-2">
                • Display Data &nbsp;• Admin Panel &nbsp;• Real-time Updates & Step Matrix Monitoring
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-500/20 text-[11px]">
                <span className="text-ink-muted font-mono">Gateway: /admin/ubd_monitoring & /api/telemetry</span>
                <span className="text-blue-300 font-mono font-medium">Synced With Cold Storage</span>
              </div>
            </div>

            {/* Bidirectional Connector 2 */}
            <div className="flex items-center justify-center -my-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#26101d] border border-pink-500/40 text-pink-300 rounded-full text-xs font-mono">
                <ArrowLeftRight className="w-3.5 h-3.5 text-pink-400" />
                <span>Notifications / Reports (Bidirectional: Website ⟷ Telegram)</span>
              </div>
            </div>

            {/* Pipeline 3: Telegram */}
            <div className="bg-[#200f13] border-2 border-rose-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-rose-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-rose-400" />
                    <h4 className="font-bold text-sm text-rose-400">Telegram (Bot / Channel / Group)</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    @UBD_LIVE_UPDATES_bot
                  </span>
                  <span className={`w-2 h-2 rounded-full ${tgStatus ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                </div>
              </div>
              <p className="text-xs text-rose-200/80 mb-2">
                • Send Reports &nbsp;• Notifications &nbsp;• Alerts & Instant Mobile Delivery (Chat ID: 431228008)
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-500/20 text-[11px]">
                <span className="text-ink-muted font-mono">Target: @DhawanRakesh (Admin)</span>
                <button
                  onClick={handleTestTelegram}
                  disabled={testingTg}
                  className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {testingTg ? 'Broadcasting...' : 'Test Telegram Broadcast'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/60 p-3 rounded-lg border border-ink-faint font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cold Database: ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Website Portal: ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Telegram Bot: VERIFIED</span>
          </span>
        </div>
        <div className="text-ink-muted">
          All 3 Channels Active in C# Client v1.0.8 & Web Core
        </div>
      </div>
    </div>
  );
};
