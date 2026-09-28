import React, { useEffect, useRef } from 'react';
import { EnvironmentStatus, LogEntry } from '../types';

interface SystemPanelProps {
  envStatus: EnvironmentStatus;
  logs: LogEntry[];
}

export const SystemPanel: React.FC<SystemPanelProps> = ({ envStatus, logs }) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <aside className="border-l border-ink-faint p-5 sm:p-6 lg:p-7 bg-[rgba(0,240,255,0.02)] flex flex-col gap-5 sm:gap-6 h-full overflow-y-auto custom-scrollbar">
      <div>
        <p className="label mb-3 text-[0.6rem] sm:text-[0.65rem]">System Health Monitor</p>
        <div className="space-y-2">
          <div className="status-card p-3 sm:p-4">
            <div className="flex justify-between items-center text-[0.7rem] sm:text-[0.75rem] font-mono">
              <span className="truncate pr-2">REGISTRY SHIM</span>
              <span className={`font-bold shrink-0 ${envStatus.registryConfigured ? "text-accent" : "text-amber-400"}`}>
                {envStatus.registryConfigured ? "SECURE" : "PENDING"}
              </span>
            </div>
          </div>
          <div className="status-card p-3 sm:p-4">
            <div className="flex justify-between items-center text-[0.7rem] sm:text-[0.75rem] font-mono">
              <span className="truncate pr-2">IE MODE POLICY</span>
              <span className={`font-bold shrink-0 ${envStatus.edgeIEModeConfigured ? "text-accent" : "text-amber-400"}`}>
                {envStatus.edgeIEModeConfigured ? "ENFORCED" : "PENDING"}
              </span>
            </div>
          </div>
          <div className="status-card p-3 sm:p-4">
            <div className="flex justify-between items-center text-[0.7rem] sm:text-[0.75rem] font-mono">
              <span className="truncate pr-2">DSC TOKEN</span>
              <span className={`font-bold shrink-0 ${envStatus.proxKeyInstalled ? "text-accent" : "text-amber-400"}`}>
                {envStatus.proxKeyInstalled ? "ACTIVE" : "MISSING"}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-[220px]">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <p className="label text-[0.6rem] sm:text-[0.65rem]">Live Telemetry Console</p>
          <span className="label text-[0.55rem] text-accent/80">{logs.length} logs</span>
        </div>
        <div className="console flex-1 custom-scrollbar overflow-y-auto min-h-[160px] text-[0.65rem] sm:text-[0.7rem]" ref={consoleRef}>
          {logs.length === 0 && <div className="opacity-50">System initialized. Awaiting commands...</div>}
          {logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed">
              <span className="opacity-70">[{log.timestamp.split(' ')[1] || log.timestamp}]</span> 
              <span className="ml-1 opacity-90 text-slate-300">[{log.module}]</span> 
              <span className={`ml-2 break-words ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-accent'}`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
