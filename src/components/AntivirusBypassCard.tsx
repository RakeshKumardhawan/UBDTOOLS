import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Download,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';

export const AntivirusBypassCard: React.FC = () => {
  const [expandedAv, setExpandedAv] = useState<string | null>('defender');

  const toggleAv = (id: string) => {
    setExpandedAv(expandedAv === id ? null : id);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 rounded-2xl p-5 sm:p-6 border border-amber-500/30 text-white shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>యాంటీవైరస్ ఆటో-అన్‌బ్లాకర్ & వైట్‌లిస్ట్ విభాగాలు (Antivirus False Positive Resolver)</span>
            </h3>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              QuickHeal, NPAV, Avast, Kaspersky లేదా Windows Defender వల్ల ఇన్స్టాలేషన్ ఆగిపోతే 1-క్లిక్‌తో అన్‌బ్లాక్ చేయండి.
            </p>
          </div>
        </div>

        {/* 1-Click Auto Whitelist Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/downloads/Unblock_EVedhika_Antivirus_Exclusion.bat"
            download="Unblock_EVedhika_Antivirus_Exclusion.bat"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Auto Whitelister (.bat)</span>
          </a>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-100">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 block">యాంటీవైరస్ ఎందుకు ఆపుతుంది? (Why Antivirus Blocks Installation)</strong>
          <p className="leading-relaxed opacity-90">
            E-Vedhika C# అప్లికేషన్ బ్రౌజర్‌లో Edge IE5 Quirks Mode రిజిస్ట్రీ కీలు అప్‌డేట్ చేయడం మరియు USB DSC Token డ్రైవర్లను కాన్ఫిగర్ చేయడం వల్ల QuickHeal, NPAV లేదా Windows Defender దీనిని అజ్ఞాత సాఫ్ట్‌వేర్‌గా భావించి (False Positive) బ్లాక్ చేస్తుంది. క్రింది 1-క్లిక్ స్క్రిప్ట్ రన్ చేస్తే సరిపోతుంది.
          </p>
        </div>
      </div>

      {/* Accordions for popular Antivirus software */}
      <div className="space-y-2 text-xs font-mono">
        <p className="text-slate-300 font-bold uppercase text-[11px] tracking-wider mb-2">
          యాంటీవైరస్ సాఫ్ట్‌వేర్ వారిగా అన్‌బ్లాక్ చేసే విధానం (Step-by-Step Manual Bypass):
        </p>

        {/* 1. Windows Defender & SmartScreen */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleAv('defender')}
            className="w-full p-3 flex items-center justify-between text-left bg-slate-950/60 hover:bg-slate-800/60 transition-colors font-bold text-cyan-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>1. Windows Defender & SmartScreen ("Windows protected your PC")</span>
            </div>
            {expandedAv === 'defender' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedAv === 'defender' && (
            <div className="p-3.5 space-y-2 text-slate-300 bg-slate-900/90 border-t border-slate-800 leading-relaxed font-sans text-xs">
              <p>1. డౌన్‌లోడ్ చేసిన Zip లేదా `.exe` పై రైట్ క్లిక్ చేసి <strong>Properties</strong> కి వెళ్లండి.</p>
              <p>2. క్రింద ఉన్న <strong>"Unblock"</strong> చెక్‌బాక్స్‌ను టిక్ చేసి <strong>Apply ➔ OK</strong> క్లిక్ చేయండి.</p>
              <p>3. స్క్రీన్ పై "Windows protected your PC" అని వస్తే <strong>"More info"</strong> నొక్కి <strong>"Run anyway"</strong> ఎంచుకోండి.</p>
            </div>
          )}
        </div>

        {/* 2. QuickHeal Total Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleAv('quickheal')}
            className="w-full p-3 flex items-center justify-between text-left bg-slate-950/60 hover:bg-slate-800/60 transition-colors font-bold text-amber-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>2. QuickHeal Total Security / Antivirus</span>
            </div>
            {expandedAv === 'quickheal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedAv === 'quickheal' && (
            <div className="p-3.5 space-y-2 text-slate-300 bg-slate-900/90 border-t border-slate-800 leading-relaxed font-sans text-xs">
              <p>1. QuickHeal Dashboard ఓపెన్ చేసి <strong>Files & Folders ➔ Exclude Files & Folders</strong> ఎంచుకోండి.</p>
              <p>2. <strong>Add</strong> బటన్ క్లిక్ చేసి <code>C:\EVedhikaUBD</code> ఫోల్డర్ మరియు <code>EVedhikaUBDDeploymentTool.exe</code> ఫైల్‌ను యాడ్ చేయండి.</p>
              <p>3. <strong>Virus Protection / Virus Shield</strong> ని 10 నిమిషాలు పాజ్ చేసి ఇన్స్టాలేషన్ పూర్తి చేయండి.</p>
            </div>
          )}
        </div>

        {/* 3. NPAV (Net Protector) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleAv('npav')}
            className="w-full p-3 flex items-center justify-between text-left bg-slate-950/60 hover:bg-slate-800/60 transition-colors font-bold text-emerald-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>3. NPAV (Net Protector Antivirus)</span>
            </div>
            {expandedAv === 'npav' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedAv === 'npav' && (
            <div className="p-3.5 space-y-2 text-slate-300 bg-slate-900/90 border-t border-slate-800 leading-relaxed font-sans text-xs">
              <p>1. NPAV Dashboard లో <strong>Protection ➔ Folder Protection</strong> కు వెళ్లండి.</p>
              <p>2. <strong>Add Exclusion Folder</strong> లో <code>C:\EVedhikaUBD</code> ను ఎంచుకోండి.</p>
              <p>3. **Real-time Shield** ని ఇన్స్టాలేషన్ పూర్తయ్యే వరకు డిసేబుల్ చేయండి.</p>
            </div>
          )}
        </div>

        {/* 4. Avast / Kaspersky / McAfee / Norton */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleAv('others')}
            className="w-full p-3 flex items-center justify-between text-left bg-slate-950/60 hover:bg-slate-800/60 transition-colors font-bold text-sky-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>4. Avast / Kaspersky / McAfee / Norton Security</span>
            </div>
            {expandedAv === 'others' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedAv === 'others' && (
            <div className="p-3.5 space-y-2 text-slate-300 bg-slate-900/90 border-t border-slate-800 leading-relaxed font-sans text-xs">
              <p>1. మీ యాంటీవైరస్ <strong>Settings ➔ Exclusions / Allowed Apps</strong> లోకి వెళ్లండి.</p>
              <p>2. E-Vedhika డెవలప్‌మెంట్ ఫోల్డర్ <code>C:\EVedhikaUBD</code> ను trusted exclusion గా మార్చండి.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
