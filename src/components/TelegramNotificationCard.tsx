import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Key, MessageSquare, Bot, HelpCircle, Copy, Check } from 'lucide-react';

interface TelegramConfig {
  hasBotToken: boolean;
  botTokenMasked: string;
  chatId: string;
  autoNotifyOnTelemetry: boolean;
}

export function TelegramNotificationCard() {
  const [config, setConfig] = useState<TelegramConfig>({
    hasBotToken: false,
    botTokenMasked: '',
    chatId: '',
    autoNotifyOnTelemetry: true
  });

  const [inputBotToken, setInputBotToken] = useState('');
  const [inputChatId, setInputChatId] = useState('');
  const [autoNotify, setAutoNotify] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const resp = await fetch('/api/telegram-config');
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setConfig(data);
          setInputChatId(data.chatId || '');
          setAutoNotify(data.autoNotifyOnTelemetry !== false);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Telegram config:', e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: inputBotToken ? inputBotToken.trim() : undefined,
          chatId: inputChatId.trim(),
          autoNotifyOnTelemetry: autoNotify
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ type: 'success', text: '✅ Telegram Bot configuration saved successfully!' });
        setInputBotToken('');
        fetchConfig();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save configuration.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Server error while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = async () => {
    setIsSendingTest(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `🛡️ <b>E-VEDHIKA CENTRAL TELEMETRY TEST</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `✅ <b>Status:</b> Telegram Gateway is Live & Connected!\n` +
            `🌐 <b>Portal:</b> www.e-vedhika.in\n` +
            `🏢 <b>Engine:</b> All Problems One Solution & UBD Deployment Tool\n` +
            `🕒 <b>Time:</b> ${new Date().toLocaleString()}\n\n` +
            `<i>Every deployment from all Grama Panchayats will automatically report here.</i>`,
          botToken: inputBotToken.trim() || undefined,
          chatId: inputChatId.trim() || undefined
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ type: 'success', text: '🚀 Telegram Test message delivered successfully! Check your Telegram app.' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to dispatch Telegram message. Please check Bot Token and Chat ID.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Network error sending message.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="telegram-reports-gateway-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-200 shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              ✈️ Telegram Live Telemetry & Diagnostic Reports Gateway
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              config.hasBotToken && config.chatId
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {config.hasBotToken && config.chatId ? '🟢 Telegram Active' : '⚪ Setup Required'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Automatically receive 15-step UBD deployment reports and 90-parameter diagnostics from all Telangana Grama Panchayat workstations straight into your Telegram channel or group.
          </p>
        </div>

        {statusMsg && (
          <div className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Main Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-sky-600" />
                <span>Telegram Bot Token</span>
              </span>
              {config.hasBotToken && (
                <span className="text-[11px] font-mono text-emerald-600 font-bold">
                  Saved: {config.botTokenMasked}
                </span>
              )}
            </label>
            <input
              type="password"
              value={inputBotToken}
              onChange={(e) => setInputBotToken(e.target.value)}
              placeholder={config.hasBotToken ? "Enter new token to overwrite, or leave blank" : "e.g. 7123456789:AAHkL1v-XYZabcdefghijklmnop"}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              Created in 10 seconds with @BotFather on Telegram (free & unlimited).
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>Telegram Chat ID / Channel Username</span>
            </label>
            <input
              type="text"
              value={inputChatId}
              onChange={(e) => setInputChatId(e.target.value)}
              placeholder="e.g. 123456789 (Your User ID) or -1001234567890 (Channel ID)"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              You can get your ID from @userinfobot or invite your bot as Admin to your private Telegram channel.
            </span>
          </div>

          {/* Auto Forward Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Auto-Forward Live Telemetry Reports</span>
              <span className="text-[11px] text-slate-500 block">
                Whenever any GP computer completes deployment, instantly dispatch a report to Telegram.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoNotify}
                onChange={(e) => setAutoNotify(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Telegram Config'}</span>
            </button>

            <button
              onClick={handleSendTestAlert}
              disabled={isSendingTest || (!config.hasBotToken && !inputBotToken)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-bounce' : ''}`} />
              <span>{isSendingTest ? 'Sending to Telegram...' : '🚀 Send Test Alert to Telegram'}</span>
            </button>
          </div>
        </div>

        {/* Right: How to setup in 30 seconds (5 cols) */}
        <div className="lg:col-span-5 bg-sky-50/50 border border-sky-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
            <Bot className="w-4 h-4 text-sky-600" />
            <span>30 సెకన్లలో Telegram Bot ఎలా తయారుచేయాలి?</span>
          </div>

          <ol className="text-[11px] text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Telegram ఓపెన్ చేసి సెర్చ్ బార్‌లో <b>@BotFather</b> అని టైప్ చేయండి.
            </li>
            <li>
              <b>/newbot</b> అని పంపి, మీ బోట్ పేరు (ఉదా: <code>EVedhika_UBD_Bot</code>) ఇవ్వండి.
            </li>
            <li>
              అది ఇచ్చే <b>HTTP API Token</b> ని కాపీ చేసి పక్కనున్న బాక్స్‌లో పేస్ట్ చేయండి.
            </li>
            <li>
              మీ <b>Chat ID</b> తెలుసుకోవడానికి <b>@userinfobot</b> కి హాయ్ అని పంపితే మీ ID నంబర్ వస్తుంది.
            </li>
            <li>
              మీ కొత్త బోట్ కి ఒక్కసారి <b>/start</b> మెసేజ్ పంపి, ఇక్కడ <b>"Send Test Alert"</b> బటన్ నొక్కండి!
            </li>
          </ol>

          <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-[11px] text-sky-800">
            <span className="font-semibold">Sample Template:</span>
            <button
              onClick={() => copyToClipboard(`🛡️ E-VEDHIKA TELEMETRY REPORT\n🏢 Office: Kodangal GP\n💻 PC: GP-SEC-01\n⚡ Status: 15/15 SUCCESS`, 'tmpl')}
              className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
            >
              {copiedIndex === 'tmpl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedIndex === 'tmpl' ? 'Copied' : 'Copy Preview'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
