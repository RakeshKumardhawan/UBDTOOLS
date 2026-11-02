import React, { useState, useEffect } from 'react';
import { MessageCircle, Bot, Send, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Key, HelpCircle, Phone, Globe, ExternalLink } from 'lucide-react';

interface MultiChannelConfig {
  whatsapp: {
    enabled: boolean;
    apiKey: string;
    phone: string;
    provider: string;
    instanceId: string;
  };
  googleChat: {
    enabled: boolean;
    webhookUrl: string;
  };
  discord: {
    enabled: boolean;
    webhookUrl: string;
  };
  emailAlerts: {
    enabled: boolean;
    instantOnFailure: boolean;
    recipient: string;
  };
}

export function WhatsAppAndGoogleChatCard() {
  const [config, setConfig] = useState<MultiChannelConfig>({
    whatsapp: {
      enabled: false,
      apiKey: '',
      phone: '',
      provider: 'callmebot',
      instanceId: ''
    },
    googleChat: {
      enabled: false,
      webhookUrl: ''
    },
    discord: {
      enabled: false,
      webhookUrl: ''
    },
    emailAlerts: {
      enabled: true,
      instantOnFailure: true,
      recipient: 'Rakeshkumardhawan123@gmail.com'
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [isTestingGchat, setIsTestingGchat] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Custom Social Media & Channels
  const [customChannels, setCustomChannels] = useState<Array<{ id: string; name: string; type: string; value: string; enabled: boolean; description?: string }>>([]);
  const [isSavingChannels, setIsSavingChannels] = useState(false);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/multi-channel-config');
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.channels) {
          setConfig(data.channels);
        }
      }

      // Fetch custom social media channels
      const scResp = await fetch('/api/social-channels');
      if (scResp.ok) {
        const scData = await scResp.json();
        if (scData.success && Array.isArray(scData.channels)) {
          setCustomChannels(scData.channels);
        }
      }
    } catch (e) {
      console.warn('Failed to load multi-channel config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddCustomChannel = () => {
    setCustomChannels([
      ...customChannels,
      {
        id: `ch-${Date.now()}`,
        name: 'New Channel / Social Link',
        type: 'custom',
        value: '',
        enabled: true,
        description: 'Custom social media link or webhook'
      }
    ]);
  };

  const handleSaveCustomChannels = async () => {
    setIsSavingChannels(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/social-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: customChannels })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ type: 'success', text: '✅ Social Media Channels updated & saved successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save channels.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Error saving channels.' });
    } finally {
      setIsSavingChannels(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/multi-channel-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ type: 'success', text: '✅ WhatsApp & Google Chat settings saved successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Server connection error.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWa(true);
    setStatusMsg(null);
    try {
      // First save config so server uses updated numbers
      await fetch('/api/multi-channel-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: { ...config.whatsapp, enabled: true }
        })
      });

      const resp = await fetch('/api/reporting/receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pcName: 'TEST-WHATSAPP-PC',
          userName: 'E-Vedhika Admin',
          officeLocation: 'E-Vedhika Central Monitoring Station',
          state: 'Telangana',
          district: 'Hyderabad',
          status: 'SUCCESS',
          remarks: 'Instant WhatsApp Live Test Alert from E-Vedhika Web Dashboard!'
        })
      });

      if (resp.ok) {
        setStatusMsg({ type: 'success', text: `🟢 WhatsApp test notification sent to +${config.whatsapp.phone}! Please check your WhatsApp messages.` });
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to send WhatsApp test. Please verify your CallMeBot / UltraMsg API key and phone number.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Network error sending WhatsApp test.' });
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleTestGoogleChat = async () => {
    setIsTestingGchat(true);
    setStatusMsg(null);
    try {
      await fetch('/api/multi-channel-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleChat: { ...config.googleChat, enabled: true }
        })
      });

      const resp = await fetch('/api/reporting/receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pcName: 'TEST-GOOGLE-CHAT-PC',
          userName: 'E-Vedhika Operator',
          officeLocation: 'Mandal Parishad Development Office',
          state: 'Telangana',
          district: 'Mancherial',
          status: 'SUCCESS',
          remarks: 'Instant Google Chat Space Webhook Alert Test!'
        })
      });

      if (resp.ok) {
        setStatusMsg({ type: 'success', text: '🟢 Google Chat webhook test delivered successfully! Check your Google Chat space.' });
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to send Google Chat test. Please check your Webhook URL.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Error triggering Google Chat test.' });
    } finally {
      setIsTestingGchat(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              WhatsApp & Google Chat Multi-Channel Gateway
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                LIVE DUAL SYNC
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure automated telemetry and error reports from all Grama Panchayat & Mandal Office computers directly to WhatsApp and Google Chat.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Multi-Channel Settings'}
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid Layout for WhatsApp and Google Chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ========================================================= */}
        {/* 1. WHATSAPP NOTIFICATION PANEL */}
        {/* ========================================================= */}
        <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              1. WhatsApp Instant Alerts
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.whatsapp.enabled}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Admin WhatsApp Mobile Number
              </label>
              <input
                type="text"
                placeholder="e.g. 91XXXXXXXXXX (With country code 91)"
                value={config.whatsapp.phone}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, phone: e.target.value }
                })}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <span className="text-[11px] text-slate-500">Example: <code>91XXXXXXXXXX</code> (Enter with country code 91)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Provider Choice
              </label>
              <select
                value={config.whatsapp.provider}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, provider: e.target.value }
                })}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
              >
                <option value="callmebot">CallMeBot (Free WhatsApp Bot API)</option>
                <option value="ultramsg">UltraMsg (Enterprise WhatsApp Gateway)</option>
              </select>
            </div>

            {config.whatsapp.provider === 'callmebot' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-600" /> CallMeBot WhatsApp API Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={config.whatsapp.apiKey}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsapp: { ...config.whatsapp, apiKey: e.target.value }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UltraMsg Instance ID</label>
                  <input
                    type="text"
                    placeholder="e.g. instance12345"
                    value={config.whatsapp.instanceId}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, instanceId: e.target.value }
                    })}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UltraMsg Token</label>
                  <input
                    type="text"
                    placeholder="e.g. abc123xyz"
                    value={config.whatsapp.apiKey}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, apiKey: e.target.value }
                    })}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleTestWhatsApp}
              disabled={isTestingWa || !config.whatsapp.phone}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isTestingWa ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isTestingWa ? 'Sending WhatsApp Test...' : 'Send WhatsApp Test Alert'}
            </button>

            {/* Step-by-step setup guide */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100 text-[11px] text-slate-600 space-y-1.5">
              <p className="font-bold text-emerald-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> CallMeBot Free WhatsApp Setup Guide (30 Seconds):
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                <li>Save contact <b>+34 644 10 55 84</b> or <b>+34 644 51 95 23</b> on your phone.</li>
                <li>Send WhatsApp message <code>I allow callmebot to send me messages</code>.</li>
                <li>The bot will reply with your <b>API Key</b>. Paste it above.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. GOOGLE CHAT NOTIFICATION PANEL */}
        {/* ========================================================= */}
        <div className="border border-sky-200 bg-sky-50/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
              <Globe className="w-5 h-5 text-sky-600" />
              2. Google Chat Space Webhooks
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.googleChat.enabled}
                onChange={(e) => setConfig({
                  ...config,
                  googleChat: { ...config.googleChat, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-sky-600" /> Google Chat Incoming Webhook URL
              </label>
              <textarea
                rows={3}
                placeholder="https://chat.googleapis.com/v1/spaces/AAAA.../messages?key=AIzaSy...&token=..."
                value={config.googleChat.webhookUrl}
                onChange={(e) => setConfig({
                  ...config,
                  googleChat: { ...config.googleChat, webhookUrl: e.target.value }
                })}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-mono resize-none"
              />
            </div>

            <button
              onClick={handleTestGoogleChat}
              disabled={isTestingGchat || !config.googleChat.webhookUrl}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isTestingGchat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isTestingGchat ? 'Testing Google Chat...' : 'Send Google Chat Test Alert'}
            </button>

            {/* Step-by-step setup guide */}
            <div className="bg-white p-3.5 rounded-xl border border-sky-100 text-[11px] text-slate-600 space-y-1.5">
              <p className="font-bold text-sky-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Google Chat Webhook Creation Steps:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                <li>Open Google Chat and click the dropdown arrow next to your Space title.</li>
                <li>Select <b>Apps & Integrations</b> -&gt; <b>Manage Webhooks</b>.</li>
                <li>Click <b>Add Webhook</b> and name it <code>E-Vedhika Alerts</code>.</li>
                <li>Copy the generated <b>Webhook URL</b> and paste it above.</li>
              </ol>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. DYNAMIC SOCIAL MEDIA & CUSTOM CHANNELS MANAGER HUB */}
      {/* ========================================================= */}
      <div className="border border-indigo-200 bg-indigo-50/20 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Dynamic Social Media & Custom Channels Manager
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                100% EDITABLE
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Future-proof configuration: Add, Edit, Update, or Delete any Telegram, WhatsApp, YouTube, Support Phone, Email, or Custom Webhook data dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddCustomChannel}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>+ Add New Channel</span>
            </button>
            <button
              onClick={handleSaveCustomChannels}
              disabled={isSavingChannels}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isSavingChannels ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isSavingChannels ? 'Saving...' : 'Save Channels'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {customChannels.map((ch, idx) => (
            <div key={ch.id || idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={ch.enabled}
                  onChange={(e) => {
                    const updated = [...customChannels];
                    updated[idx].enabled = e.target.checked;
                    setCustomChannels(updated);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                
                <select
                  value={ch.type}
                  onChange={(e) => {
                    const updated = [...customChannels];
                    updated[idx].type = e.target.value;
                    setCustomChannels(updated);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="telegram">Telegram Bot / Group</option>
                  <option value="whatsapp">WhatsApp Number / API</option>
                  <option value="youtube">YouTube Channel</option>
                  <option value="gchat">Google Chat Space</option>
                  <option value="discord">Discord Webhook</option>
                  <option value="email">Support Email</option>
                  <option value="phone">Support Phone</option>
                  <option value="custom">Custom Webhook / Link</option>
                </select>

                <input
                  type="text"
                  placeholder="Channel Name (e.g., Telegram Bot ID)"
                  value={ch.name}
                  onChange={(e) => {
                    const updated = [...customChannels];
                    updated[idx].name = e.target.value;
                    setCustomChannels(updated);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 w-44 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Value / Token / Phone / URL / Webhook"
                  value={ch.value}
                  onChange={(e) => {
                    const updated = [...customChannels];
                    updated[idx].value = e.target.value;
                    setCustomChannels(updated);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  onClick={() => {
                    const updated = customChannels.filter((_, i) => i !== idx);
                    setCustomChannels(updated);
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete Channel"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
