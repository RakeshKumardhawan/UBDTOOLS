import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe,
  Database,
  LifeBuoy
} from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Manual & Enterprise Support Guide</h2>
            <p className="text-xs text-slate-500">
              Documentation, troubleshooting procedures, and support information for ground-level staff.
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          Enterprise Helpdesk
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Documentation & Troubleshooting */}
        <div className="lg:col-span-2 space-y-6">

          {/* Subscription, Zero-Call Payment & UTR Instructions Card */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  💳 Subscription, Zero-Call UPI Payment &amp; UTR Guide (పేమెంట్ సూచనలు)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Free Early Access Now • Future ₹10/Month
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
                <strong className="text-slate-900 block font-bold">
                  1. యూజర్లు పేమెంట్ ఎలా చేయాలి? (Operator Steps)
                </strong>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                  <li>ప్రస్తుతం యాప్ <strong>100% ఉచితం</strong>. భవిష్యత్తులో Admin <code>PAID_MONTHLY</code> (₹10 / 30 రోజులు) ఆన్ చేసినప్పుడు యాప్ లో <strong>"📱 Scan QR / Pay ₹10 Online"</strong> బటన్ కనిపిస్తుంది.</li>
                  <li>ఆ బటన్ నొక్కగానే బ్రౌజర్‌లో <strong>Scannable UPI QR Code</strong> లేదా Secure Gateway పేజీ ఓపెన్ అవుతుంది (Admin ఫోన్ నంబర్ బయటకు కనిపించదు — కాల్స్ చేయాల్సిన అవసరం లేదు).</li>
                  <li>మీ PhonePe / GPay / Paytm తో QR స్కాన్ చేసి ₹10 చెల్లించాక, మీ యాప్ హిస్టరీలో ఉన్న <strong>12-అంకెల UTR / UPI Ref Number</strong> ను యాప్‌లో ఎంటర్ చేసి <strong>"📩 Submit UTR"</strong> నొక్కండి.</li>
                  <li>Admin వెరిఫై చేసిన తర్వాత <strong>"🔄 Re-Check License Now"</strong> క్లిక్ చేస్తే యాప్ వెంటనే ఓపెన్ అవుతుంది.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-slate-700">
                <strong className="text-amber-900 block font-bold">
                  2. Duplicate UTR &amp; Double-Payment నియమాలు
                </strong>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                  <li><strong>Unique UTR Lock:</strong> ప్రతి 12-అంకెల UTR నంబర్ కేవలం <strong>ఒక PC కి ఒక్కసారి మాత్రమే</strong> పనిచేస్తుంది. ఒకే UTR మళ్ళీ వేసినా లేదా వేరే PC కి షేర్ చేసినా సిస్టమ్ ఆటోమేటిక్‌గా బ్లాక్ చేస్తుంది.</li>
                  <li><strong>Double Payment రక్షణ:</strong> పొరపాటున ఒకే PC కోసం 2 సార్లు ₹10 చెల్లిస్తే (2 వేర్వేరు UTR లతో), Admin రెండు క్లెయిమ్‌లు అప్రూవ్ చేస్తే <strong>30 + 30 = 60 రోజుల వ్యాలిడిటీ</strong> లభిస్తుంది.</li>
                  <li><strong>Admin గోప్యత (Zero Calls):</strong> Admin <strong>Tab 7</strong> లో మొబైల్ నంబర్ లేని Alias UPI (<code>name@okaxis</code>) లేదా Razorpay Link వాడటం వలన ఎవరికీ మీ ఫోన్ నంబర్ కనిపించదు.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Installation & First-Run Guide Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900">Installation & First-Run Guide</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* English Side */}
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">1. Initial Setup</strong>
                  <p>Upon launching, select your environment profile (e.g., Grama Panchayat or Mandal Office) from the dropdown or settings menu.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">2. Registry Permissions</strong>
                  <p>Always right-click and select "Run as Administrator". This ensures the application has sufficient privileges to apply Internet Explorer Mode policies securely.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">3. First Deployment</strong>
                  <p>Navigate to the Dashboard tab and click the green 'Execute One-Click Deploy' button to automatically configure your system.</p>
                </div>
              </div>

              {/* Telugu Side */}
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <strong className="text-indigo-900 block font-bold">1. ప్రొఫైల్ సెటప్</strong>
                  <p>యాప్ ఓపెన్ చేసిన వెంటనే సెట్టింగ్స్ నుండి మీ ఆఫీస్ ప్రొఫైల్ (గ్రామ పంచాయతీ / మండల) ఎంచుకోండి.</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <strong className="text-indigo-900 block font-bold">2. అడ్మిన్ పర్మిషన్స్</strong>
                  <p>రిజిస్ట్రీ సెట్టింగ్స్ సరిగ్గా మారాలంటే యాప్‌ను కచ్చితంగా 'Run as Administrator' ద్వారా మాత్రమే ఓపెన్ చేయాలి.</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <strong className="text-indigo-900 block font-bold">3. మొదటి డిప్లాయ్‌మెంట్</strong>
                  <p>డాష్‌బోర్డ్‌లో ఉన్న 'Execute One-Click Deploy' నొక్కితే మొత్తం సెటప్ ఆటోమేటిక్‌గా పూర్తవుతుంది.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Troubleshooting Tips & Smart App Control Unblock Guide</h3>
            </div>
            
            {/* Special Callout: Windows 11 Smart App Control Fix */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                <span>Windows 11 Smart App Control (SAC) Blocking Issue Fix (స్మార్ట్ యాప్ కంట్రోల్ క్లియర్ చేసే పద్ధతి)</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Windows 11 లో కొత్తగా వచ్చిన <strong>Smart App Control</strong> డిజిటల్ సంతకం లేని థర్డ్-పార్టీ EXE ఫైళ్లను మొదటిసారి రన్ చేసినప్పుడు బ్లాక్ చేస్తుంది. దీనిని క్రింది 2 సులభమైన మార్గాల్లో క్లియర్ చేయవచ్చు:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-1">
                  <strong className="text-amber-900 block font-bold">మార్గం 1: Unblock File (Properties)</strong>
                  <p className="text-slate-600 font-sans">
                    <code>C:\Program Files (x86)\E-Vedhika UBD Tool\EVedhikaUBDDeploymentTool.exe</code> పైన Right-Click చేసి <strong>Properties</strong> ఎంచుకోండి. కింద ఉన్న <strong>Unblock</strong> బాక్స్ చెక్ చేసి <strong>Apply -&gt; OK</strong> నొక్కండి.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-1">
                  <strong className="text-amber-900 block font-bold">మార్గం 2: Smart App Control Off (Windows Security)</strong>
                  <p className="text-slate-600 font-sans">
                    <strong>Windows Security</strong> ఓపెన్ చేసి <strong>App &amp; browser control</strong> -&gt; <strong>Smart App Control settings</strong> లోకి వెళ్ళి <strong>Off</strong> లేదా <strong>Evaluation</strong> ఎంచుకోండి.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* English Side */}
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">1. How to run One-Click Deployment?</strong>
                  <p>Click the green "Execute One-Click Deploy" button on the Dashboard. The tool will run all automated steps sequentially.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">2. What if DSC Token is not detected?</strong>
                  <p>Go to the Driver Manager tab and verify WatchData ProxKey or HYP2003 drivers are installed. Re-insert the USB token.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">3. How to open UBD in Edge IE Mode?</strong>
                  <p>Launch Microsoft Edge. Open <code>ubd.telangana.gov.in</code>. Edge will display the IE compatibility icon automatically.</p>
                </div>
              </div>

              {/* Telugu Side */}
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <strong className="text-emerald-900 block font-bold">1. వన్-క్లిక్ డిప్లాయ్‌మెంట్ ఎలా చేయాలి?</strong>
                  <p>డాష్‌బోర్డ్‌లో ఉన్న "Execute One-Click Deploy" బటన్ క్లిక్ చేయండి. టూల్ మొత్తం స్టెప్స్ ఆటోమేటిక్‌గా రన్ చేస్తుంది.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <strong className="text-emerald-900 block font-bold">2. DSC టోకెన్ ఎర్రర్ వస్తే ఏం చేయాలి?</strong>
                  <p>డ్రైవర్ మేనేజర్ ట్యాబ్‌లోకి వెళ్ళి డ్రైవర్ ఇన్‌స్టాల్ అయిందో లేదో చూడండి. టోకెన్‌ను తీసి మళ్ళీ పెట్టండి.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <strong className="text-emerald-900 block font-bold">3. UBD పోర్టల్ ఓపెన్ చేయడం ఎలా?</strong>
                  <p>Microsoft Edge ఓపెన్ చేసి ubd.telangana.gov.in టైప్ చేయండి. ఆటోమేటిక్‌గా IE మోడ్‌లో ఓపెన్ అవుతుంది.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Complete Offline Manual</h3>
                <p className="text-xs text-slate-500">Download the full PDF guide containing all step-by-step instructions.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shrink-0">
              Download PDF
            </button>
          </div>
        </div>

        {/* Right Column: Telemetry & Contact */}
        <div className="space-y-6">
          
          {/* Telemetry Privacy Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Database className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Telemetry Data & Privacy</h3>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                The E-Vedhika deployment tool collects anonymized system configuration statuses (e.g., .NET framework version, DSC driver presence, IE Mode policies) purely for predictive health monitoring and central dashboard reporting.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Privacy Assured</span>
                </div>
                <p className="text-slate-500">
                  No personal data, user browsing history, or documents are ever collected or transmitted by this tool.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <LifeBuoy className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">Contact Information</h3>
            </div>
            <div className="text-xs text-slate-600 space-y-4">
              <p className="leading-relaxed">
                If you encounter any unresolved technical issues, hardware conflicts, or need direct assistance from our support engineering team, please report it via our official enterprise portal.
              </p>
              
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-rose-900 font-medium text-center">
                 <p className="mb-2">For assistance, please contact us at:</p>
                 <a href="https://www.e-vedhika.in/contact" target="_blank" rel="noreferrer" className="text-rose-700 font-bold underline flex items-center justify-center gap-1">
                   <Globe className="w-3 h-3" />
                   https://www.e-vedhika.in/contact
                 </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
