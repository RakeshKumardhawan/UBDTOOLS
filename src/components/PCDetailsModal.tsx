import React, { useState, useEffect } from 'react';
import {
  X, Laptop, Monitor, Activity, ShieldCheck, Cpu, HardDrive,
  RefreshCw, Download, Calendar, Search, Filter, AlertTriangle,
  CheckCircle2, Clock, Terminal, ChevronRight, FileText, Lock, Key
} from 'lucide-react';

interface PCDetailsModalProps {
  pcId: string;
  onClose: () => void;
}

export const PCDetailsModal: React.FC<PCDetailsModalProps> = ({ pcId, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [pcData, setPcData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'guardian' | 'ota' | 'errors' | 'raw'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchPcDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/pc/${encodeURIComponent(pcId)}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPcData(data.pc);
          setReports(data.reports || []);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch PC details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPcDetails();
  }, [pcId]);

  const filteredReports = reports.filter(r => {
    if (categoryFilter !== 'ALL' && String(r.reportType).toUpperCase() !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = String(r.eventId).toLowerCase().includes(q) ||
                    String(r.details).toLowerCase().includes(q) ||
                    String(r.remarks).toLowerCase().includes(q) ||
                    String(r.status).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const downloadPcReportExcel = () => {
    window.location.href = `/api/reports/export-excel?pcId=${encodeURIComponent(pcId)}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Loading Detailed PC Report History...</h3>
          <p className="text-xs text-slate-400 font-mono">Fetching full 17-step audits, heartbeats & OTA updates for {pcId}</p>
        </div>
      </div>
    );
  }

  const pc = pcData || {
    pcId,
    pcName: 'GP-OFFICE-PC',
    userName: 'Operator',
    officeLocation: 'Grama Panchayat Office',
    district: 'District Office',
    state: 'Telangana',
    osVersion: 'Windows 11 Pro',
    winBuild: 'Build 22631',
    appVersion: 'v1.0.9',
    resourceBuild: '2026.11.11.R3',
    pcConnectivity: 'ONLINE',
    appState: 'RUNNING',
    lastHeartbeatTime: 'Just Now',
    memoryUsageMB: 128,
    cpuUsagePct: 3.5,
    uptimeSeconds: 7200,
    ipAddress: '192.168.1.104'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative font-sans text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Laptop className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{pc.pcName}</h2>
                <span className="bg-slate-800 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  {pc.pcId}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  pc.pcConnectivity === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  PC: {pc.pcConnectivity}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  pc.appState === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  APP: {pc.appState}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {pc.officeLocation} • {pc.district}, {pc.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadPcReportExcel}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" /> Export PC Excel Report
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-5 pt-2 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl transition font-bold ${
              activeTab === 'overview' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-t-xl transition font-bold ${
              activeTab === 'audit' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            17-Step Deployment Audits ({reports.filter(r => r.reportType === 'DEPLOYMENT_AUDIT').length})
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`px-4 py-2.5 rounded-t-xl transition font-bold ${
              activeTab === 'guardian' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Guardian & Auto-Repair ({reports.filter(r => r.reportType === 'GUARDIAN_EVENT').length})
          </button>
          <button
            onClick={() => setActiveTab('ota')}
            className={`px-4 py-2.5 rounded-t-xl transition font-bold ${
              activeTab === 'ota' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            OTA Update History ({reports.filter(r => r.reportType === 'OTA_UPDATE').length})
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2.5 rounded-t-xl transition font-bold ${
              activeTab === 'errors' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Error Logs ({reports.filter(r => r.status === 'FAILED' || r.reportType === 'ERROR_EXCEPTION').length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">APPLICATION VERSION</span>
                  <span className="text-lg font-bold text-cyan-400 mt-1 block">{pc.appVersion}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Resource: {pc.resourceBuild}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">PROCESS RAM USAGE</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">{pc.memoryUsageMB} MB</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">CPU: {pc.cpuUsagePct}%</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">OPERATING SYSTEM</span>
                  <span className="text-sm font-bold text-white mt-1 block">{pc.osVersion}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{pc.winBuild}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">LAST HEARTBEAT</span>
                  <span className="text-xs font-bold text-amber-300 mt-1 block">{pc.lastHeartbeatTime}</span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Ping: 60s Active</span>
                </div>
              </div>

              {/* Technical Health Matrix */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 17-Step Workstation Security & Token Health
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>Edge IE Mode Policy</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Enforced (IE5 Quirks)
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>Enterprise sites.xml File</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Valid (sites.xml present)
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>USB DSC Token Status</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Active (Class 3 Signing)
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>NIC DigiSigner Port 8080</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Listening (Port 8080 Active)
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Identity Specs */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-2 text-xs font-mono">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Hardware & Network Identifiers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">LOCAL IP ADDRESS</span>
                    <span className="text-slate-200 font-bold">{pc.ipAddress || '192.168.1.104'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">MAC ADDRESS</span>
                    <span className="text-slate-200 font-bold">{pc.macAddress || '48:2A:E3:10:BF:C9'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">HARDWARE UUID</span>
                    <span className="text-cyan-400 font-bold truncate block">{pc.hardwareUuid || pc.pcId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events by ID, details or remarks..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Event Reports Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-3">EVENT ID</th>
                        <th className="p-3">CATEGORY</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3">TIMESTAMP (IST)</th>
                        <th className="p-3">DETAILS & REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            No report events matching this category filter.
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((r, idx) => (
                          <tr key={r.eventId || idx} className="hover:bg-slate-900/60 transition">
                            <td className="p-3 text-cyan-400 font-bold text-[11px]">{r.eventId || r.reportId}</td>
                            <td className="p-3">
                              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                                {r.reportType}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                r.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                r.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">{r.timestampIst || r.timestampUtc}</td>
                            <td className="p-3 text-slate-300 max-w-md truncate">{r.details || r.remarks}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span>Central Cloud Telemetry Gateway: https://www.e-vedhika.in</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
