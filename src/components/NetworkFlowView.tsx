import React from 'react';
import { NetworkDataFlowDiagram } from './NetworkDataFlowDiagram';
import { WhatsAppAndGoogleChatCard } from './WhatsAppAndGoogleChatCard';
import { TelegramNotificationCard } from './TelegramNotificationCard';
import { 
  Network, 
  Database, 
  Globe, 
  Send, 
  ShieldCheck, 
  Zap, 
  Cloud,
  ArrowRightLeft,
  Server,
  MessageCircle
} from 'lucide-react';

export const NetworkFlowView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-faint pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-syne font-black text-ink tracking-tight flex items-center gap-3">
              <Network className="w-8 h-8 text-accent" />
              <span>4-Pillar Network Flow Architecture</span>
            </h1>
            <p className="text-ink-medium mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
              Live visualization of E-Vedhika's 4-pillar data distribution strategy. 
              Monitor real-time synchronization between Cold Database, Web Central, WhatsApp Personal Messenger, and Telegram endpoints.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">4-Pillar System Active</span>
            </div>
          </div>
        </div>

        {/* Integration Pillars Overview (4-Pillars) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="status-card border-emerald-500/20 group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-syne font-bold text-ink text-sm">Pillar 1: Cold Server</h3>
            </div>
            <p className="text-[11px] text-ink-medium leading-relaxed">
              Secure JSON-vault storage for persistent application data, historical audits, and offline redundant backups.
            </p>
          </div>

          <div className="status-card border-blue-500/20 group hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-syne font-bold text-ink text-sm">Pillar 2: Web Central</h3>
            </div>
            <p className="text-[11px] text-ink-medium leading-relaxed">
              Real-time administrative dashboard and continuous telemetry receiver streaming logs to website vaults.
            </p>
          </div>

          <div className="status-card border-emerald-500/20 group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-syne font-bold text-ink text-sm">Pillar 3: WhatsApp Gateway</h3>
            </div>
            <p className="text-[11px] text-ink-medium leading-relaxed">
              Instant mobile notifications dispatched to Admin's personal messenger using CallMeBot / UltraMsg API.
            </p>
          </div>

          <div className="status-card border-rose-500/20 group hover:border-rose-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-syne font-bold text-ink text-sm">Pillar 4: Telegram Bot</h3>
            </div>
            <p className="text-[11px] text-ink-medium leading-relaxed">
              Automated cloud relay channel (@ubd_installation_alerts_bot) for critical system failures and interactive chat queries.
            </p>
          </div>
        </div>

        {/* The Live Diagram Component */}
        <NetworkDataFlowDiagram />

        {/* Live WhatsApp & Personal Messenger Configuration Widget */}
        <WhatsAppAndGoogleChatCard />

        {/* Live Telegram Bot Configuration Widget */}
        <TelegramNotificationCard />

        {/* Technical Specification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-syne font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Bidirectional Sync Engine</span>
            </h2>
            <div className="bg-ink-faint/5 border border-ink-faint rounded-xl p-6 space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Cold ⟷ Website Logic</h4>
                  <p className="text-xs text-ink-medium mt-1 leading-relaxed">
                    Automated background reconciliation ensures that data ingested into the Cold Server is mirrored to the Web Portal, and manually adjusted records on the portal are archived back to the Cold Database.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Real-time Webhook Pipeline</h4>
                  <p className="text-xs text-ink-medium mt-1 leading-relaxed">
                    The Telegram Webhook (Port 3000) allows the bot to receive commands and queries, fetching live data from the Web Central state to provide instant status reports via @ubd_installation_alerts_bot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-syne font-bold text-ink flex items-center gap-2">
              <Server className="w-5 h-5 text-accent" />
              <span>Infrastructure Topology</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 border border-ink-faint rounded-lg">
                <span className="label block mb-1">Runtime</span>
                <span className="text-sm font-mono text-ink">Node.js 22 (Express)</span>
              </div>
              <div className="p-4 bg-black/30 border border-ink-faint rounded-lg">
                <span className="label block mb-1">Primary Port</span>
                <span className="text-sm font-mono text-ink">3000 (HTTPS)</span>
              </div>
              <div className="p-4 bg-black/30 border border-ink-faint rounded-lg">
                <span className="label block mb-1">Data Format</span>
                <span className="text-sm font-mono text-ink">JSON / Buffer</span>
              </div>
              <div className="p-4 bg-black/30 border border-ink-faint rounded-lg">
                <span className="label block mb-1">Auth Layer</span>
                <span className="text-sm font-mono text-ink">Token / ChatID / Phone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
