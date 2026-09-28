import React from 'react';
import { 
  HardDrive, 
  CheckCircle2, 
  XCircle, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { DriverItem } from '../types';

interface DriversViewProps {
  drivers: DriverItem[];
  onInstallDriver: (driverId: string) => void;
  installingId: string | null;
}

export const DriversView: React.FC<DriversViewProps> = ({
  drivers,
  onInstallDriver,
  installingId,
}) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">DSC Hardware & Driver Manager</h2>
            <p className="text-xs text-slate-500">
              Verify and install WatchData ProxKey, Hypersecu HYP2003, ePass2003, and NIC DigiSigner PKCS#11 drivers.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Enterprise Certified Drivers</span>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.map((drv) => {
          const isInstalling = installingId === drv.id;
          return (
            <div
              key={drv.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Publisher: {drv.publisher}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{drv.name}</h3>
                    <span className="text-xs font-mono text-slate-500">Version: {drv.version}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shrink-0 ${
                      drv.status === 'Installed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {drv.status === 'Installed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {drv.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{drv.description}</p>

                {/* Supported USB Tokens */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Supported Tokens & USB Hardware:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {drv.supportedTokens.map((tok, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id={`btn-driver-install-${drv.id}`}
                  onClick={() => onInstallDriver(drv.id)}
                  disabled={isInstalling || drv.status === 'Installed'}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    drv.status === 'Installed'
                      ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-purple-950/20'
                  }`}
                >
                  {isInstalling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Installing Driver Package...</span>
                    </>
                  ) : drv.status === 'Installed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Driver Installed & Active</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Install / Repair Driver</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
