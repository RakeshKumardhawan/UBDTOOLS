import React, { useState } from 'react';
import { 
  Wrench, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Database, 
  Key, 
  ShieldCheck, 
  Search,
  Zap,
  HelpCircle,
  Check
} from 'lucide-react';
import { ErrorCodeInfo } from '../types';

interface RepairViewProps {
  errorCodes: ErrorCodeInfo[];
  onExecuteRepair: (repairName: string) => void;
  repairingItem: string | null;
  lastRepairSuccess: string | null;
}

export const RepairView: React.FC<RepairViewProps> = ({
  errorCodes,
  onExecuteRepair,
  repairingItem,
  lastRepairSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredErrors = errorCodes.filter(err => {
    const matchesSearch = err.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.cause.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || err.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const repairModules = [
    {
      id: 'repair-edge-ie-mode',
      title: 'Microsoft Edge IE Mode Repair',
      category: 'Browser',
      icon: Globe,
      description: 'Re-applies InternetExplorerIntegrationLevel policies and forces reload of Enterprise Mode site list XML.',
    },
    {
      id: 'repair-registry-zone2',
      title: 'Registry Trusted Sites & Zone 2 Repair',
      category: 'Registry',
      icon: Database,
      description: 'Clears damaged zone mappings and writes fresh Zone 2 ActiveX permissions for target enterprise domains.',
    },
    {
      id: 'repair-dsc-drivers',
      title: 'DSC Token Drivers & SmartCard Service Repair',
      category: 'DSC Token',
      icon: Key,
      description: 'Restarts Windows SmartCard Service (SCardSvr) and re-initializes WD ProxKey & HYP2003 PKCS#11 drivers.',
    },
    {
      id: 'repair-nic-digisigner',
      title: 'NIC DigiSigner Service Bridge Repair',
      category: 'DigiSigner',
      icon: ShieldCheck,
      description: 'Restarts local NIC DigiSigner web service on port 8080/8443 and re-registers local SSL certificates.',
    },
    {
      id: 'repair-capicom-activex',
      title: 'ActiveX & CAPICOM DLL Registration Repair',
      category: 'System',
      icon: Wrench,
      description: 'Executes regsvr32 on capicom.dll, msxml6.dll, and enables DOM storage in Internet Explorer.',
    },
    {
      id: 'repair-windows-activation',
      title: 'Windows 7/10/11 Genuine License & KMS Activation',
      category: 'System OS',
      icon: Zap,
      description: 'Verifies Windows licensing status via WMI/slmgr and auto-activates Windows 7, 10, or 11 with Enterprise KMS key if unactivated.',
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">E-Vedhika UBD Repair Engine</h2>
            <p className="text-xs text-slate-500">
              One-click targeted fixes for corrupted Edge policies, missing ActiveX permissions, stopped DSC drivers, or DigiSigner bridge errors.
            </p>
          </div>
        </div>

        {lastRepairSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 mt-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully executed repair: {lastRepairSuccess}</span>
          </div>
        )}
      </div>

      {/* 1-Click Targeted Repair Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>One-Click Module Repair Actions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repairModules.map((mod) => {
            const Icon = mod.icon;
            const isRepairing = repairingItem === mod.id;
            return (
              <div
                key={mod.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {mod.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{mod.description}</p>
                </div>

                <button
                  id={`btn-repair-${mod.id}`}
                  onClick={() => onExecuteRepair(mod.id)}
                  disabled={isRepairing || repairingItem !== null}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isRepairing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Repairing...</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      <span>Execute 1-Click Repair</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Code Knowledgebase & Auto-Fix Lookup */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Enterprise Error Code Knowledgebase (UBD Series)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant error lookup with root cause analysis and automated resolution.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-error-codes"
                type="text"
                placeholder="Search error UBD-1001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Error Code List */}
        <div className="space-y-3">
          {filteredErrors.map((err) => (
            <div
              key={err.code}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-xs">
                    {err.code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{err.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                    {err.category}
                  </span>
                </div>

                <button
                  id={`btn-autofix-${err.code}`}
                  onClick={() => onExecuteRepair(`Auto-Fix for ${err.code}`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trigger Auto-Fix</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Cause & Impact
                  </span>
                  <p className="text-slate-600 leading-relaxed">{err.cause}</p>
                  <p className="text-slate-500 text-[11px] font-medium pt-1">Impact: {err.impact}</p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Manual Recovery Steps
                  </span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 leading-relaxed">
                    {err.manualSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
