import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, Copy, Send } from 'lucide-react';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './Toast';
import {
  DEFAULT_LICENSE_POLICY,
  LicensePolicyConfig,
  buildClaimDocId,
  buildUpiPaymentUri,
  normalizeUtrNumber
} from '../utils/licensePolicy';

export const PublicPaymentCheckout: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [policy, setPolicy] = useState<LicensePolicyConfig>(DEFAULT_LICENSE_POLICY);
  const [loading, setLoading] = useState<boolean>(true);
  const [pcIdInput, setPcIdInput] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('pcId') || '').trim();
  });
  const [pcNameInput, setPcNameInput] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('pcName') || '').trim();
  });
  const [operatorInput, setOperatorInput] = useState<string>('');
  const [districtInput, setDistrictInput] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDocFromServer(doc(db, 'app_settings', 'licensing'));
        if (active && snap.exists()) {
          const d: any = snap.data();
          setPolicy({
            policyId: 'licensing',
            mode: d.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL',
            monthlyPriceInr: Number(d.monthlyPriceInr ?? 10),
            durationDays: Number(d.durationDays ?? 30),
            upiId: String(d.upiId || ''),
            paymentLinkUrl: String(d.paymentLinkUrl || ''),
            paymentNote: String(d.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote)
          });
        }
      } catch {
        // Fallback to defaults silently if network limited
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const upiUri = policy.upiId ? buildUpiPaymentUri(policy.upiId, policy.monthlyPriceInr, pcIdInput) : '';

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState(null);

    const cleanUtr = normalizeUtrNumber(utrInput);
    const claimId = buildClaimDocId(cleanUtr);
    if (!claimId) {
      setSubmitState({
        type: 'error',
        text: 'సరైన 12-అంకెల UPI UTR / Ref Number (కనీసం 8–36 అక్షరాలు/అంకెలు) ఎంటర్ చేయండి.'
      });
      return;
    }

    const safePcId = (pcIdInput || pcNameInput || 'EVD-WEB-PC').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    if (!safePcId) {
      setSubmitState({ type: 'error', text: 'మీ PC Machine ID తప్పనిసరిగా ఇవ్వండి.' });
      return;
    }

    setSubmitting(true);
    try {
      await setDoc(doc(db, 'payment_claims', claimId), {
        claimId,
        utrNumber: cleanUtr,
        pcId: safePcId,
        pcName: (pcNameInput || safePcId).slice(0, 128),
        operatorName: (operatorInput || 'Operator').slice(0, 128),
        district: (districtInput || 'District').slice(0, 100),
        state: 'Telangana',
        amountInr: Math.max(1, Number(policy.monthlyPriceInr || 10)),
        status: 'PENDING',
        note: `Submitted via QR Checkout Portal (?pay=1) for ₹${policy.monthlyPriceInr}/${policy.durationDays}d`,
        createdAt: serverTimestamp()
      });

      setSubmitState({
        type: 'success',
        text: `✅ UTR (${cleanUtr}) Admin క్యూకు చేరింది! Admin గారు వెరిఫై చేసిన తర్వాత మీ యాప్‌లో "🔄 Re-Check License Now" క్లిక్ చేయండి.`
      });
      showSuccess(`UTR ${cleanUtr} submitted for verification!`, 'UTR Submitted');
      setUtrInput('');
    } catch (err: any) {
      const code = String(err?.code || err?.message || '').toLowerCase();
      if (code.includes('permission') || code.includes('already-exists')) {
        setSubmitState({
          type: 'error',
          text: `🚫 Duplicate / Already Used UTR! ఈ UTR (${cleanUtr}) ఇప్పటికే వేరే/పాత క్లెయిమ్‌లో వాడబడింది. ప్రతి చెల్లింపునకు కొత్త 12-అంకెల UTR మాత్రమే ఇవ్వండి.`
        });
        showError('Duplicate UTR rejected!', 'Duplicate UTR Blocked');
      } else {
        setSubmitState({
          type: 'error',
          text: `సమర్పించడంలో లోపం: ${err?.message || 'Unknown error'}`
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Private &amp; Zero-Call Secure UPI Checkout</span>
            </div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <span>E-Vedhika Subscription Checkout — ₹{policy.monthlyPriceInr} / {policy.durationDays} Days</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ఫోన్ కాల్స్ లేకుండా PhonePe / GPay / Paytm తో QR స్కాన్ చేసి ₹{policy.monthlyPriceInr} చెల్లించండి — 12-అంకెల UTR ఇక్కడ సమర్పించండి.
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold self-start ${
              policy.mode === 'FREE_FOR_ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {loading ? 'Checking Mode...' : policy.mode === 'FREE_FOR_ALL' ? '🟢 Currently Free for All' : `💳 Paid Plan (₹${policy.monthlyPriceInr}/Mo)`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Scannable QR Code / Gateway Link */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-4">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              1. Scan with PhonePe / GPay / BHIM (Mobile)
            </div>

            {upiUri ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG value={upiUri} size={196} level="M" includeMargin={false} />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center p-4 text-xs text-slate-400">
                Admin గారు Tab 7 లో Merchant / Alias UPI ID లేదా Payment Link సెట్ చేసిన వెంటనే QR ఇక్కడ వస్తుంది.
              </div>
            )}

            <div className="space-y-1.5 w-full">
              <div className="text-sm font-black text-white">
                Pay ₹{policy.monthlyPriceInr} • Validity: {policy.durationDays} Days
              </div>
              {policy.upiId && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 bg-slate-900 border border-slate-800 rounded-xl py-2 px-3">
                  <span className="font-mono font-bold truncate">{policy.upiId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(policy.upiId);
                      showInfo('UPI ID కాపీ అయింది!', 'Copied');
                    }}
                    className="p-1 hover:text-white cursor-pointer"
                    aria-label="Copy UPI ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {policy.paymentLinkUrl && /^https?:\/\//i.test(policy.paymentLinkUrl) && (
              <a
                href={policy.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Pay ₹{policy.monthlyPriceInr} via Secure Payment Gateway</span>
              </a>
            )}
          </div>

          {/* Right: Anti-Duplicate 12-Digit UTR Claim Form */}
          <form onSubmit={handleSubmitUtr} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              2. Submit 12-Digit UPI UTR / Ref Number
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">PC MACHINE ID *</label>
              <input
                type="text"
                required
                placeholder="ఉదా: EVD-TS-MNCL-01"
                value={pcIdInput}
                onChange={(e) => setPcIdInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">PC NAME</label>
                <input
                  type="text"
                  placeholder="GP-OFFICE-PC"
                  value={pcNameInput}
                  onChange={(e) => setPcNameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">DISTRICT / MANDAL</label>
                <input
                  type="text"
                  placeholder="Mancherial"
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">OPERATOR NAME</label>
              <input
                type="text"
                placeholder="మీ పేరు"
                value={operatorInput}
                onChange={(e) => setOperatorInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-300 mb-1">12-DIGIT UPI UTR / REF NUMBER *</label>
              <input
                type="text"
                required
                placeholder="ఉదా: 432198765432"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white"
              />
            </div>

            {submitState && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  submitState.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {submitState.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{submitState.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting UTR...' : '📩 Submit Payment UTR for Verification'}</span>
            </button>
          </form>
        </div>

        {/* Clear Payment & Anti-Duplicate UTR Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
          <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
            📌 పేమెంట్ &amp; UTR సూచనలు (Important Payment Instructions)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 leading-relaxed">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="font-bold text-white">1. 12-Digit UTR ఎక్కడ ఉంటుంది?</div>
              <p className="text-[11px] text-slate-400">
                PhonePe / GPay / Paytm లో చెల్లింపు పూర్తయ్యాక "View Details" లో <strong>UTR / UPI Ref. ID</strong> (12 అంకెలు) కనిపిస్తుంది. దానిని పైన ఎంటర్ చేయండి.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="font-bold text-amber-300">2. Duplicate UTR అంగీకరించబడదు</div>
              <p className="text-[11px] text-slate-400">
                ఒకసారి వాడిన UTR మళ్ళీ పంపితే సిస్టమ్ ఆటోమేటిక్‌గా బ్లాక్ చేస్తుంది. పొరపాటున 2 సార్లు కడితే 2వ కొత్త UTR తో 30+30 = 60 రోజులు యాడ్ అవుతాయి.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="font-bold text-cyan-300">3. వెరిఫికేషన్ తర్వాత ఏం చేయాలి?</div>
              <p className="text-[11px] text-slate-400">
                UTR పంపిన తర్వాత ఫోన్ కాల్స్ చేయవలసిన అవసరం లేదు. Admin అప్రూవ్ చేసిన వెంటనే మీ డెస్క్‌టాప్ యాప్ లో <strong>"🔄 Re-Check License Now"</strong> క్లిక్ చేయండి.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
