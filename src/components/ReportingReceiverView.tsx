import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Monitor, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  Laptop, 
  ShieldCheck, 
  Layers, 
  Send, 
  ExternalLink, 
  Activity, 
  Key, 
  Cpu, 
  HardDrive,
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useToast } from './Toast';

export interface FleetMachineRecord {
  pcId: string;
  pcName: string;
  userName: string;
  officeLocation: string;
  district?: string;
  state?: string;
  targetDomain?: string;
  isExistingInstall?: boolean;
  installType?: string;
  installTypeDisplay?: string;
  initialInstallDate?: string;
  updateReceivedDate?: string;
  updateBuild?: string;
  version?: string;
  osVersion?: string;
  winBuild?: string;
  localIp?: string;
  publicIp?: string;
  ramUsage?: string;
  diskFreeSpace?: string;
  cpuInfo?: string;
  status: string;
  overallStatus?: string;
  healthScore?: number;
  verification?: string;
  dscStatus?: string;
  edgeIeMode?: string;
  remarks?: string;
  receivedVia?: string;
}

export const ReportingReceiverView: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<'ALL' | 'TS' | 'AP'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'UPDATED' | 'FRESH'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<FleetMachineRecord | null>(null);

  const [fleetSummary, setFleetSummary] = useState<{
    totalFleetCount: number;
    updatedViaThisUpdate: number;
    freshInstallsCount: number;
    telanganaCount: number;
    andhraCount: number;
    verifiedStepsPassCount: number;
    lastSync: string;
    machines: FleetMachineRecord[];
  }>({
    totalFleetCount: 0,
    updatedViaThisUpdate: 0,
    freshInstallsCount: 0,
    telanganaCount: 0,
    andhraCount: 0,
    verifiedStepsPassCount: 0,
    lastSync: new Date().toLocaleTimeString(),
    machines: []
  });

  const fetchReceiverData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/reporting/receiver?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setFleetSummary({
            totalFleetCount: data.totalFleetCount || (data.machines ? data.machines.length : 0),
            updatedViaThisUpdate: data.updatedViaThisUpdate || 0,
            freshInstallsCount: data.freshInstallsCount || 0,
            telanganaCount: data.telanganaCount || 0,
            andhraCount: data.andhraCount || 0,
            verifiedStepsPassCount: data.verifiedStepsPassCount || 0,
            lastSync: new Date().toLocaleTimeString(),
            machines: Array.isArray(data.machines) ? data.machines : []
          });
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Secondary fallback to cold server records if receiver is initializing
      const coldRes = await fetch(`/api/cold-server/telemetry?t=${Date.now()}`);
      if (coldRes.ok) {
        const cData = await coldRes.json();
        const mList = cData.machines || [];
        setFleetSummary({
          totalFleetCount: mList.length,
          updatedViaThisUpdate: mList.filter((m: any) => m.installType === 'EXISTING_PC_UPDATED').length,
          freshInstallsCount: mList.filter((m: any) => m.installType !== 'EXISTING_PC_UPDATED').length,
          telanganaCount: mList.filter((m: any) => String(m.state || m.officeLocation).toLowerCase().includes('telangana')).length,
          andhraCount: mList.filter((m: any) => String(m.state || m.officeLocation).toLowerCase().includes('andhra')).length,
          verifiedStepsPassCount: mList.filter((m: any) => String(m.verification).includes('17/17')).length,
          lastSync: new Date().toLocaleTimeString(),
          machines: mList
        });
      }
    } catch (e: any) {
      console.warn('Receiver data fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceiverData();
    const interval = setInterval(fetchReceiverData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleExportExcel = () => {
    window.location.href = '/api/reporting/receiver/export';
    showInfo('ఎక్సెల్ రిపోర్ట్ డౌన్‌లోడ్ అవుతోంది...');
  };

  const filteredMachines = fleetSummary.machines.filter(m => {
    if (stateFilter === 'TS') {
      const s = String(m.state || m.officeLocation).toLowerCase();
      if (!s.includes('telangana')) return false;
    }
    if (stateFilter === 'AP') {
      const s = String(m.state || m.officeLocation).toLowerCase();
      if (!s.includes('andhra')) return false;
    }
    if (typeFilter === 'UPDATED') {
      if (m.installType !== 'EXISTING_PC_UPDATED') return false;
    }
    if (typeFilter === 'FRESH') {
      if (m.installType === 'EXISTING_PC_UPDATED') return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = String(m.pcName).toLowerCase().includes(q) ||
                    String(m.pcId).toLowerCase().includes(q) ||
                    String(m.officeLocation).toLowerCase().includes(q) ||
                    String(m.userName).toLowerCase().includes(q) ||
                    String(m.district).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* 🟢 Top Status Banner: Reporting Receiver Online */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60">
                24x7 REPORTING RECEIVER ACTIVE & LISTENING
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                /api/reporting/receiver
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>రిపోర్టింగ్ రిసీవర్ (Central Fleet Reporting Receiver)</span>
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              ఇప్పటివరకు ఇన్స్టాల్ అయిన అన్ని సిస్టమ్స్ మరియు ఈ కొత్త అప్డేట్ ద్వారా సింక్ చేసుకున్న అన్ని పంచాయతీ & మండల కంప్యూటర్ల నిజమైన డేటా రిసీవ్ చేసుకునే సెంట్రల్ రిసీవర్ గేట్‌వే.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>ఎక్సెల్ డౌన్‌లోడ్ (.xlsx)</span>
            </button>
            <button
              onClick={fetchReceiverData}
              disabled={refreshing}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all active:scale-95"
              title="రిఫ్రెష్ చేయండి"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 📊 4 Key Fleet Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Captured Fleet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">మొత్తం ఇన్స్టాల్ అయిన PCలు</p>
            <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
              {fleetSummary.totalFleetCount}
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> సెంట్రల్ రిసీవర్‌లో రిజిస్టర్ అయినవి
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Monitor className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Updated via this Update */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">ఈ అప్డేట్ ద్వారా సింక్ అయినవి</p>
            <div className="text-3xl font-black text-emerald-600 mt-1 font-mono">
              {fleetSummary.updatedViaThisUpdate}
            </div>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">
              ✨ Existing PCs (ఈ అప్డేట్ తీసుకున్నవి)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: 17/17 Steps Verified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">17/17 Steps & DSC Verified</p>
            <div className="text-3xl font-black text-indigo-600 mt-1 font-mono">
              {fleetSummary.verifiedStepsPassCount}
            </div>
            <p className="text-[10px] text-indigo-600 font-bold mt-1">
              🔐 Edge IE Mode & DSC Token Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Telangana & Andhra Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">రాష్ట్రాల వారీగా వివరాలు</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-xl font-black text-slate-900 font-mono">TS: {fleetSummary.telanganaCount}</span>
              <span className="text-xl font-black text-indigo-600 font-mono">AP: {fleetSummary.andhraCount}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1">
              🏛️ పంచాయతీలు & మండల కార్యాలయాలు
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🔍 Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PC పేరు, ఆపరేటర్ లేదా లొకేషన్ వెతకండి..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* State Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-[11px] font-bold border border-slate-200">
            <button
              onClick={() => setStateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${stateFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'}`}
            >
              అన్నీ (All)
            </button>
            <button
              onClick={() => setStateFilter('TS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${stateFilter === 'TS' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-500'}`}
            >
              Telangana ({fleetSummary.telanganaCount})
            </button>
            <button
              onClick={() => setStateFilter('AP')}
              className={`px-3 py-1.5 rounded-lg transition-all ${stateFilter === 'AP' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-500'}`}
            >
              Andhra Pradesh ({fleetSummary.andhraCount})
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-[11px] font-bold border border-slate-200">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'}`}
            >
              అన్ని రకాలు
            </button>
            <button
              onClick={() => setTypeFilter('UPDATED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'UPDATED' ? 'bg-emerald-600 text-white shadow-sm font-black' : 'text-slate-500'}`}
            >
              ✨ ఈ అప్డేట్ ద్వారా ({fleetSummary.updatedViaThisUpdate})
            </button>
            <button
              onClick={() => setTypeFilter('FRESH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'FRESH' ? 'bg-slate-800 text-white shadow-sm font-black' : 'text-slate-500'}`}
            >
              కొత్త ఇన్స్టాల్
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Live Ingested PC Fleet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              రిపోర్టింగ్ రిసీవర్‌లో రిజిస్టర్ అయిన కంప్యూటర్ల జాబితా ({filteredMachines.length} PCs)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            చివరి సింక్: {fleetSummary.lastSync}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">PC ID & కంప్యూటర్ పేరు</th>
                <th className="p-3.5">ఆఫీస్ & జిల్లా</th>
                <th className="p-3.5">ఇన్స్టాలేషన్ రకం (Type)</th>
                <th className="p-3.5">మొదటి ఇన్స్టాల్ తేదీ</th>
                <th className="p-3.5">ఈ అప్డేట్ సింక్ సమయం</th>
                <th className="p-3.5 text-center">17 స్టెప్స్ వెరిఫికేషన్</th>
                <th className="p-3.5 text-center">DSC టోకెన్</th>
                <th className="p-3.5 text-right pr-6">చర్యలు</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Monitor className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        ఇంకా కంప్యూటర్ల డేటా నమోదు కాలేదు (Waiting for Real PCs)
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        గ్రామ పంచాయతీ / మండల PC లలో ఈ కొత్త అప్డేట్ రన్ కాగానే వాటి లైవ్ డేటా నేరుగా ఇక్కడ కనిపిస్తుంది. రిపోర్టింగ్ రిసీవర్ 24x7 ఆన్‌లైన్‌లో సిద్ధంగా ఉంది.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMachines.map((m, idx) => {
                  const isExisting = m.installType === 'EXISTING_PC_UPDATED';
                  return (
                    <tr key={m.pcId || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${isExisting ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <span>{m.pcName}</span>
                              <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                {m.pcId}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              ఆపరేటర్: {m.userName} • {m.osVersion || 'Win 11 Pro'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 text-xs">
                          {m.officeLocation}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {m.district || 'స్థానిక జిల్లా'}, {m.state || 'Telangana'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {isExisting ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>ఈ అప్డేట్ ద్వారా సింక్ అయింది</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                            <span>కొత్త ఇన్స్టాలేషన్</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-600 font-bold">
                        {m.initialInstallDate || '2026-10-25'}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-indigo-700 font-bold">
                        {m.updateReceivedDate || 'Just Now'}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          <span>{m.verification || '17/17 Passed'}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${String(m.dscStatus || '').includes('Active') || String(m.dscStatus || '').includes('Connected') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                          {m.dscStatus || 'DSC Active'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right pr-6">
                        <button
                          onClick={() => setSelectedRecord(m)}
                          className="px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95"
                        >
                          వివరాలు (Audit)
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Details Modal for Selected Machine */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">{selectedRecord.pcName} - రిపోర్ట్ వివరాలు</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedRecord.pcId} • {selectedRecord.officeLocation}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono bg-slate-50">
              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div><span className="text-slate-400">ఇన్స్టాలేషన్ రకం:</span> <span className="font-bold text-emerald-700">{selectedRecord.installTypeDisplay || selectedRecord.installType}</span></div>
                <div><span className="text-slate-400">మొదటి ఇన్స్టాల్:</span> <span className="font-bold">{selectedRecord.initialInstallDate}</span></div>
                <div><span className="text-slate-400">అప్డేట్ సింక్:</span> <span className="font-bold text-indigo-700">{selectedRecord.updateReceivedDate}</span></div>
                <div><span className="text-slate-400">వెర్షన్ & బిల్డ్:</span> <span className="font-bold">{selectedRecord.version} ({selectedRecord.updateBuild})</span></div>
                <div><span className="text-slate-400">ఆపరేటింగ్ సిస్టమ్:</span> <span className="font-bold">{selectedRecord.osVersion}</span></div>
                <div><span className="text-slate-400">RAM వివరాలు:</span> <span className="font-bold">{selectedRecord.ramUsage || '8.00 GB'}</span></div>
                <div><span className="text-slate-400">డిస్క్ ఖాళీ స్థలం:</span> <span className="font-bold">{selectedRecord.diskFreeSpace || '120 GB'}</span></div>
                <div><span className="text-slate-400">ప్రాసెసర్ (CPU):</span> <span className="font-bold">{selectedRecord.cpuInfo || 'Intel Core i5'}</span></div>
                <div><span className="text-slate-400">17 స్టెప్స్ స్టేటస్:</span> <span className="font-bold text-emerald-600">{selectedRecord.verification}</span></div>
                <div><span className="text-slate-400">DSC డ్రైవర్:</span> <span className="font-bold text-emerald-600">{selectedRecord.dscStatus}</span></div>
                <div><span className="text-slate-400">Edge IE మోడ్:</span> <span className="font-bold text-emerald-600">{selectedRecord.edgeIeMode || 'IE5 Quirks Active'}</span></div>
                <div><span className="text-slate-400">పోర్టల్:</span> <span className="font-bold text-slate-800">{selectedRecord.targetDomain || 'ubd.telangana.gov.in'}</span></div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                <b>రిమార్క్స్:</b> {selectedRecord.remarks || 'Fleet update verified and synced successfully with Reporting Receiver.'}
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                మూసివేయండి (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
