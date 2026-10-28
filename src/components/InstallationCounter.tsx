import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck } from 'lucide-react';

export const InstallationCounter: React.FC = () => {
  const [count, setCount] = useState<number>(() => {
    // Initial load from localStorage
    const saved = localStorage.getItem('evedhika_installation_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastSync, setLastSync] = useState<string>(() => {
    return localStorage.getItem('evedhika_counter_last_sync') || 'Never';
  });

  const updateCounter = async () => {
    try {
      const res = await fetch('/api/consolidated-health');
      if (res.ok) {
        const data = await res.json();
        const machines = data.machines || [];
        
        // Count unique machine IDs
        const uniqueIds = new Set(machines.map((m: any) => m.pcId || m.machineIdentifier).filter(Boolean));
        const newCount = uniqueIds.size;
        const now = new Date().toLocaleTimeString();

        // Save to localStorage
        localStorage.setItem('evedhika_installation_count', newCount.toString());
        localStorage.setItem('evedhika_unique_hwids', JSON.stringify(Array.from(uniqueIds)));
        localStorage.setItem('evedhika_counter_last_sync', now);

        setCount(newCount);
        setLastSync(now);
      }
    } catch (err) {
      console.warn('[InstallationCounter] Sync failed:', err);
    }
  };

  useEffect(() => {
    updateCounter();
    // Refresh every 60 seconds
    const interval = setInterval(updateCounter, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="pill bg-indigo-500/10 border-indigo-500/30 text-indigo-400 flex items-center gap-2 px-3 py-1.5 transition-all hover:bg-indigo-500/20"
      title={`Total unique PCs verified. Last Sync: ${lastSync}`}
    >
      <div className="relative">
        <Users size={14} className="text-indigo-400" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">Installs</span>
        <span className="text-[0.8rem] font-black font-mono text-indigo-300">{count.toLocaleString()}</span>
      </div>
    </div>
  );
};
