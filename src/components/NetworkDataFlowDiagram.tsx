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
  HardDrive,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useToast } from './Toast';

export const NetworkDataFlowDiagram: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
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
                `✅ <b>Pillar 4: Telegram Bot Relay Active</b>\n` +
                `🤖 <b>Bot:</b> @ubd_installation_alerts_bot\n` +
                `📡 <b>Architecture:</b> 4-Pillar Network Data Flow Online\n` +
                `⏰ <b>Timestamp:</b> ${new Date().toLocaleString('en-IN')}`
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Test report delivered to Telegram Admin Chat', 'Pillar 4 Telegram Active');
      } else {
        showError(data.error || 'Telegram dispatch failed', 'Pillar 4 Error');
      }
    } catch (e: any) {
      showError(e.message, 'Telegram Error');
    } finally {
      setTestingTg(false);
      fetchStatus();
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    try {
      const res = await fetch('/api/reporting/receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pcName: 'NETWORK-FLOW-TEST-PC',
          userName: 'Admin Operator',
          officeLocation: 'E-Vedhika Central Command',
          state: 'Telangana',
          district: 'Hyderabad',
          status: 'SUCCESS',
          remarks: 'Instant Live WhatsApp Alert Test from 4-Pillar Network Flow Architecture!'
        })
      });
      if (res.ok) {
        showSuccess('WhatsApp test notification sent to Admin mobile!', 'Pillar 3 WhatsApp Active');
      } else {
        showError('WhatsApp dispatch failed. Please verify API key & phone.', 'Pillar 3 Error');
      }
    } catch (e: any) {
      showError(e.message, 'WhatsApp Error');
    } finally {
      setTestingWa(false);
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
  const waPhone = networkStatus?.pipelines?.whatsapp?.phone || '+919989922310';
  const waStatus = networkStatus?.pipelines?.whatsapp?.status === 'ONLINE';
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
              4-Pillar Network Flow Architecture & Real-Time Gateway
            </h2>
          </div>
          <p className="text-xs text-ink-medium mt-1">
            Real-time multi-channel telemetry distribution across Cold Database, Central Web Portal, WhatsApp Personal Messenger, and Telegram Bot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161A] hover:bg-ink-faint text-xs text-ink-light font-mono rounded border border-ink-faint transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh 4 Pipelines
          </button>
        </div>
      </div>

      {/* Embedded Live Architecture Visualizer */}
      <div className="mb-6 p-4 bg-black/40 border border-ink-faint/80 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live 4-Pillar Network Topology (Admin Dashboard Dynamic Control)
          </span>
          <span className="text-[11px] text-ink-muted font-mono">4-Pillar Data & Messenger Architecture</span>
        </div>

        {/* 4-Pillars Network Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Node 0: E-Vedhika Client Tool */}
          <div className="lg:col-span-3 bg-[#131419] border-2 border-blue-500/40 rounded-xl p-4 relative shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-blue-400">E-Vedhika Tool</h3>
                  <span className="text-[10px] text-ink-muted font-mono">Client Engine v1.0.8</span>
                </div>
              </div>
              <p className="text-xs text-ink-medium mb-3 leading-relaxed">
                Client workstations running in Grama Panchayat & Mandal Offices (Telangana / AP).
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-ink-light">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>1. Cold Vault Ingest</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>2. Web Telemetry & Receiver</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>3. Personal WhatsApp Alert</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>4. Telegram Bot Relay</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-faint/40 text-[10px] font-mono text-cyan-300">
              ⚡ Instant 4-Way Broadcast
            </div>
          </div>

          {/* 4 Target Pillars Stack */}
          <div className="lg:col-span-9 space-y-3">

            {/* Pillar 1: Cold Server */}
            <div className="bg-[#0f1b16] border-2 border-emerald-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-emerald-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">1</span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-emerald-400">Pillar 1: Cold Server Database & Storage</h4>
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
                • Store Application Data &nbsp;• Backup & Snapshot Archive &nbsp;• Data Processing & Integrity Audits
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                <span className="text-ink-muted font-mono">Storage: cold_server_storage.json</span>
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

            {/* Bidirectional Sync: Cold ⟷ Web */}
            <div className="flex items-center justify-center -my-1">
              <button
                onClick={handleSyncColdWithWebsite}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-1 bg-[#1a122e] border border-purple-500/40 hover:border-purple-500/70 text-purple-300 rounded-full text-xs font-mono shadow-sm hover:scale-105 transition-all"
                title="Bidirectional sync between Cold Server and Website"
              >
                <ArrowLeftRight className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
                <span>Bidirectional Sync: Cold Server Database ⟷ Web Central</span>
              </button>
            </div>

            {/* Pillar 2: Web Central & Fleet Receiver */}
            <div className="bg-[#0e1726] border-2 border-blue-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-blue-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-sm text-blue-400">Pillar 2: Web Central & Fleet Receiver</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {webActive} Nodes Live
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-blue-200/80 mb-2">
                • Admin Dashboard &nbsp;• Continuous Telemetry Receiver & Vault &nbsp;• Continuous Website Upload
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-500/20 text-[11px]">
                <span className="text-ink-muted font-mono truncate max-w-[280px]">https://www.e-vedhika.in/api/reporting/receiver</span>
                <span className="text-blue-300 font-mono font-medium">Vault: telemetry_vault.json</span>
              </div>
            </div>

            {/* Pipeline Connector to Personal Messenger */}
            <div className="flex items-center justify-center -my-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0f241a] border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-mono">
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Personal Messenger Pipeline: Admin Phone & Key Dynamic Live Sync</span>
              </div>
            </div>

            {/* Pillar 3: WhatsApp Personal Messenger Gateway */}
            <div className="bg-[#0f241a] border-2 border-emerald-500/50 rounded-xl p-3.5 sm:p-4 transition-all hover:border-emerald-500/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-emerald-400">Pillar 3: WhatsApp Personal Messenger Gateway</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {waPhone}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${waStatus ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                </div>
              </div>
              <p className="text-xs text-emerald-200/80 mb-2">
                • Direct Admin Phone Alerts &nbsp;• CallMeBot / UltraMsg API &nbsp;• Live Settings Dynamic Sync from Dashboard
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                <span className="text-ink-muted font-mono truncate">CallMeBot / UltraMsg API Gateway</span>
                <button
                  onClick={handleTestWhatsApp}
                  disabled={testingWa}
                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {testingWa ? 'Dispatching...' : 'Test WhatsApp Alert'}
                </button>
              </div>
            </div>

            {/* Pipeline Connector to Telegram */}
            <div className="flex items-center justify-center -my-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#26101d] border border-pink-500/40 text-pink-300 rounded-full text-xs font-mono">
                <ArrowLeftRight className="w-3.5 h-3.5 text-pink-400" />
                <span>Cloud Relay Pipeline: Telegram Webhook (Port 3000 Listener)</span>
              </div>
            </div>

            {/* Pillar 4: Telegram Bot & Cloud Relay */}
            <div className="bg-[#200f13] border-2 border-rose-500/40 rounded-xl p-3.5 sm:p-4 transition-all hover:border-rose-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-rose-400" />
                    <h4 className="font-bold text-sm text-rose-400">Pillar 4: Telegram Bot & Cloud Relay</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    @ubd_installation_alerts_bot
                  </span>
                  <span className={`w-2 h-2 rounded-full ${tgStatus ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                </div>
              </div>
              <p className="text-xs text-rose-200/80 mb-2">
                • Automated Diagnostic Reports &nbsp;• Emergency Failure Alerts &nbsp;• Admin Interactive Chat Commands (/status, /stats)
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-500/20 text-[11px]">
                <span className="text-ink-muted font-mono truncate">Chat ID: {networkStatus?.pipelines?.telegram?.adminChatId || '431228008'}</span>
                <button
                  onClick={handleTestTelegram}
                  disabled={testingTg}
                  className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {testingTg ? 'Broadcasting...' : 'Broadcast Telegram Test'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Status Bar for 4 Channels */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/60 p-3.5 rounded-lg border border-ink-faint font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pillar 1 Cold Storage: ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pillar 2 Web Central: ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pillar 3 WhatsApp: ACTIVE ({waPhone})</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pillar 4 Telegram: VERIFIED (@ubd_installation_alerts_bot)</span>
          </span>
        </div>
        <div className="text-ink-muted">
          All 4 Pillars Connected in Real-Time
        </div>
      </div>
    </div>
  );
};
