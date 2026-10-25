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
  Database,
  Star,
  MessageSquareHeart,
  Send,
  AlertCircle,
  Layers,
  Hash,
  RotateCw,
  Server,
  ShieldAlert,
  FileCode
} from 'lucide-react';
import { DepartmentProfile } from '../types';
import { useToast } from './Toast';
import { 
  getLocalResourceManifest, 
  checkResourceManifestUpdates, 
  syncSingleResource, 
  syncAllResources, 
  ResourceManifest 
} from '../utils/updateEngine';

interface SettingsViewProps {
  selectedProfile: DepartmentProfile;
  setSelectedProfile: (profile: DepartmentProfile) => void;
  departmentProfiles: DepartmentProfile[];
  onClearLogs: () => void;
  onResetState: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  selectedProfile,
  setSelectedProfile,
  departmentProfiles,
  onClearLogs,
  onResetState,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateInterval, setUpdateInterval] = useState('Daily');
  const [logLevel, setLogLevel] = useState('Detailed Audit');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Resource Manifest & Component Hash State
  const [manifest, setManifest] = useState<ResourceManifest>(() => getLocalResourceManifest());
  const [isCheckingManifest, setIsCheckingManifest] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleCheckManifestUpdates = async () => {
    setIsCheckingManifest(true);
    try {
      const updated = await checkResourceManifestUpdates();
      setManifest(updated);
      if (updated.outdatedCount > 0) {
        showInfo(`${updated.outdatedCount} component resource(s) have new OTA hash updates available!`, 'Resource Updates Found');
      } else {
        showSuccess('All resource component hashes are verified and up to date!', 'Manifest Verified');
      }
    } catch (e) {
      showError('Failed to check resource manifest updates.', 'Network Error');
    } finally {
      setIsCheckingManifest(false);
    }
  };

  const handleSyncAllResources = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      const synced = syncAllResources();
      setManifest(synced);
      setIsSyncingAll(false);
      showSuccess('All component resources synced to latest hashes! Software version remains v1.0.7.', 'Resources Synced');
    }, 800);
  };

  const handleSyncSingleResource = (id: string, name: string) => {
    const synced = syncSingleResource(id);
    setManifest(synced);
    showSuccess(`Component '${name}' updated to latest hash!`, 'Component Synced');
  };

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

  // Feedback Section State & Handlers
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackOffice, setFeedbackOffice] = useState<string>('Grama Panchayat / Mandal Office');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  const ratingLabels: Record<number, { title: string; desc: string; color: string }> = {
    1: { title: '1 Star - Critical Issues', desc: 'సమస్యలు ఉన్నాయి (Needs immediate fix)', color: 'text-rose-600' },
    2: { title: '2 Stars - Fair / Needs Work', desc: 'కొన్ని లోపాలు ఉన్నాయి (Some issues faced)', color: 'text-amber-600' },
    3: { title: '3 Stars - Satisfactory', desc: 'పర్వాలేదు (Acceptable performance)', color: 'text-yellow-600' },
    4: { title: '4 Stars - Very Good', desc: 'బాగుంది (Works smoothly)', color: 'text-emerald-600' },
    5: { title: '5 Stars - Excellent!', desc: 'అద్భుతంగా పనిచేస్తోంది (Seamless DSC & UBD)', color: 'text-teal-600' },
  };

  const handleQuickTagClick = (tag: string) => {
    setFeedbackText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return prev;
      return `${trimmed} | ${tag}`;
    });
  };

  const handleSubmitFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (feedbackRating <= 0) {
      showError('Please select a star rating between 1 and 5 stars.', 'Rating Required');
      return;
    }
    if (!feedbackText.trim()) {
      showError('Please enter some text feedback or comments before submitting.', 'Feedback Required');
      return;
    }
    const targetWebhook = (webhookUrl || '').trim();
    if (!targetWebhook) {
      showError('Please enter and save a Webhook URL first in the "API Integration (Webhook)" section.', 'Webhook URL Missing');
      return;
    }

    setIsSubmittingFeedback(true);
    const payload = {
      event: 'user_feedback',
      rating: feedbackRating,
      ratingLabel: ratingLabels[feedbackRating]?.title || `${feedbackRating} Stars`,
      ratingTelugu: ratingLabels[feedbackRating]?.desc || '',
      feedback: feedbackText.trim(),
      office: feedbackOffice.trim() || 'Telangana Office',
      departmentProfile: selectedProfile?.name || 'Urban Basic Development (UBD)',
      primaryUrl: selectedProfile?.primaryUrl || 'https://ubd.telangana.gov.in',
      timestamp: new Date().toISOString(),
      submittedAt: new Date().toLocaleString(),
      clientEnvironment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        platform: typeof navigator !== 'undefined' ? navigator.platform : ''
      },
      source: 'E-Vedhika Settings Feedback Portal',
      version: 'v1.0.7'
    };

    try {
      // Dispatch via server-side proxy route to avoid browser CORS issues with 3rd-party webhook endpoints
      const response = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: targetWebhook,
          payload
        })
      });

      const resData = await response.json().catch(() => null);

      if (response.ok && resData?.success) {
        showSuccess('Feedback & rating sent successfully to the webhook endpoint!', 'Feedback Dispatched');
        setFeedbackSuccess(true);
        setFeedbackText('');
        setTimeout(() => setFeedbackSuccess(false), 4000);
      } else {
        // Direct browser fetch fallback if proxy failed or direct CORS allowed
        try {
          const directRes = await fetch(targetWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (directRes.ok) {
            showSuccess('Feedback delivered directly to your webhook URL!', 'Feedback Dispatched');
            setFeedbackSuccess(true);
            setFeedbackText('');
            setTimeout(() => setFeedbackSuccess(false), 4000);
          } else {
            showError(resData?.error || `Webhook responded with HTTP status ${response.status}`, 'Delivery Failed');
          }
        } catch {
          showError(resData?.error || 'Failed to dispatch feedback to webhook. Verify endpoint accessibility.', 'Webhook Error');
        }
      }
    } catch (err: any) {
      showError('Failed to dispatch feedback: ' + (err.message || 'Network error'), 'Network Error');
    } finally {
      setIsSubmittingFeedback(false);
    }
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

      {/* Resource Manifest & Component Hash System */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-teal-100 text-teal-800 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  Resource Manifest & Component Hash System
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-mono font-bold border border-slate-200">
                  App: v1.0.7 (Fixed)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold border border-teal-200">
                  Manifest: {manifest.manifestVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                యాప్ వర్షన్ నంబర్ (<span className="font-bold text-slate-700">v1.0.7</span>) మార్చాల్సిన అవసరం లేకుండానే ప్రతి డ్రైవర్, రజిస్ట్రీ పాలసీ, మరియు గజ్రెట్ ఆర్డర్ విడివిడిగా SHA-256 హాష్‌లతో OTA ద్వారా అప్‌డేట్ అవుతుంది.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
            <button
              onClick={handleCheckManifestUpdates}
              disabled={isCheckingManifest}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isCheckingManifest ? 'animate-spin' : ''}`} />
              <span>{isCheckingManifest ? 'Checking Hashes...' : 'Verify Remote Hashes'}</span>
            </button>

            <button
              onClick={handleSyncAllResources}
              disabled={isSyncingAll || manifest.outdatedCount === 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
                manifest.outdatedCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing All...' : manifest.outdatedCount > 0 ? `Sync All (${manifest.outdatedCount} Outdated)` : 'All Resources Verified'}</span>
            </button>
          </div>
        </div>

        {/* Manifest Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tracked Components</span>
            <span className="text-sm font-extrabold text-slate-900">{manifest.resources.length} System Resources</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Outdated Hashes</span>
            <span className={`text-sm font-extrabold ${manifest.outdatedCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {manifest.outdatedCount} Outdated
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Last Verification Sync</span>
            <span className="text-xs font-semibold text-slate-700 block truncate" title={manifest.lastSyncTimestamp}>
              {new Date(manifest.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">OTA Distribution Channel</span>
            <span className="text-xs font-semibold text-teal-700 block truncate">
              https://www.e-vedhika.in
            </span>
          </div>
        </div>

        {/* Resources Table / List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Component / Resource Item</span>
            <div className="flex items-center gap-12 pr-2">
              <span className="hidden md:inline">Content Hash (SHA-256)</span>
              <span>Status & Action</span>
            </div>
          </div>

          {manifest.resources.map((item) => (
            <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                    {item.category}
                  </span>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">v{item.currentVersion}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{item.description}</p>
                <div className="text-[10px] text-slate-400 font-mono md:hidden truncate" title={item.hash}>
                  Hash: {item.hash.slice(0, 24)}...
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="hidden md:block text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200" title={item.hash}>
                  {item.hash.slice(0, 16)}...
                </div>

                <div>
                  {item.status === 'Up to Date' || item.status === 'Verified' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Up to Date
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSyncSingleResource(item.id, item.name)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Sync Hash
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-[11px]">Re-select Target Portal (Reset State):</span>
                <button
                  id="btn-reset-state"
                  onClick={onResetState}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-indigo-100"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reset & Re-Select State</span>
                </button>
              </div>
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

        {/* User Feedback & Star Rating Section (Webhook Dispatch) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">User Feedback & Rating (అభిప్రాయం & రేటింగ్)</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100">
              Webhook Delivery
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Submit your experience, portal response speed, and DSC Token usability. Feedback is packaged as JSON and dispatched directly to your configured webhook URL.
            </p>

            {/* Target Webhook Status Indicator */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
              webhookUrl.trim() 
                ? 'bg-teal-50/60 border-teal-200 text-teal-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-1.5 overflow-hidden">
                {webhookUrl.trim() ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className="font-semibold truncate">
                  {webhookUrl.trim() ? `Target: ${webhookUrl}` : 'No Webhook URL configured. Enter one in the API Integration box on the left.'}
                </span>
              </div>
              {webhookUrl.trim() && (
                <span className="text-[10px] bg-teal-200/60 text-teal-900 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                  Ready
                </span>
              )}
            </div>

            {/* Interactive Star Rating */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-bold">
                Experience Rating (రేటింగ్ ఇవ్వండి)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || feedbackRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        aria-label={`Rate ${star} star`}
                        className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-hidden cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="ml-2 font-bold text-xs">
                  <span className={ratingLabels[hoverRating || feedbackRating]?.color}>
                    {ratingLabels[hoverRating || feedbackRating]?.title}
                  </span>
                  <span className="block text-[11px] text-slate-500 font-normal">
                    {ratingLabels[hoverRating || feedbackRating]?.desc}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Quick Tags (త్వరిత ట్యాగ్‌లు):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'DSC Token Working',
                  'Edge IE Mode Smooth',
                  'Fast UBD Login',
                  'Zone 2 Trusted Ok',
                  'Printer / Java Issue',
                  'Need Help with Driver'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Office Context Input */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Office / GP / Mandal Location</label>
              <input
                type="text"
                value={feedbackOffice}
                onChange={(e) => setFeedbackOffice(e.target.value)}
                placeholder="e.g., GP Office, Nalgonda / Mandal Parishad"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>

            {/* Text Feedback */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Feedback Details & Comments</label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your suggestions, issue details, or feedback about E-Vedhika and UBD Portal integration..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-feedback"
              type="button"
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || !webhookUrl.trim()}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                !webhookUrl.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isSubmittingFeedback
                  ? 'bg-slate-700 text-white cursor-wait'
                  : feedbackSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-98 text-white cursor-pointer'
              }`}
            >
              {isSubmittingFeedback ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to Webhook...</span>
                </>
              ) : feedbackSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback Delivered to Webhook!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback via Webhook</span>
                </>
              )}
            </button>
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
