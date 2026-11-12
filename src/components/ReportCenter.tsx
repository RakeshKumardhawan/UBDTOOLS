import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Filter, Search, Calendar, RefreshCw,
  CheckCircle2, AlertTriangle, ShieldCheck, Laptop, Clock, Database,
  ArrowDownToLine, Layers, Activity, FileSpreadsheet, Code, Copy, Sparkles
} from 'lucide-react';
import { useToast } from './Toast';
import { PCDetailsModal } from './PCDetailsModal';

interface ReportEvent {
  eventId: string;
  reportId: string;
  reportType: string;
  recordSource?: string;
  pcId: string;
  pcName: string;
  userName: string;
  officeLocation: string;
  district: string;
  state: string;
  appVersion: string;
  resourceBuild: string;
  status: string;
  appState: string;
  timestampIst: string;
  timestampUtc: string;
  details: string;
  remarks: string;
}

export const ReportCenter: React.FC = () => {
  const { showInfo, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mainSection, setMainSection] = useState<'reports' | 'updates' | 'website-code'>('reports');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reports, setReports] = useState<ReportEvent[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [phpSourceCode, setPhpSourceCode] = useState<string>('');
  const [selectedPcId, setSelectedPcId] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    totalRegisteredPcs: 0,
    onlinePcs: 0,
    offlinePcs: 0,
    runningApps: 0,
    closedApps: 0,
    latestVersion: 'v1.0.9',
    latestResourceBuild: '2026.11.12.R4',
    totalDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    successfulOtaUpdates: 0,
    failedOtaUpdates: 0,
    guardianEvents: 0,
    totalErrors: 0
  });

  const fetchWithLiveGateway = async (path: string, options?: RequestInit) => {
    const bases = [
      '',
      'https://ais-pre-a4f3swnj3idossrn6dk4cm-585783354343.asia-southeast1.run.app',
      'https://ais-dev-a4f3swnj3idossrn6dk4cm-585783354343.asia-southeast1.run.app'
    ];
    for (const base of bases) {
      try {
        const res = await fetch(`${base}${path}`, options);
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          return res;
        }
      } catch (e) {}
    }
    return null;
  };

  const fetchReportsData = async () => {
    setRefreshing(true);
    try {
      // 1. Trigger Historical Import & Hydration first so archive is never empty
      await fetchWithLiveGateway('/api/reports/import-historical', { method: 'POST' });

      // 2. Fetch Summary Statistics
      const sumRes = await fetchWithLiveGateway('/api/reports/summary?t=' + Date.now());
      if (sumRes) {
        const sumData = await sumRes.json();
        if (sumData.success && sumData.summary) {
          setSummary(sumData.summary);
        }
      }

      // 3. Fetch History Reports
      let historyUrl = `/api/reports/history?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(searchTerm)}&limit=150&t=${Date.now()}`;
      if (startDate) historyUrl += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) historyUrl += `&endDate=${encodeURIComponent(endDate)}`;

      const histRes = await fetchWithLiveGateway(historyUrl);
      if (histRes) {
        const histData = await histRes.json();
        if (histData.success && Array.isArray(histData.reports)) {
          setReports(histData.reports);
        }
      }

      // 4. Fetch Application Update History
      const updRes = await fetchWithLiveGateway('/api/reports/update-history?t=' + Date.now());
      if (updRes) {
        const updData = await updRes.json();
        if (updData.success && Array.isArray(updData.releases)) {
          setReleases(updData.releases);
        }
      }

      // 5. Fetch PHP Website Code
      const codeRes = await fetchWithLiveGateway('/api/reports/source-code/ubd_monitoring_php?t=' + Date.now());
      if (codeRes) {
        const codeData = await codeRes.json();
        if (codeData.success && codeData.code) {
          setPhpSourceCode(codeData.code);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch reports center data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [showTelegramImportModal, setShowTelegramImportModal] = useState<boolean>(false);
  const [telegramPasteText, setTelegramPasteText] = useState<string>('');
  const [importingTelegram, setImportingTelegram] = useState<boolean>(false);

  useEffect(() => {
    fetchReportsData();
  }, [activeCategory, startDate, endDate]);

  const handleImportTelegramReports = async () => {
    if (!telegramPasteText.trim()) {
      showError('దయచేసి టెలిగ్రామ్‌లో వచ్చిన PC రిపోర్ట్ మెసేజ్‌లను ఇక్కడ పేస్ట్ చేయండి.', 'Empty Input');
      return;
    }
    setImportingTelegram(true);
    try {
      const res = await fetchWithLiveGateway('/api/reports/import-telegram-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: telegramPasteText })
      });
      if (!res) throw new Error('Could not reach live reporting server');
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(data.message || `Imported ${data.importedCount} PC reports!`, 'Telegram Reports Imported');
        setTelegramPasteText('');
        setShowTelegramImportModal(false);
        await fetchReportsData();
      } else {
        showError(data.error || 'Import failed', 'Import Error');
      }
    } catch (err: any) {
      showError(err.message || 'Network error', 'Import Error');
    } finally {
      setImportingTelegram(false);
    }
  };

  const handleExportExcel = () => {
    window.location.href = '/api/reports/export-excel';
    showInfo('మాస్టర్ ఎక్సెల్ రిపోర్ట్ డౌన్‌లోడ్ అవుతోంది...', 'Excel Export Started');
  };

  const handleCopyWebsiteCode = () => {
    if (!phpSourceCode) return;
    navigator.clipboard.writeText(phpSourceCode);
    showSuccess('పూర్తి ubd_monitoring.php వెబ్‌సైట్ కోడ్ కాపీ చేయబడింది!', 'Website Code Copied');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono text-[10px] font-bold">
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/30">
              OFFICIAL REPORT CENTER
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
              v1.0.9 (RESOURCE BUILD 2026.11.12.R4)
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">
              HISTORICAL + LIVE REPORTS HYDRATED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>Centralized UBD Application Report Center &amp; Update History</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            All historical and live reports, 17-step deployment audits, OTA update changelogs, and deployable website source code for https://www.e-vedhika.in/admin/ubd_monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setShowTelegramImportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>📲 Import Telegram PC Reports (25 PCs)</span>
          </button>
          <button
            onClick={fetchReportsData}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Historical & Live'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Master Excel Export</span>
          </button>
        </div>
      </div>

      {/* Telegram Import Modal */}
      {showTelegramImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">📲 టెలిగ్రామ్‌లో వచ్చిన 25 PC రిపోర్టులను ఇంపోర్ట్ చేయండి</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  మీ టెలిగ్రామ్‌కు వచ్చిన 25 PC రిపోర్ట్ మెసేజ్‌లను ఒకేసారి కాపీ చేసి ఇక్కడ పేస్ట్ చేయండి (లేదా టెలిగ్రామ్‌లో ఆ మెసేజ్‌లను బాట్‌కు Forward చేసినా 6 సెకన్లలో ఆటోమేటిక్‌గా సింక్ అవుతాయి).
                </p>
              </div>
              <button
                onClick={() => setShowTelegramImportModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <textarea
              value={telegramPasteText}
              onChange={(e) => setTelegramPasteText(e.target.value)}
              rows={10}
              placeholder={"📋 E-Vedhika UBD Deployment Tool - Live PC Deployment Report\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🖥️ Machine & Office Identity\nReport ID: RPT-...\nMachine ID: EVD-PC-...\nPC Name: GP-COMPUTER\n... (మీ 25 టెలిగ్రామ్ మెసేజ్‌లను ఇక్కడ పేస్ట్ చేయండి)"}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTelegramImportModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTelegramReports}
                disabled={importingTelegram}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer disabled:opacity-50"
              >
                {importingTelegram ? 'Importing PCs...' : '✅ Import All Pasted PC Reports Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">TOTAL REGISTERED PCs</span>
          <span className="text-xl font-black text-cyan-400 mt-1 block">{summary.totalRegisteredPcs}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Fleet Verified</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">ONLINE PCs</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{summary.onlinePcs}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Offline: {summary.offlinePcs}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">RUNNING APPS</span>
          <span className="text-xl font-black text-cyan-300 mt-1 block">{summary.runningApps}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Closed: {summary.closedApps}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">DEPLOYMENT AUDITS</span>
          <span className="text-xl font-black text-indigo-400 mt-1 block">{summary.successfulDeployments}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Failed: {summary.failedDeployments}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">OTA UPDATES</span>
          <span className="text-xl font-black text-emerald-300 mt-1 block">{summary.successfulOtaUpdates}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Build: 2026.11.12.R4</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">TOTAL ARCHIVED REPORTS</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">{reports.length}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Historical + Live</span>
        </div>
      </div>

      {/* Main Section Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setMainSection('reports')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            mainSection === 'reports' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Complete Application Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setMainSection('updates')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            mainSection === 'updates' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>2. Complete Application Update History (v1.0.7 ➔ R3)</span>
        </button>

        <button
          onClick={() => setMainSection('website-code')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            mainSection === 'website-code' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>3. Website Admin Code (ubd_monitoring.php)</span>
        </button>
      </div>

      {/* SECTION 1: ALL REPORTS ARCHIVE */}
      {mainSection === 'reports' && (
        <div className="space-y-4">
          {/* Filters and Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                {[
                  { id: 'ALL', label: 'All Reports' },
                  { id: 'DEVICE_REGISTRATION', label: 'Device Registration' },
                  { id: 'LIVE_HEARTBEAT', label: '60s Heartbeats' },
                  { id: 'DEPLOYMENT_AUDIT', label: '17-Step Deployment' },
                  { id: 'GUARDIAN_EVENT', label: 'Guardian Auto-Repair' },
                  { id: 'OTA_UPDATE', label: 'OTA Updates' },
                  { id: 'ERROR_EXCEPTION', label: 'Errors & Exceptions' },
                  { id: 'DIAGNOSTIC', label: 'Diagnostics' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap text-[11px] font-bold ${
                      activeCategory === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchReportsData()}
                    placeholder="Search PC name, ID, office or details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={fetchReportsData}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition shrink-0"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Reports Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">EVENT ID</th>
                    <th className="p-3.5">SOURCE</th>
                    <th className="p-3.5">REPORT CATEGORY</th>
                    <th className="p-3.5">PC IDENTITY &amp; LOCATION</th>
                    <th className="p-3.5">VERSION &amp; BUILD</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">TIMESTAMP (IST)</th>
                    <th className="p-3.5">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        No report events found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r, idx) => (
                      <tr key={r.eventId || idx} className="hover:bg-slate-950/60 transition">
                        <td className="p-3.5 text-cyan-400 font-bold text-[11px]">{r.eventId || r.reportId}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            r.recordSource === 'HISTORICAL_IMPORT'
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          }`}>
                            {r.recordSource || 'LIVE_RECEIVED'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-950 text-slate-300 text-[10px] px-2.5 py-1 rounded border border-slate-800 font-bold">
                            {r.reportType}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{r.pcName}</div>
                          <div className="text-[10px] text-slate-400">{r.officeLocation} ({r.pcId})</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>{r.appVersion || 'v1.0.9'}</div>
                          <div className="text-[10px] text-emerald-400">{r.resourceBuild || '2026.11.12.R4'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold ${
                            r.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            r.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{r.timestampIst || r.timestampUtc}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedPcId(r.pcId)}
                            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1 rounded-lg text-[11px] transition font-bold"
                          >
                            View PC History
                          </button>
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

      {/* SECTION 2: COMPLETE APPLICATION UPDATE & RELEASE HISTORY */}
      {mainSection === 'updates' && (
        <div className="space-y-4">
          {releases.map((rel, idx) => (
            <div key={rel.releaseId || idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-lg font-black text-white font-mono">{rel.version}</span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold">
                      Resource Build: {rel.resourceBuild}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      {rel.signatureStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Release ID: {rel.releaseId} • Date: {rel.releaseDate} • Package Size: {rel.packageSize}
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  SHA-256: <span className="text-cyan-400">{String(rel.sha256).slice(0, 24)}...</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <h4 className="font-mono font-bold text-emerald-400 uppercase mb-2">✨ New Features &amp; Enhancements</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {(rel.newFeatures || []).map((nf: string, i: number) => <li key={i}>{nf}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <h4 className="font-mono font-bold text-amber-400 uppercase mb-2">🛠️ Bug Fixes, Security &amp; Performance</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {(rel.bugFixes || []).map((bf: string, i: number) => <li key={i}>{bf}</li>)}
                    {(rel.securityUpdates || []).map((su: string, i: number) => <li key={`s-${i}`}>{su}</li>)}
                    {(rel.performanceImprovements || []).map((pi: string, i: number) => <li key={`p-${i}`}>{pi}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: WEBSITE ADMIN CODE (ubd_monitoring.php) */}
      {mainSection === 'website-code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white font-mono">
                /admin/ubd_monitoring.php — Complete Website Source Code (v1.0.9 • 2026.11.12.R4)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deploy or copy this file directly to your website https://www.e-vedhika.in/admin/ubd_monitoring to display all historical &amp; live reports, 17-step audits, and update history.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyWebsiteCode}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Copy className="w-4 h-4" /> Copy Full Code
              </button>
              <a
                href="/api/reports/source-code/ubd_monitoring_php?download=1"
                download="ubd_monitoring.php"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Download className="w-4 h-4" /> Download ubd_monitoring.php
              </a>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[520px]">
            <code>{phpSourceCode || 'Loading ubd_monitoring.php source code...'}</code>
          </pre>
        </div>
      )}

      {/* Individual PC Details Modal */}
      {selectedPcId && (
        <PCDetailsModal
          pcId={selectedPcId}
          onClose={() => setSelectedPcId(null)}
        />
      )}

    </div>
  );
};
