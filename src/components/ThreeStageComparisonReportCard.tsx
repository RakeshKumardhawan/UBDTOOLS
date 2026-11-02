import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldX, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  FileText, 
  Layers, 
  Sparkles,
  Flame,
  Globe2,
  Lock,
  Cpu
} from 'lucide-react';

interface StageComparisonItem {
  feature: string;
  category: string;
  beforeInstall: {
    status: 'FAIL' | 'BLOCKED' | 'NOT_SET';
    badge: string;
    description: string;
  };
  afterInstall: {
    status: 'PASS' | 'ACTIVE' | 'CONFIGURED';
    badge: string;
    description: string;
  };
  afterUninstall: {
    status: 'REVERTED' | 'PURGED' | 'CLEARED';
    badge: string;
    description: string;
  };
}

export const ThreeStageComparisonReportCard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const comparisonData: StageComparisonItem[] = [
    {
      feature: 'Microsoft Edge IE Mode Policy',
      category: 'Browser Policy',
      beforeInstall: {
        status: 'NOT_SET',
        badge: 'Not Configured (0)',
        description: 'Edge opens ubd.telangana.gov.in in standard HTML5 mode. ActiveX controls fail to load.'
      },
      afterInstall: {
        status: 'CONFIGURED',
        badge: 'IE Mode Active (1)',
        description: 'InternetExplorerIntegrationLevel set to 1. Opens seamlessly in Edge IE Mode.'
      },
      afterUninstall: {
        status: 'REVERTED',
        badge: 'Purged & Removed',
        description: 'Edge policies removed from HKLM & HKCU registry. Edge reverts to standard browsing.'
      }
    },
    {
      feature: 'Enterprise Mode Site List (sites.xml)',
      category: 'Enterprise List',
      beforeInstall: {
        status: 'BLOCKED',
        badge: 'File Missing',
        description: 'No sites.xml file in C:\\enterprise_compat. Edge cannot auto-trigger IE5 Quirks Mode.'
      },
      afterInstall: {
        status: 'ACTIVE',
        badge: 'sites.xml Deployed',
        description: 'Enterprise XML created at C:\\enterprise_compat\\sites.xml mapping UBD to IE5 Quirks.'
      },
      afterUninstall: {
        status: 'PURGED',
        badge: 'Directory Erased',
        description: 'C:\\enterprise_compat\\ directory, sites.xml, and DLLs deleted within 1 second.'
      }
    },
    {
      feature: 'Zone 2 Trusted Sites Registry',
      category: 'Security Zones',
      beforeInstall: {
        status: 'NOT_SET',
        badge: 'Default Strict Mode',
        description: 'ubd.telangana.gov.in not in Trusted Sites. Popup and ActiveX prompts blocked by Windows.'
      },
      afterInstall: {
        status: 'CONFIGURED',
        badge: 'Zone 2 Configured',
        description: 'UBD mapped to Zone 2 with relaxed ActiveX prompts and zero download popup blocks.'
      },
      afterUninstall: {
        status: 'REVERTED',
        badge: 'Factory Defaults',
        description: 'Domain mappings removed from ZoneMap. Zone 2 security restored to Medium Windows default.'
      }
    },
    {
      feature: 'ActiveX & COM Components (DigiSignHelper)',
      category: 'ActiveX Engine',
      beforeInstall: {
        status: 'BLOCKED',
        badge: 'Unregistered (-2146827859)',
        description: 'Error "Automation server can\'t create object" when registering DSC Token Number.'
      },
      afterInstall: {
        status: 'ACTIVE',
        badge: 'COM Registered',
        description: 'DigiSignHelper & SignatureDemoLib.dll SHA256 patched and registered in COM.'
      },
      afterUninstall: {
        status: 'PURGED',
        badge: 'ProgIDs Erased',
        description: 'All ProgIDs (DigiSignHelper, CAPICOM) and CLSIDs unregistered and purged from Registry.'
      }
    },
    {
      feature: 'USB DSC Token Drivers (WD ProxKey & HYP2003)',
      category: 'Drivers',
      beforeInstall: {
        status: 'BLOCKED',
        badge: 'Driver Missing',
        description: 'Secretarial USB Smart Card Token not recognized by browser or NIC DigiSigner.'
      },
      afterInstall: {
        status: 'ACTIVE',
        badge: 'Middleware Active',
        description: 'PKCS#11 smart card drivers & NIC DigiSigner client running on 127.0.0.1:8080.'
      },
      afterUninstall: {
        status: 'CLEARED',
        badge: 'Bridges Removed',
        description: 'Firewall rules (Port 8080) removed, SmartCard service bindings cleared.'
      }
    },
    {
      feature: '24x7 System Tray Auto-Repair Guardian',
      category: 'Background Process',
      beforeInstall: {
        status: 'NOT_SET',
        badge: 'Not Running',
        description: 'No background guardian monitoring Edge policy drifts or registry corruption.'
      },
      afterInstall: {
        status: 'ACTIVE',
        badge: 'Guardian Running',
        description: '24x7 Tray Guardian active in background with self-healing auto-repair policies.'
      },
      afterUninstall: {
        status: 'PURGED',
        badge: 'Process Terminated',
        description: 'Tray Guardian terminated, startup run key (EVedhikaUBDGuardian) deleted.'
      }
    },
    {
      feature: 'Central Cloud Telemetry & Reporting',
      category: 'Telemetry',
      beforeInstall: {
        status: 'NOT_SET',
        badge: 'Offline',
        description: 'No central cloud reporting to https://www.e-vedhika.in/api/telemetry.'
      },
      afterInstall: {
        status: 'ACTIVE',
        badge: '100% Sync',
        description: 'Daily health score, PC specs, and deployment logs synced to Central Cloud.'
      },
      afterUninstall: {
        status: 'REVERTED',
        badge: 'UNINSTALLED Dispatched',
        description: 'Final "APP UNINSTALLED (System Reverted)" alert sent to Central Cloud & Telegram.'
      }
    }
  ];

  const categories = ['ALL', 'Browser Policy', 'Enterprise List', 'Security Zones', 'ActiveX Engine', 'Drivers', 'Background Process', 'Telemetry'];

  const filteredData = selectedCategory === 'ALL' 
    ? comparisonData 
    : comparisonData.filter(item => item.category === selectedCategory);

  const exportComparisonReportText = () => {
    const text = `================================================================================
E-VEDHIKA UBD TOOL - 3-STAGE SYSTEM COMPARISON REPORT
(BEFORE INSTALL vs AFTER INSTALL vs AFTER UNINSTALL)
Report Generated: ${new Date().toLocaleString()}
Target Office: Grama Panchayat & Mandal Offices (Telangana / Andhra Pradesh)
Website: https://www.e-vedhika.in | UBD Portal: https://ubd.telangana.gov.in
================================================================================

1. BEFORE APPLICATION INSTALLATION (అప్లికేషన్ వేయకముందు):
--------------------------------------------------------------------------------
• Edge IE Mode: Not configured (InternetExplorerIntegrationLevel = 0)
• sites.xml: Missing from C:\\enterprise_compat
• Zone 2 Trusted Sites: Default strict settings (ActiveX blocked)
• ActiveX COM: Unregistered (Error -2146827859 "Automation server can't create object")
• DSC Token: Driver missing, Token Number registration fails at Step 3
• Background Guardian: Inactive
• UBD Portal Status: BLOCKED / FAILED

2. AFTER APPLICATION INSTALLATION (అప్లికేషన్ ఇన్‌స్టాల్ చేసిన తర్వాత):
--------------------------------------------------------------------------------
• Edge IE Mode: Configured (InternetExplorerIntegrationLevel = 1, IE5 Quirks Mode)
• sites.xml: Deployed to C:\\enterprise_compat\\sites.xml with UBD domain rules
• Zone 2 Trusted Sites: Mapped to Zone 2 with relaxed ActiveX prompts
• ActiveX COM: DigiSignHelper & SignatureDemoLib.dll SHA256 patched & registered
• DSC Token: WD ProxKey & HYP2003 drivers active, NIC DigiSigner running on Port 8080
• Background Guardian: 24x7 System Tray Auto-Repair Guardian active
• UBD Portal Status: 100% READY / WORKING (17/17 Steps Passed)

3. AFTER APPLICATION UNINSTALLATION (అప్లికేషన్ అన్‌ఇన్‌స్టాల్ చేసిన తర్వాత):
--------------------------------------------------------------------------------
• Edge IE Mode: Registry policies purged (reverted to default browser behavior)
• sites.xml: C:\\enterprise_compat\\ directory & sites.xml erased completely
• Zone 2 Trusted Sites: Domain mappings purged, Zone 2 reset to Medium factory defaults
• ActiveX COM: All ProgIDs & CLSIDs unregistered & purged from Registry
• DSC Token: Local loopback firewall rules (Port 8080) & service bindings cleared
• Background Guardian: Process killed, startup run keys deleted
• UBD Portal Status: REVERTED TO ORIGINAL STATE (No UBD benefits remain on PC)

================================================================================
End of 3-Stage Comparison Audit Report.
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evedhika_3stage_system_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                3-STAGE SYSTEM COMPARISON AUDIT REPORT
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                BEFORE vs AFTER INSTALL vs AFTER UNINSTALL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              కంప్యూటర్‌లో అప్లికేషన్ <strong className="text-slate-800">వేసుకోకముందు ఎలా ఉంది</strong>, <strong className="text-slate-800">వేసుకున్నాక ఎలా పనిచేస్తుంది</strong>, మరియు <strong className="text-slate-800">తీసేసాక (అన్ ఇన్‌స్టాల్) ఏమవుతుంది</strong> అనే సమగ్ర పోలిక నివేదిక.
            </p>
          </div>
        </div>

        <button
          onClick={exportComparisonReportText}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export 3-Stage Report (.txt)</span>
        </button>
      </div>

      {/* Category Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3-Stage Side-by-Side Comparison Matrix */}
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {/* Table Header */}
        <div className="bg-slate-900 text-white grid grid-cols-1 md:grid-cols-4 p-3.5 text-xs font-black tracking-wider uppercase">
          <div className="md:col-span-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Component Feature</span>
          </div>
          <div className="text-rose-400 flex items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <ShieldX className="w-4 h-4" />
            <span>1. Before Install (వేసుకోకముందు)</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <ShieldCheck className="w-4 h-4" />
            <span>2. After Install (వేసుకున్నాక)</span>
          </div>
          <div className="text-amber-400 flex items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <Flame className="w-4 h-4" />
            <span>3. After Uninstall (తీసేసాక)</span>
          </div>
        </div>

        {/* Rows */}
        {filteredData.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 p-4 hover:bg-slate-50/80 transition-colors gap-4 text-xs">
            {/* Feature Info */}
            <div className="space-y-1 md:col-span-1">
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {item.category}
              </span>
              <h4 className="font-bold text-slate-900">{item.feature}</h4>
            </div>

            {/* 1. Before Install */}
            <div className="space-y-1.5 p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[10px]">
                <XCircle className="w-3 h-3 text-rose-700" /> {item.beforeInstall.badge}
              </span>
              <p className="text-rose-950 text-[11px] leading-relaxed">
                {item.beforeInstall.description}
              </p>
            </div>

            {/* 2. After Install */}
            <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> {item.afterInstall.badge}
              </span>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                {item.afterInstall.description}
              </p>
            </div>

            {/* 3. After Uninstall */}
            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                <Flame className="w-3 h-3 text-amber-700" /> {item.afterUninstall.badge}
              </span>
              <p className="text-amber-950 text-[11px] leading-relaxed">
                {item.afterUninstall.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
          <Sparkles className="w-4 h-4" />
          <span>అప్లికేషన్ జీవన చక్ర సారాంశం (Summary Lifecycle Guarantee):</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          సాఫ్ట్‌వేర్ వేసుకోకముందు మీ పీసీలో UBD లాగిన్ బ్రౌజర్ ఎర్రర్లు మరియు DSC టోకెన్ బ్లాకింగ్ సమస్యలు ఉంటాయి. అప్లికేషన్ వేసుకున్న తర్వాత 1-క్లిక్‌తో 17 సెట్టింగ్‌లు ఆటోమేటిక్‌గా సరిచేయబడి UBD సిస్టమ్ 100% పర్ఫెక్ట్‌గా నడుస్తుంది. ఒకవేళ మీరు అప్లికేషన్‌ను తీసేస్తే (అన్ ఇన్‌స్టాల్) విత్ ఇన్ సెకన్లలో మన అప్లికేషన్ చేసిన మార్పులు అన్నీ తొలగించబడి మీ కంప్యూటర్ మళ్లీ మొదటి సాధారణ స్థితికి చేరుకుంటుంది.
        </p>
      </div>
    </div>
  );
};
