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
  const [expandedAv, setExpandedAv] = useState<string | null>('error4551');

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
              <span>Smart App Control, Error 4551 & యాంటీవైరస్ ఆటో-అన్‌బ్లాకర్</span>
            </h3>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              Windows 11 Smart App Control, Error 4551 (Temp Directory Block), QuickHeal, NPAV లేదా Windows Defender బ్లాక్ చేస్తే 1-క్లిక్‌తో పరిష్కరించండి.
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
            <span>1-Click Fix Error 4551 & Smart App Control (.bat)</span>
          </a>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-100">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 block">Error 4551 & Smart App Control ఎందుకు వస్తుంది? (Why This Happens on Windows 11)</strong>
          <p className="leading-relaxed opacity-90">
            బ్రౌజర్ నుండి <code>EVedhika_Setup_v1.0.9.exe</code> డౌన్‌లోడ్ చేసినప్పుడు Windows 11 దానికి <code>Zone.Identifier</code> (Mark-of-the-Web) పెడుతుంది మరియు <code>%TEMP%</code> ఫోల్డర్ నుండి సెటప్ ఫైల్స్ రన్ అవ్వకుండా <strong>Smart App Control (Error 4551)</strong> ఆపుతుంది. క్రింది 1-లైన్ కమాండ్ లేదా <code>.bat</code> ఫైల్ రన్ చేస్తే వెంటనే ఇన్స్టాల్ అవుతుంది.
          </p>
        </div>
      </div>

      {/* Accordions for popular Antivirus software */}
      <div className="space-y-2 text-xs font-mono">
        <p className="text-slate-300 font-bold uppercase text-[11px] tracking-wider mb-2">
          ఎర్రర్ మరియు యాంటీవైరస్ వారిగా అన్‌బ్లాక్ చేసే విధానం (Step-by-Step Bypass):
        </p>

        {/* 0. Error 4551 & Smart App Control */}
        <div className="bg-slate-900 border border-rose-500/50 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleAv('error4551')}
            className="w-full p-3 flex items-center justify-between text-left bg-rose-950/50 hover:bg-rose-900/50 transition-colors font-bold text-rose-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>0. Windows 11 "Smart App Control blocked an app" & "Error 4551: Unable to execute file in the temporary directory"</span>
            </div>
            {expandedAv === 'error4551' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedAv === 'error4551' && (
            <div className="p-4 space-y-2.5 text-slate-200 bg-slate-950/95 border-t border-rose-500/30 leading-relaxed font-sans text-xs">
              <p className="font-bold text-emerald-300">పద్ధతి 1 (అత్యంత సులభం - 10 సెకన్లలో): PowerShell (Run as Administrator) ఓపెన్ చేసి ఈ ఒక్క లైన్ పేస్ట్ చేసి Enter నొక్కండి:</p>
              <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl font-mono text-[11px] text-cyan-300 select-all overflow-x-auto">
                mkdir C:\ProgramData\EVedhika\SetupTemp -Force; $env:TEMP=&apos;C:\ProgramData\EVedhika\SetupTemp&apos;; $env:TMP=&apos;C:\ProgramData\EVedhika\SetupTemp&apos;; Unblock-File &quot;$env:USERPROFILE\Downloads\EVedhika_Setup_v1.0.9.exe&quot;; Start-Process &quot;$env:USERPROFILE\Downloads\EVedhika_Setup_v1.0.9.exe&quot;
              </div>
              <p className="font-bold text-amber-300 pt-1">పద్ధతి 2 (Windows Security లో Smart App Control ఆఫ్ చేయడం):</p>
              <p>1. Windows Start మెనూలో <strong>Windows Security</strong> ఓపెన్ చేయండి.</p>
              <p>2. <strong>App &amp; browser control ➔ Smart App Control settings</strong> పై క్లిక్ చేసి <strong>Off</strong> చేయండి.</p>
              <p>3. <code>Downloads\EVedhika_Setup_v1.0.9.exe</code> పై రైట్-క్లిక్ చేసి <strong>Properties ➔ Unblock (టిక్ పెట్టండి) ➔ Apply ➔ OK</strong> నొక్కి ఆపై రన్ చేయండి.</p>
            </div>
          )}
        </div>

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

        {/* 5. Google Chrome & Edge Excel (.xls) Download Block ("Your organization blocked this file") */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleAv('chrome_excel')}
            className="w-full p-3 flex items-center justify-between text-left bg-emerald-950/40 hover:bg-emerald-900/40 transition-colors font-bold text-emerald-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>5. Google Chrome / Edge Excel Download Block ("Your organization blocked this file because it didn't meet a security policy")</span>
            </div>
            {expandedAv === 'chrome_excel' ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
          </button>

          {expandedAv === 'chrome_excel' && (
            <div className="p-4 space-y-2.5 text-slate-200 bg-slate-950/90 border-t border-emerald-500/30 leading-relaxed font-sans text-xs">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-200 font-mono text-[11px]">
                <strong>ఎర్రర్:</strong> "Your organization blocked this file because it didn't meet a security policy" (07-11-2026DailyDataEntryStatusReport.xls)
              </div>
              <p className="text-emerald-300 font-bold">పరిష్కార మార్గాలు (Permanent Solutions):</p>
              <p>1. <strong>E-Vedhika One-Click Fix</strong>: పైన ఉన్న <code>1-Click Auto Whitelister (.bat)</code> లేదా E-Vedhika C# టూల్‌లో <strong>"DEPLOY ALL"</strong> క్లిక్ చేయండి. ఇది Chrome/Edge యొక్క <code>DownloadRestrictions</code> మరియు <code>ExemptDomainFileTypePairsFromFileTypeDownloadWarnings</code> రిజిస్ట్రీ కీలను ఆటోమేటిక్‌గా సెట్ చేస్తుంది.</p>
              <p>2. <strong>Chrome బ్రౌజర్ సెట్టింగ్స్</strong>: Chrome లో <code>chrome://settings/security</code> కి వెళ్ళి <strong>"Standard Protection"</strong> ని ఎంచుకోండి.</p>
              <p>3. <strong>Chrome అన్-బ్లాక్ కమాండ్</strong>: బ్రౌజర్ అడ్రస్ బార్‌లో <code>chrome://flags/#allow-insecure-localhost</code> లేదా డిస్చార్జ్ విధానాన్ని డిసేబుల్ చేసి UBD పోర్టల్‌ని అలౌడ్ లిస్ట్‌లో చేర్చండి.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
