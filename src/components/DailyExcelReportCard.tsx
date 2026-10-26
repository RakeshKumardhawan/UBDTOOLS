import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Mail, 
  Clock, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Check, 
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

interface EmailConfig {
  recipientEmail: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  hasSmtpPass: boolean;
  scheduleTimeIST: string;
  autoSendEnabled: boolean;
  lastSentTimestamp?: string;
  lastSentResult?: string;
}

export function DailyExcelReportCard() {
  const [config, setConfig] = useState<EmailConfig>({
    recipientEmail: 'Rakeshkumardhawan123@gmail.com',
    senderEmail: 'evedhika.reports@gmail.com',
    smtpHost: '',
    smtpPort: 587,
    hasSmtpPass: false,
    scheduleTimeIST: '19:00',
    autoSendEnabled: true,
    lastSentTimestamp: '',
    lastSentResult: ''
  });

  const [inputEmail, setInputEmail] = useState('Rakeshkumardhawan123@gmail.com');
  const [autoSend, setAutoSend] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingNow, setIsSendingNow] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const resp = await fetch('/api/reports/email-config');
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.emailConfig) {
          setConfig(data.emailConfig);
          setInputEmail(data.emailConfig.recipientEmail || 'Rakeshkumardhawan123@gmail.com');
          setAutoSend(data.emailConfig.autoSendEnabled !== false);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch email report config:', e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/reports/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: inputEmail.trim(),
          autoSendEnabled: autoSend
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ type: 'success', text: '✅ Email & Scheduled Report configuration saved successfully!' });
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

  const handleTriggerEmailNow = async () => {
    setIsSendingNow(true);
    setStatusMsg(null);
    try {
      const resp = await fetch('/api/reports/send-daily-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatusMsg({ 
          type: 'success', 
          text: `🚀 ${data.message || 'Excel status report successfully generated & emailed!'}` 
        });
        fetchConfig();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to trigger report email.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Network error triggering email.' });
    } finally {
      setIsSendingNow(false);
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/reports/download-excel';
      link.setAttribute('download', 'EVedhika_UBD_Daily_PC_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Failed to initiate Excel download.' });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div id="daily-excel-reports-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              📊 Daily 7:00 PM Consolidated Excel Report & Email Alert
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Daily 19:00 IST (7:00 PM)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            ఒకవేళ వందలాది పంచాయతీ PC ల నుండి ఒకేసారి వచ్చే మెసేజ్‌లను సర్వర్ హ్యాండిల్ చేయలేకపోయినా లేదా సమగ్ర ఆడిట్ కోసం — ప్రతి రోజు సాయంత్రం <b>7:00 PM IST</b> కి మొత్తం కంప్యూటర్ల స్టేటస్ తో కూడిన Excel Workbook (.xlsx) సిద్ధం చేయబడి నేరుగా <b>{config.recipientEmail}</b> కి ఈమెయిల్ చేయబడుతుంది.
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

      {/* Highlights & Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>ఆటోమేటెడ్ 7:00 PM షెడ్యూలర్</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-normal">
            ప్రతి రోజు సాయంత్రం 7:00 IST కి సర్వర్ ఆటోమేటిక్ గా అన్ని PC ల రికార్డులను Excel ఫైల్ గా కన్వర్ట్ చేసి ఈమెయిల్ చేస్తుంది.
          </p>
          <div className="pt-1 text-[10px] font-semibold text-emerald-700">
            స్టేటస్: <span className="text-emerald-900 font-bold">🟢 Active (Daily Cron)</span>
          </div>
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200/80 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>పూర్తి DSC రన్ పూర్తయ్యాకే టెలిగ్రామ్</span>
          </div>
          <p className="text-[11px] text-sky-800 leading-normal">
            ఏ కంప్యూటర్‌లోనైనా మొత్తం 17 స్టెప్స్, USB DSC టోకెన్ డ్రైవర్లు, NIC DigiSigner మరియు SHA256 ప్యాచ్ పూర్తి అయ్యాక మాత్రమే టెలిగ్రామ్ రిపోర్ట్ వెళ్తుంది.
          </p>
          <div className="pt-1 text-[10px] font-semibold text-sky-700">
            నిబంధన: <span className="text-sky-900 font-bold">🔒 DSC Completion Gate Active</span>
          </div>
        </div>

        <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>1 PC = 1 Report (నో స్పామ్)</span>
          </div>
          <p className="text-[11px] text-purple-800 leading-normal">
            ప్రతి PC కేవలం ఒకే ఒక్క కన్సాలిడేటెడ్ రిపోర్ట్ పంపేలా లోకల్ రిజిస్ట్రీ మార్కర్ & సర్వర్ డి-డూప్లికేషన్ లాజిక్ అమలు చేయబడింది.
          </p>
          <div className="pt-1 text-[10px] font-semibold text-purple-700">
            ఫీల్టర్: <span className="text-purple-900 font-bold">🛡️ Zero Duplicate Guarantee</span>
          </div>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Form: Email Settings & Action Buttons (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>అడ్మినిస్ట్రేటర్ ఈమెయిల్ అడ్రస్ (Target Admin Email)</span>
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Rakeshkumardhawan123@gmail.com"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
            <p className="text-[11px] text-slate-500">
              సాయంత్రం 7 గంటలకు ఎక్సెల్ ఫైల్ ఈ అడ్రస్‌కు ఈమెయిల్ అటాచ్‌మెంట్‌గా చేరుతుంది.
            </p>
          </div>

          {/* Auto-Send Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>ప్రతి రోజు సాయంత్రం 7:00 PM ఆటోమేటిక్ ఈమెయిల్ (Auto-Send at 19:00 IST)</span>
              </span>
              <p className="text-[11px] text-slate-500">
                షెడ్యూల్ ప్రకారం రోజుకు ఒకసారి కన్సాలిడేటెడ్ రిపోర్ట్ ఆటో-డిస్పాచ్ అవుతుంది.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Email Config'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Generating...' : '📥 Download Excel (.xlsx)'}</span>
            </button>

            <button
              onClick={handleTriggerEmailNow}
              disabled={isSendingNow}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSendingNow ? 'animate-spin' : ''}`} />
              <span>{isSendingNow ? 'Sending Report...' : '✉️ Send 7 PM Report to Email Now'}</span>
            </button>
          </div>

          {config.lastSentTimestamp && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              🕒 <b>చివరి రిపోర్ట్ పంపిన సమయం:</b> {config.lastSentTimestamp} • {config.lastSentResult}
            </div>
          )}
        </div>

        {/* Right Info: Excel Structure Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>ఈ ఎక్సెల్ (.xlsx) వర్క్‌బుక్ లో ఏమి ఉంటాయి?</span>
          </div>

          <div className="space-y-3 text-[11px] text-slate-700 leading-relaxed">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Sheet 1: Executive Summary</span>
              </div>
              <p className="text-slate-600 text-[10.5px]">
                మొత్తం PC ల సంఖ్య, 17/17 స్టెప్స్ పాస్ అయిన కంప్యూటర్లు, యాక్టివ్ USB DSC టోకెన్లు, డిప్లాయ్‌మెంట్ సక్సెస్ రేటు, సెంట్రల్ లైవ్ డ్యాష్‌బోర్డ్ లింక్.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="font-bold text-sky-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span>Sheet 2: All PCs Live Audit Matrix</span>
              </div>
              <p className="text-slate-600 text-[10.5px]">
                ప్రతి పంచాయతీ PC కి సంబంధించిన Sl No, Machine ID, గ్రామ పంచాయతీ ఆఫీస్, కంప్యూటర్ పేరు, అడ్మిన్ ప్రివిలేజెస్, IP Address, RAM, ఉచిత డిస్క్ స్థలం, CPU, స్టేటస్, DSC టోకెన్ రకం, NIC DigiSigner, Edge IE5 మోడ్ సెట్టింగ్స్.
              </p>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-600 border-t border-slate-200/80 flex items-center justify-between">
            <span>ఫార్మాట్: <b>Excel OpenXML (.xlsx)</b></span>
            <span className="text-emerald-700 font-bold">100% Offline Compatible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
