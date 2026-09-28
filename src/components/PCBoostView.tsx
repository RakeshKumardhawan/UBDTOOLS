import React, { useState } from 'react';
import { Zap, HardDrive, Wifi, Cpu, Trash2, RefreshCw, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const historicalData = [
  { day: 'Mon', reclaimed: 0.2 },
  { day: 'Tue', reclaimed: 1.5 },
  { day: 'Wed', reclaimed: 0.8 },
  { day: 'Thu', reclaimed: 2.1 },
  { day: 'Fri', reclaimed: 0.5 },
  { day: 'Sat', reclaimed: 3.2 },
  { day: 'Sun', reclaimed: 1.1 },
];

interface PCBoostViewProps {
  embedded?: boolean;
}

export function PCBoostView({ embedded = false }: PCBoostViewProps) {
  const [cleaningTemp, setCleaningTemp] = useState(false);
  const [cleaningPrefetch, setCleaningPrefetch] = useState(false);
  const [flushingDns, setFlushingDns] = useState(false);
  const [hasCleanedTemp, setHasCleanedTemp] = useState(false);
  const [hasCleanedPrefetch, setHasCleanedPrefetch] = useState(false);

  const handleCleanTemp = () => {
    setCleaningTemp(true);
    setTimeout(() => {
      setCleaningTemp(false);
      setHasCleanedTemp(true);
    }, 1500);
  };

  const handleCleanPrefetch = () => {
    setCleaningPrefetch(true);
    setTimeout(() => {
      setCleaningPrefetch(false);
      setHasCleanedPrefetch(true);
    }, 1500);
  };

  const handleFlushDns = () => {
    setFlushingDns(true);
    setTimeout(() => {
      setFlushingDns(false);
    }, 1500);
  };

  return (
    <div className={embedded ? "space-y-6 w-full" : "p-6 max-w-7xl mx-auto space-y-6"}>
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/30">
              ADVANCED PC BOOST & CLEANER
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/30">
              WIN 7 / 8 / 10 / 11 COMPATIBLE
            </span>
            {embedded && (
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-cyan-500/30">
                INTEGRATED C# MODULE (PCBoostEngine.cs)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            <span>PC Boost & System Optimization</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Native C# module to clean temporary files (%temp%), prefetch cache, and reset network stacks for peak performance.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Disk Space Analytics
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-1">Before Cleaning</p>
              <p className="text-2xl font-black text-rose-400">14.2 GB</p>
              <p className="text-[10px] text-slate-400 mt-1">System Junk Detected</p>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-600 shrink-0" />
            <div className="flex-1 bg-slate-900 p-4 rounded-xl border border-emerald-900/50 text-center relative overflow-hidden">
              {(hasCleanedTemp || hasCleanedPrefetch) && (
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
              )}
              <p className="text-xs text-slate-500 font-semibold mb-1">After Cleaning</p>
              <p className="text-2xl font-black text-emerald-400">
                {hasCleanedTemp && hasCleanedPrefetch ? '0 GB' : (hasCleanedTemp ? '0.2 GB' : (hasCleanedPrefetch ? '13.0 GB' : '14.2 GB'))}
              </p>
              <p className="text-[10px] text-emerald-500/70 mt-1">
                {hasCleanedTemp || hasCleanedPrefetch ? 'Space Reclaimed!' : 'Pending Cleanup'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 h-48">
           <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Historical Space Reclaimed (GB)</h3>
           <div className="w-full h-full -ml-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={historicalData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorReclaimed" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={30} />
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                   itemStyle={{ color: '#f59e0b' }}
                 />
                 <Area type="monotone" dataKey="reclaimed" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorReclaimed)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temp Files Cleanup */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl w-fit">
              <Trash2 className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Temporary Files Cleanup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scans and deletes junk files from user and system %temp% directories safely without affecting active applications.
            </p>
          </div>
          <button
            onClick={handleCleanTemp}
            disabled={cleaningTemp || hasCleanedTemp}
            className={`w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              hasCleanedTemp 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 disabled:opacity-50'
            }`}
          >
            {hasCleanedTemp ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>Optimized</span></>
            ) : (
              <><RefreshCw className={`w-4 h-4 ${cleaningTemp ? 'animate-spin' : ''}`} /> <span>{cleaningTemp ? 'Cleaning Temp...' : 'Clean Temp Files'}</span></>
            )}
          </button>
        </div>

        {/* Prefetch Cleanup */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl w-fit">
              <HardDrive className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Prefetch Cache Cleanup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clears outdated prefetch layout traces to optimize application boot times and free up valuable storage blocks.
            </p>
          </div>
          <button
            onClick={handleCleanPrefetch}
            disabled={cleaningPrefetch || hasCleanedPrefetch}
            className={`w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              hasCleanedPrefetch 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 disabled:opacity-50'
            }`}
          >
            {hasCleanedPrefetch ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>Optimized</span></>
            ) : (
              <><RefreshCw className={`w-4 h-4 ${cleaningPrefetch ? 'animate-spin' : ''}`} /> <span>{cleaningPrefetch ? 'Optimizing Prefetch...' : 'Clean Prefetch'}</span></>
            )}
          </button>
        </div>

        {/* DNS Flushing & Network Reset */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
              <Wifi className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">DNS Flush & Network Reset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes `ipconfig /flushdns` and `netsh winsock reset` to instantly fix portal connectivity and gateway routing issues.
            </p>
          </div>
          <button
            onClick={handleFlushDns}
            disabled={flushingDns}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <RefreshCw className={`w-4 h-4 ${flushingDns ? 'animate-spin' : ''}`} />
            <span>{flushingDns ? 'Flushing DNS...' : 'Flush DNS & Reset Stack'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
