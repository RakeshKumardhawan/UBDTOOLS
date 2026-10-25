import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Download, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Globe, 
  Monitor, 
  Key, 
  Cpu, 
  FileCode, 
  Terminal,
  HelpCircle,
  Clock,
  Printer
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useToast } from './Toast';

interface PostDetailViewProps {
  onBack?: () => void;
  setActiveTab?: (tab: NavigationTab) => void;
  slug?: string;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  onBack,
  setActiveTab,
  slug = 'ubd-setting-issues-one-click-all-in-one-setup'
}) => {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  const canonicalUrl = 'https://www.e-vedhika.in/home/post/ubd-setting-issues-one-click-all-in-one-setup';
  const downloadExeUrl = 'https://github.com/RakeshKumardhawan/UBDTOOLS/releases/download/latest/EVedhika_Setup_v1.0.8.exe';
  const downloadZipUrl = '/EVedhikaUBDDeploymentTool_CSharp_Solution.zip';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    showSuccess('పోస్ట్ లింక్ కాపీ చేయబడింది! (Copied to clipboard)', 'Link Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto h-full custom-scrollbar">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => {
            if (onBack) onBack();
            else if (setActiveTab) setActiveTab('posts');
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>అన్ని పోస్ట్‌లు (Back to Posts)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 border border-indigo-200 transition-all cursor-pointer"
            title="Copy Public Post URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-indigo-600" />}
            <span>{copied ? 'లింక్ కాపీ అయింది!' : 'షేర్ లింక్ (Copy URL)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>ప్రింట్ / PDF</span>
          </button>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab('deploy')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>15-Step Auto Deploy టూల్ ఓపెన్ చేయండి</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Article Container */}
      <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Article Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Globe className="w-72 h-72 text-indigo-300" />
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                🔴 HIGH PRIORITY OFFICIAL GUIDE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                ActiveX / DSC Guide
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                v1.0.8 Solution
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-syne text-white tracking-tight leading-snug">
              UBD Setting Issues One-Click All-in-One Setup
            </h1>

            <p className="text-amber-300 font-semibold text-sm sm:text-base leading-relaxed">
              తెలంగాణ ubd.telangana.gov.in & ఏపీ పోర్టల్ లాగిన్, ఎడ్జ్ IE మోడ్, యాక్టివ్‌ఎక్స్ (ActiveX), జోన్ 2 రిజిస్ట్రీ మరియు DSC డిజిటల్ సిగ్నేచర్ టోకెన్ సమస్యలకు సంపూర్ణ పరిష్కారం.
            </p>

            {/* Author Meta */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  RD
                </div>
                <span>రచయిత: <strong className="text-white">Rakesh Dhawan (Admin)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>అక్టోబర్ 22, 2026 (October 22, 2026)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>చదవడానికి సమయం: 4 నిమిషాలు (4 Min Read)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Download Box */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>వన్-క్లిక్ సెటప్ టూల్ డౌన్‌లోడ్ చేసుకోండి (Instant Download)</span>
            </h3>
            <p className="text-xs text-slate-600">
              గ్రామ పంచాయితీలు మరియు మండల ఆఫీసుల కోసం 100% ఉచితంగా రూపొందించబడిన C# .NET 4.8 ఆటోమేషన్ టూల్.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={downloadExeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>EVedhika_Setup_v1.0.8.exe</span>
            </a>

            <a
              href={downloadZipUrl}
              download="EVedhikaUBDDeploymentTool_CSharp_Solution.zip"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>C# ZIP Solution</span>
            </a>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-800 leading-relaxed text-sm">
          {/* Introduction */}
          <div className="space-y-3">
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              తెలంగాణ రాష్ట్రంలోని గ్రామ పంచాయితీలు, మండల పరిషత్ కార్యాలయాలు, మరియు అర్బన్ లోకల్ బాడీలలో (ULBs) <strong>UBD (Urban Basic Development - ubd.telangana.gov.in)</strong> పోర్టల్‌లో లాగిన్ అవ్వడానికి లేదా బిల్స్ డిజిటల్ సిగ్నేచర్ (DSC Token) తో ధృవీకరించడానికి పంచాయతీ కార్యదర్శులు, జూనియర్ అసిస్టెంట్లు, కంప్యూటర్ ఆపరేటర్లు తీవ్రమైన సాంకేతిక సమస్యలను ఎదుర్కొంటున్నారు.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Internet Explorer 11 నిలిపివేయబడిన తర్వాత మైక్రోసాఫ్ట్ ఎడ్జ్ (Edge) బ్రౌజర్‌లో UBD వెబ్‌సైట్ సరిగ్గా ఓపెన్ కాకపోవడం, బ్లాంక్ స్క్రీన్ రావడం, మరియు USB టోకెన్లు గుర్తించబడకపోవడం అత్యంత సాధారణ సమస్యలుగా మారాయి. ఈ సమస్యలన్నింటినీ మాన్యువల్ కాన్ఫిగరేషన్ లేకుండా కేవలం <strong>ఒకే ఒక్క క్లిక్‌తో (One-Click)</strong> పరిష్కరించే విధానం క్రింద సమగ్రంగా వివరించబడింది.
            </p>
          </div>

          {/* Section 1: Major Issues */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 font-syne">
                1. UBD పోర్టల్‌లో ఎదురవుతున్న 5 ప్రధాన సాంకేతిక సమస్యలు (Common UBD Setting Issues)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Edge లో ఖాళీ స్క్రీన్ (Blank Screen / Not Loading)</span>
                </div>
                <p className="text-xs text-rose-900/80 leading-relaxed">
                  UBD వెబ్‌సైట్ పురాతన <strong>IE5 Quirks Mode</strong> ఆర్కిటెక్చర్‌పై నడుస్తుంది. సాధారణ ఎడ్జ్ బ్రౌజర్ లేదా క్రోమ్‌లో ఇది ఓపెన్ కాదు. ఎంటర్‌ప్రైజ్ సైట్ లిస్ట్ (sites.xml) లో కచ్చితమైన పాలసీ ఉంటేనే పేజీ రన్ అవుతుంది.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>ActiveX Controls బ్లాక్ అవ్వడం (Unsafe ActiveX Block)</span>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  విండోస్ డీఫాల్ట్ సెక్యూరిటీ ప్రకారం "ActiveX control is not allowed to run" లేదా "Object doesn't support this action" అనే ఎర్రర్ వస్తుంది. జోన్ 2 రిజిస్ట్రీ ఫ్లాగ్స్ సెట్ చేయకపోతే DSC బటన్లు పనిచేయవు.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>USB DSC టోకెన్ గుర్తించబడకపోవడం (Token Not Detected)</span>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  WD ProxKey, HYP2003, ePass2003 Auto, Longmai mToken వంటి USB క్రిప్టోగ్రాఫిక్ డాంగిల్స్‌ను సిస్టమ్ చదవలేకపోవడం. Windows Smart Card Service (SCardSvr) ఆగిపోవడం వల్ల ఈ లోపం ఏర్పడుతుంది.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>NIC DigiSigner పోర్ట్ 8080/8443 కనెక్షన్ వైఫల్యం</span>
                </div>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  డిజిటల్ సిగ్నేచర్‌ను బ్రౌజర్‌కు అందించే లోకల్ వెబ్ బ్రిడ్జ్ (NIC DigiSigner Service) పోర్ట్ 8080 పై లిజన్ చేయకపోవడం వల్ల డాక్యుమెంట్ సైనింగ్ ప్రాసెస్ ఆగిపోతుంది.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs">5</span>
                <span>.NET Framework 3.5 (NetFx3) & Visual C++ రన్‌టైమ్ లోపాలు</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                విండోస్ 10 మరియు విండోస్ 11 కంప్యూటర్లలో .NET Framework 3.5 డీఫాల్ట్‌గా డిసేబుల్ అయి ఉంటుంది. ఇది లేకుండా టోకెన్ డ్రైవర్ల DLL ఫైల్స్ ఎగ్జిక్యూట్ కావు.
              </p>
            </div>
          </div>

          {/* Section 2: The One-Click Solution */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 font-syne">
                2. వన్-క్లిక్ ఆల్-ఇన్-వన్ పరిష్కారం: E-Vedhika Deployment Tool (v1.0.8)
              </h2>
            </div>

            <p className="text-slate-700">
              ఈ అన్ని సమస్యలను మాన్యువల్‌గా ఒక్కొక్కటి చేయాలంటే కనీసం 30 నుండి 45 నిమిషాల సమయం పడుతుంది మరియు రిజిస్ట్రీ పొరపాటుగా మారి సిస్టమ్ పాడయ్యే అవకాశం ఉంది. దీనిని నివారించడానికి రూపొందించిన <strong>E-Vedhika All-in-One One-Click Setup Tool</strong> కేవలం ఒకే ఒక్క క్లిక్‌తో క్రింది 15 కీలక సెట్టింగులను సెకన్లలో సరిచేస్తుంది:
            </p>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-16">స్టెప్ #</th>
                    <th className="py-2.5 px-4">ఆటోమేషన్ కాన్ఫిగరేషన్ (Configuration Step)</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">వివరణ & ప్రభావం (Impact)</th>
                    <th className="py-2.5 px-4 text-right">ఫలితం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">01</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Administrator Rights & DISM Engine</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">HKLM రిజిస్ట్రీ మార్పుల కోసం ఎలివేటెడ్ అడ్మిన్ యాక్సెస్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">02</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">.NET Framework 3.5 & 4.8 Silent Enabler</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">DISM NetFx3 ఫీచర్ ను ఆటోమేటిక్‌గా యాక్టివేట్ చేయడం</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">03</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Edge Enterprise Site List Integration</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">C:\EVedhika_UBD\sites.xml ఫైల్ బైండింగ్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">04</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">IE5 Quirks Mode Binding (ubd.telangana.gov.in)</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">పోర్టల్ బ్లాంక్ స్క్రీన్ రాకుండా IE5 డాక్యుమెంట్ మోడ్ అమలు</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">05</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Zone 2 (Trusted Sites) 48+ DWORD Registry Flags</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">ActiveX అనుమతులు మరియు స్క్రిప్టింగ్ పాలసీల ఎన్‌ఫోర్స్‌మెంట్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">06</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Unsigned ActiveX Controls Auto-Approval</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">UBD పోర్టల్ ActiveX డ్రైవర్లను అనుమతించడం</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">07</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">Smart Card Service (SCardSvr) Health Check</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">విండోస్ స్మార్ట్ కార్డ్ సర్వీస్‌ను ఆటో-స్టార్ట్ చేయడం</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">08</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">WD ProxKey & HYP2003 Token Middleware Check</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">PKCS#11 DLL మరియు క్రిప్టో ప్రొవైడర్ రిజిస్ట్రేషన్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">09</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">NIC DigiSigner Port 8080/8443 Bridge Link</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">లోకల్ డిజిటల్ సిగ్నేచర్ బ్రిడ్జ్ లిజనర్ కాన్ఫిగరేషన్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">10</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">DNS Cache Flush & SSL Sockets Reset</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">పాత క్యాష్ క్లియర్ చేసి లేటెస్ట్ సర్టిఫికెట్లను పునరుద్ధరించడం</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">11-15</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">TLS 1.2/1.3, Dual Browser Routing, Live Cloud Telemetry</td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">పూర్తి సెక్యూర్ రూటింగ్ మరియు సెంట్రల్ మానిటరింగ్</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">PASS ✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: How to Use */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Terminal className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 font-syne">
                3. దశలవారీగా ఎలా ఉపయోగించాలి? (Step-by-Step Practical Guide)
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">టూల్ డౌన్‌లోడ్ చేసుకోండి (Download EVedhika Tool):</h4>
                  <p className="text-xs text-slate-600">
                    పై బటన్ ద్వారా <strong>EVedhika_Setup_v1.0.8.exe</strong> లేదా C# పోర్టబుల్ జిప్ ఫైల్‌ను మీ కంప్యూటర్‌లో డౌన్‌లోడ్ చేయండి.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">అడ్మినిస్ట్రేటర్‌గా రన్ చేయండి (Run as Administrator):</h4>
                  <p className="text-xs text-slate-600">
                    డౌన్‌లోడ్ అయిన ఫైల్‌పై మౌస్‌తో Right Click చేసి <strong>"Run as Administrator"</strong> ఎంచుకోండి. UAC ప్రాంప్ట్ వస్తే "Yes" క్లిక్ చేయండి.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">"15-Step Auto Deployment" బటన్ క్లిక్ చేయండి:</h4>
                  <p className="text-xs text-emerald-900/80">
                    టూల్ మెయిన్ స్క్రీన్‌పై కనిపించే పెద్ద ఆకుపచ్చ బటన్‌ను క్లిక్ చేయండి. కేవలం 15 సెకన్లలో అన్ని 15 సెట్టింగులు ఆటోమేటిక్‌గా పచ్చటి టిక్స్ (PASS) తో పూర్తవుతాయి.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">DSC టోకెన్ పెట్టి UBD పోర్టల్ లాగిన్ అవ్వండి:</h4>
                  <p className="text-xs text-slate-600">
                    మీ USB DSC Token ను కంప్యూటర్‌కు కనెక్ట్ చేసి, టూల్‌లోని <strong>"🌐 Open UBD Portal in Edge"</strong> బటన్ లేదా డెస్క్‌టాప్ షార్ట్‌కట్ క్లిక్ చేయండి. Edge IE Mode లో నేరుగా లాగిన్ స్క్రీన్ ఓపెన్ అవుతుంది!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dual Browser Routing Rule */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-sm sm:text-base text-amber-300">
                ముఖ్యమైన సూచన: డ్యూయల్ బ్రౌజర్ రూటింగ్ విధానం (Dual Browser Mode)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="font-bold text-emerald-400 block">1. ubd.telangana.gov.in (గవర్నమెంట్ పోర్టల్):</span>
                <p className="text-slate-300">
                  ఇది కేవలం Microsoft Edge IE Mode (IE5 Quirks Mode) లో మాత్రమే ఓపెన్ అవుతుంది. టూల్ దీనిని ఆటోమేటిక్‌గా కంట్రోల్ చేస్తుంది.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="font-bold text-sky-400 block">2. www.e-vedhika.in (ఈ-వేదిక వెబ్ అప్లికేషన్):</span>
                <p className="text-slate-300">
                  ఇది IE Mode నుండి మినహాయించబడింది. మీరు సాధారణ Chrome, Firefox లేదా Edge బ్రౌజర్‌లో నేరుగా ఓపెన్ చేసుకోవచ్చు.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Troubleshooting & Support */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 font-syne">
                4. తరచుగా అడిగే ప్రశ్నలు & ట్రబుల్ షూటింగ్ (FAQ & Troubleshooting)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <details className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  <span>ప్రశ్న: ఈ టూల్ విండోస్ 7, 8, 10 మరియు 11 అన్నింటిలో పని చేస్తుందా?</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  అవును, E-Vedhika v1.0.8 టూల్ .NET Framework 4.8 ఆర్కిటెక్చర్‌తో రూపొందించబడింది. ఇది విండోస్ 7 SP1, విండోస్ 8.1, విండోస్ 10 మరియు విండోస్ 11 (32-బిట్ & 64-బిట్) అన్ని ఆపరేటింగ్ సిస్టమ్‌లలో విజయవంతంగా రన్ అవుతుంది.
                </p>
              </details>

              <details className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  <span>ప్రశ్న: టోకెన్ పెట్టినా "No certificate found" లేదా "Insert Smart Card" అని వస్తే ఏం చేయాలి?</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  ఈ-వేదిక టూల్‌లోని "Drivers Management" ట్యాబ్‌కు వెళ్లి మీ డోంగిల్ మోడల్ (WD ProxKey లేదా HYP2003) డ్రైవర్‌ను 'Reinstall' క్లిక్ చేయండి. అలాగే కంప్యూటర్‌లోని Date & Time ఖచ్చితంగా IST (భారతీయ ప్రామాణిక సమయం) కి సరిగ్గా ఉండేలా చూడండి.
                </p>
              </details>

              <details className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  <span>ప్రశ్న: పంచాయితీ కార్యాలయాల నుండి రిమోట్ సపోర్ట్ ఎలా పొందాలి?</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  ఈ వెబ్‌సైట్‌లోని <strong>"Remote Support (రిమోట్ సపోర్ట్)"</strong> ట్యాబ్‌పై క్లిక్ చేసి AnyDesk లేదా UltraViewer ఐడీ ఎంటర్ చేసి "Request Remote Help" క్లిక్ చేయండి. లేదా టెలిగ్రామ్ అలర్ట్ ద్వారా నేరుగా హెల్ప్‌డెస్క్‌ని సంప్రదించవచ్చు.
                </p>
              </details>
            </div>
          </div>

          {/* Call to Action Footer */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4">
            <h3 className="text-lg sm:text-xl font-bold font-syne text-amber-300">
              UBD పోర్టల్ సెట్టింగ్స్ సమస్యలను ఇప్పుడే పరిష్కరించుకోండి!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              వందలాది గ్రామ పంచాయితీల్లో విజయవంతంగా ఉపయోగించబడుతున్న E-Vedhika One-Click UBD Deployment Tool తో మీ సమస్యను చిటికెలో సరిచేయండి.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={downloadExeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>డౌన్‌లోడ్ EVedhika Setup (EXE)</span>
              </a>

              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('deploy')}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>డ్యాష్‌బోర్డ్ ఆటో డిప్లాయ్‌మెంట్ ఓపెన్ చేయండి</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
