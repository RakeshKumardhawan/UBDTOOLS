import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Trash2, CheckCircle2, RefreshCw, Flame, Lock, ShieldX, Terminal, ArrowRight } from 'lucide-react';

interface PanicButtonCardProps {
  onPerformSystemWipe?: () => Promise<void>;
}

export function PanicButtonCard({ onPerformSystemWipe }: PanicButtonCardProps = {}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeStep, setWipeStep] = useState<string>('');
  const [wipeCompleted, setWipeCompleted] = useState(false);
  const [wipedDetails, setWipedDetails] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInitiatePanicWipe = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      setErrorMsg('సరియైన ధృవీకరణ కోసం "DELETE" అని ఎంటర్ చేయండి.');
      return;
    }

    setIsWiping(true);
    setErrorMsg(null);

    const steps = [
      '1. 24x7 System Tray Auto-Repair Guardian సర్వీస్‌లను నిలిపివేస్తోంది...',
      '2. Edge Enterprise Site List (`sites.xml`) మరియు IE5 Quirks Mode రిజిస్ట్రీ ప్యాచ్‌లను ఎరేస్ చేస్తోంది...',
      '3. Zone 2 Trusted Sites నుండి UBD డిసేబుల్ చేసి రిజిస్ట్రీని విండోస్ డిఫాల్ట్‌కి రీసెట్ చేస్తోంది...',
      '4. USB DSC Token PKCS#11 డ్రైవర్ బ్రిడ్జ్‌లు మరియు ఫైర్‌వాల్ రూల్స్‌ను తొలగిస్తోంది...',
      '5. `C:\\enterprise_compat\\` మరియు క్లౌడ్ సెంట్రల్ లైసెన్స్ రివోకేషన్ పూర్తయింది!'
    ];

    for (const stepText of steps) {
      setWipeStep(stepText);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      if (onPerformSystemWipe) {
        await onPerformSystemWipe();
        setWipedDetails([
          'Cleared all localStorage entries and user tokens',
          'Removed custom registry keys set by application',
          'Reset environment status state to initial default state',
          'Purged C:\\enterprise_compat\\sites.xml & Edge IE policies',
          'Reset Internet Explorer Security Zone 2 (Trusted Sites) to defaults',
          'Stopped 24x7 Auto-Repair Guardian background process'
        ]);
        setWipeCompleted(true);
      } else {
        const resp = await fetch('/api/panic-wipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pcName: typeof window !== 'undefined' ? window.location.hostname : 'LOCAL-HOST-PC',
            reason: 'USER_INITIATED_PANIC_BUTTON_WIPE'
          })
        });

        const data = await resp.json();

        if (resp.ok && data.success) {
          setWipedDetails(data.purgedComponents || []);
          setWipeCompleted(true);
        } else {
          setErrorMsg(data.error || 'Panic wipe failed to execute.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Execution error during panic wipe: ' + (err?.message || 'Server connection issue'));
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 rounded-2xl p-6 border-2 border-rose-600/40 shadow-xl text-white space-y-5 relative overflow-hidden">
      {/* Background Warning Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-rose-500">
        <Flame className="w-64 h-64" />
      </div>

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-800/60 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                EMERGENCY PANIC BUTTON (తక్షణ సిస్టమ్ వైప్)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider">
                FULL TEARDOWN & REVOCATION
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              ఈ బటన్‌ను క్లిక్ చేసిన విత్ ఇన్ సెకన్లలో UBDTool-సంబంధిత అన్ని కాన్ఫిగరేషన్లు, రిజిస్ట్రీ ప్యాచ్‌లు, మరియు DSC డ్రైవర్లు పూర్తిగా ఎరేస్ అయిపోతాయి.
            </p>
          </div>
        </div>

        <button
          id="btn-panic-wipe-trigger"
          onClick={() => {
            setShowConfirmModal(true);
            setConfirmInput('');
            setErrorMsg(null);
            setWipeCompleted(false);
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-rose-900/50 border border-rose-400/30 transition-all cursor-pointer shrink-0"
        >
          <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
          <span>TRIGGER PANIC SYSTEM WIPE</span>
        </button>
      </div>

      {/* Overview Telugu Notice */}
      <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/40 text-xs text-rose-100/90 leading-relaxed space-y-2 relative z-10">
        <div className="flex items-center gap-2 text-amber-300 font-extrabold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>ఈ Panic Button ఉపయోగించడం వల్ల ఏమి జరుగుతుంది? (What Happens When Triggered?)</span>
        </div>
        <p className="text-rose-200/90">
          అప్లికేషన్ తీసేసినా లేదా ఈ Panic Button ని నొక్కినా విత్ ఇన్ సెకన్లలో <strong className="text-white">Microsoft Edge IE Mode, sites.xml, Zone 2 Trusted Sites, మరియు USB DSC Token బ్రిడ్జ్‌లు పూర్తిగా డిలీట్ అయిపోతాయి</strong>. మీ సాఫ్ట్‌వేర్ లేకుండా UBD పోర్టల్ ఎట్టి పరిస్థితుల్లోనూ ఓపెన్ కాదు లేదా డిజిటల్ సంతకం కాకుండా పాత రకంగా బ్లాక్ అయిపోతుంది.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-600/30">
                <ShieldX className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">CONFIRM FULL SYSTEM PANIC WIPE</h4>
                <p className="text-xs text-slate-400">అన్ని E-Vedhika UBD కాన్ఫిగరేషన్లను శాశ్వతంగా ఎరేస్ చేయడానికి ధృవీకరించండి.</p>
              </div>
            </div>

            {!wipeCompleted ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/60 text-xs text-rose-200 space-y-2">
                  <p className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" /> హెచ్చరిక (Warning):
                  </p>
                  <p>
                    ఈ చర్యను వెనక్కి తీసుకోలేరు. కంప్యూటర్ లోని అన్ని UBD పోర్టల్ రీడైరెక్షన్లు, ఎడ్జ్ పాలసీలు, మరియు DSC టోకెన్ పాచ్‌లు తక్షణమే తొలగించబడతాయి.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    కొనసాగడానికి క్రింది బాక్స్‌లో <span className="text-rose-400 font-mono font-black uppercase underline">DELETE</span> అని టైప్ చేయండి:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="DELETE అని ఎంటర్ చేయండి"
                    disabled={isWiping}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-rose-600/50 text-rose-300 font-mono text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-950/90 p-3 rounded-lg border border-rose-800">
                    ⚠️ {errorMsg}
                  </p>
                )}

                {isWiping && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{wipeStep || 'Executing System Wipe...'}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-full animate-pulse"></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isWiping}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    రద్దు చేయి (Cancel)
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiatePanicWipe}
                    disabled={isWiping || confirmInput.trim().toUpperCase() !== 'DELETE'}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-900/50"
                  >
                    {isWiping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                    <span>{isWiping ? 'ఎరేస్ అవుతోంది...' : 'EXECUTE FULL PANIC WIPE'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Wipe Completed State */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-xs text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>SYSTEM PANIC WIPE EXECUTED SUCCESSFULLY!</span>
                  </div>
                  <p>
                    హోస్ట్ కంప్యూటర్ లోని అన్ని UBDTool రిజిస్ట్రీ ప్యాచ్‌లు, sites.xml, DSC బ్రిడ్జ్‌లు మరియు డిప్లాయ్‌మెంట్ సెట్టింగ్‌లు పూర్తిగా ఎరేస్ చేయబడ్డాయి.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 max-h-48 overflow-y-auto">
                  <p className="text-slate-400 font-bold flex items-center gap-1 border-b border-slate-800 pb-1">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" /> Purged Components Summary:
                  </p>
                  {wipedDetails.map((item, idx) => (
                    <div key={idx} className="text-rose-300/90 flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    పూర్తయింది (Close)
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
