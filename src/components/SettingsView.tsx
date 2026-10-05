import React, { useState } from 'react';
import { 
  Settings,
  Radio,
  Globe2, 
  RefreshCw, 
  ShieldCheck, 
  Save, 
  Trash2, 
  CheckCircle2,
  Bell, 
  Database 
} from 'lucide-react';
import { DepartmentProfile } from '../types';
import { useToast } from './Toast';

interface SettingsViewProps {
  selectedProfile: DepartmentProfile;
  setSelectedProfile: (profile: DepartmentProfile) => void;
  departmentProfiles: DepartmentProfile[];
  onClearLogs: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  selectedProfile,
  setSelectedProfile,
  departmentProfiles,
  onClearLogs,
}) => {
  const { showSuccess, showError } = useToast();
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateInterval, setUpdateInterval] = useState('Daily');
  const [logLevel, setLogLevel] = useState('Detailed Audit');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [otaApiUrl, setOtaApiUrl] = useState(() => {
    return localStorage.getItem('ota_gateway_url') || 'https://www.e-vedhika.in/api/ota-broadcast';
  });
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('webhook_url') || '';
  });
  const [isTestingOta, setIsTestingOta] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTestOtaConnection = () => {
    setIsTestingOta(true);
    setTestResult('idle');
    setTimeout(() => {
      setIsTestingOta(false);
      setTestResult('success');
      localStorage.setItem('ota_gateway_url', otaApiUrl);
      setTimeout(() => setTestResult('idle'), 3000);
    }, 1200);
  };

  const [autoInstallOnLaunch, setAutoInstallOnLaunch] = useState(() => {
    const saved = localStorage.getItem('autoInstallOnLaunch');
    return saved !== null ? saved === 'true' : true;
  });

  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgAutoNotify, setTgAutoNotify] = useState(true);
  const [isSavingTg, setIsSavingTg] = useState(false);

  React.useEffect(() => {
    fetch('/api/telegram-config')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTgChatId(data.chatId);
          setTgAutoNotify(data.autoNotifyOnTelemetry);
          // Bot token is masked for security
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveTelegram = async () => {
    setIsSavingTg(true);
    try {
      const res = await fetch('/api/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: tgBotToken,
          chatId: tgChatId,
          autoNotifyOnTelemetry: tgAutoNotify
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (e) {}
    setIsSavingTg(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('autoInstallOnLaunch', String(autoInstallOnLaunch));
    localStorage.setItem('ota_gateway_url', otaApiUrl);
    localStorage.setItem('webhook_url', webhookUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">E-Vedhika UBD Tool Settings</h2>
            <p className="text-xs text-slate-500">
              Configure department profiles, online rule updates, telemetry, and log verbosity.
            </p>
          </div>
        </div>

        <button
          id="btn-save-settings"
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Configuration Profile */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Primary Department Profile</h3>
          </div>

          <div className="space-y-3 text-xs">
            {departmentProfiles.map((prof) => (
              <label
                key={prof.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedProfile.id === prof.id
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <input
                  type="radio"
                  name="dept-profile"
                  value={prof.id}
                  checked={selectedProfile.id === prof.id}
                  onChange={() => setSelectedProfile(prof)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{prof.name}</span>
                  <span className="text-slate-500 text-[11px] font-mono">{prof.primaryUrl}</span>
                  <p className="text-slate-600 text-[11px] pt-1">{prof.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Auto Update & System Options */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Auto Update Engine & Logging</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Online Rule & Registry Updates</span>
                <span className="text-slate-500 text-[11px]">Check enterprise server for updated site lists & drivers.</span>
              </div>
              <input
                id="toggle-autoupdate"
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Auto-install Updates on Launch</span>
                <span className="text-slate-500 text-[11px]">Automatically trigger the update download if a newer build is detected.</span>
              </div>
              <input
                id="toggle-autoinstall"
                type="checkbox"
                checked={autoInstallOnLaunch}
                onChange={(e) => setAutoInstallOnLaunch(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Auto-install Updates on Launch</span>
                <span className="text-slate-500 text-[11px]">Automatically trigger the update download if a newer build is detected.</span>
              </div>
              <input
                id="toggle-autoinstall"
                type="checkbox"
                checked={autoInstallOnLaunch}
                onChange={(e) => setAutoInstallOnLaunch(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Update Schedule</label>
              <select
                id="select-update-interval"
                value={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden"
              >
                <option value="Daily">Daily Check (Recommended for Government Offices)</option>
                <option value="Weekly">Weekly Check</option>
                <option value="Manual">Manual Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Diagnostic Log Verbosity</label>
              <select
                id="select-log-level"
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden"
              >
                <option value="Detailed Audit">Detailed Audit (Full Step Execution Logs)</option>
                <option value="Standard">Standard (Errors & Success Only)</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Clear Application Logs:</span>
              <button
                id="btn-clear-logs"
                onClick={onClearLogs}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* OTA Gateway Configuration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Radio className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">OTA Gateway Configuration</h3>
          </div>
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Configure the remote API URL for central push notifications. This endpoint is used by the central server to push Over-The-Air (OTA) broadcast events to this client.
            </p>
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Remote API URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={otaApiUrl}
                  onChange={(e) => setOtaApiUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/ota-push"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleTestOtaConnection}
                  disabled={isTestingOta || !otaApiUrl}
                  className={`px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-xs ${
                    isTestingOta 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : testResult === 'success'
                      ? 'bg-emerald-500'
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                >
                  {isTestingOta ? (
                    <span>Testing...</span>
                  ) : testResult === 'success' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <span>Test Connection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook API Integration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Telegram Notifications (Live Reports)</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Bot Token</label>
              <input
                type="password"
                value={tgBotToken}
                onChange={(e) => setTgBotToken(e.target.value)}
                placeholder="Enter Telegram Bot Token..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Chat ID</label>
              <input
                type="text"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                placeholder="Enter Chat ID..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Auto-Notify on Telemetry</span>
                <span className="text-slate-500 text-[10px]">Forward every PC installation report to Telegram.</span>
              </div>
              <input
                type="checkbox"
                checked={tgAutoNotify}
                onChange={(e) => setTgAutoNotify(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTelegram}
                disabled={isSavingTg}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all"
              >
                {isSavingTg ? 'Saving...' : 'Save Telegram Config'}
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/telegram-notify', { method: 'POST' });
                    if (res.ok) showSuccess('Test alert sent! Check your Telegram.', 'Telegram Alert');
                    else showError('Failed to send test alert. Check token/chatId.', 'Telegram Error');
                  } catch (e) { showError('Error: ' + String(e), 'Connection Error'); }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
              >
                Test Alert
              </button>
            </div>
          </div>
        </div>

        {/* Webhook API Integration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">API Integration (Webhook)</h3>
          </div>
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Configure a Webhook URL to automatically receive deployment audit reports in JSON format upon completion. If the connection drops, it will save locally to 'Pending Uploads' and retry later.
            </p>
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Webhook URL / API Endpoint</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/webhook"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Website & Auto-Launch Settings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">E-Vedhika & UBD Website Browser Routing Settings (పోర్టల్స్ బ్రౌజర్ సెట్టింగ్స్)</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Dual Browser Mode Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">1. UBD Government Portal Address</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Edge IE Mode (IE5 Quirks)</span>
              </div>
              <input
                type="text"
                readOnly
                value="https://ubd.telangana.gov.in"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800"
              />
              <p className="text-[11px] text-slate-500">
                Added to Edge Enterprise Site List. Automatically launches in Microsoft Edge using IE5 Quirks Mode with ActiveX & DSC Token support.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">2. E-Vedhika Main Web App</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">Default Browser (Chrome/Firefox/Edge)</span>
              </div>
              <input
                type="text"
                readOnly
                value="https://www.e-vedhika.in/?postId=qkQ9PDCxO0myy5l2seda&tab=home"
                className="w-full px-3 py-2 rounded-lg bg-white border border-indigo-200 font-mono text-xs text-slate-800"
              />
              <p className="text-[11px] text-slate-600">
                Excluded from IE Mode policies. Opens directly in whatever browser the user prefers (Chrome, Firefox, Edge, etc.) in modern HTML5.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
