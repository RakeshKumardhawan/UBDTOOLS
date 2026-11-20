import React, { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, Copy, Send, RefreshCw, Clock } from 'lucide-react';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './Toast';
import {
  DEFAULT_LICENSE_POLICY,
  LicensePolicyConfig,
  PcLicenseRecord,
  buildClaimDocId,
  buildUpiPaymentUri,
  getUtrInputFeedback,
  isPcPaymentExempt,
  normalizeUtrNumber
} from '../utils/licensePolicy';

export const PublicPaymentCheckout: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [policy, setPolicy] = useState<LicensePolicyConfig>(DEFAULT_LICENSE_POLICY);
  const [pcLicense, setPcLicense] = useState<PcLicenseRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshingLicense, setRefreshingLicense] = useState<boolean>(false);
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
  const [stateInput, setStateInput] = useState<'Telangana' | 'Andhra Pradesh'>('Telangana');
  const [utrInput, setUtrInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedUtrTracking, setSubmittedUtrTracking] = useState<{ utr: string; pcId: string; approved: boolean } | null>(null);
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

  const fetchPcLicenseFromServer = useCallback(async (rawPcId: string, showFeedback: boolean = false) => {
    const cleanPcId = rawPcId.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
    if (!cleanPcId) {
      setPcLicense(null);
      return null;
    }
    setRefreshingLicense(true);
    try {
      const snap = await getDocFromServer(doc(db, 'pc_licenses', cleanPcId));
      if (snap.exists()) {
        const d: any = snap.data();
        const rec: PcLicenseRecord = {
          pcId: d.pcId || cleanPcId,
          pcName: d.pcName || '',
          planType: d.planType === 'FREE_ACCESS' ? 'FREE_ACCESS' : 'PAID_30_DAYS',
          status: d.status || 'ACTIVE',
          amountInr: Number(d.amountInr ?? 0),
          validUntilIso: String(d.validUntilIso || ''),
          paymentRef: String(d.paymentRef || '')
        };
        setPcLicense(rec);
        if (showFeedback) {
          showInfo(`PC (${cleanPcId}) లైసెన్స్ స్టేటస్ అప్డేట్ అయింది.`, 'Status Refreshed');
        }
        return rec;
      }
      setPcLicense(null);
      if (showFeedback) {
        showInfo(`PC (${cleanPcId}) కు ఇంకా యాక్టివ్ పెయిడ్ లైసెన్స్ రికార్డ్ లేదు.`, 'Status Refreshed');
      }
      return null;
    } catch {
      return null;
    } finally {
      setRefreshingLicense(false);
    }
  }, [showInfo]);

  useEffect(() => {
    const cleanPcId = pcIdInput.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
    if (!cleanPcId) {
      setPcLicense(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void fetchPcLicenseFromServer(cleanPcId, false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [pcIdInput, fetchPcLicenseFromServer]);

  // Live auto-poll pc_licenses/{pcId} every 12 seconds after UTR submission until Admin approves
  useEffect(() => {
    if (!submittedUtrTracking || submittedUtrTracking.approved) return;
    const interval = window.setInterval(async () => {
      const rec = await fetchPcLicenseFromServer(submittedUtrTracking.pcId, false);
      if (!rec) return;
      const expiryMs = Date.parse(rec.validUntilIso || '');
      const matchesUtr = String(rec.paymentRef || '').toUpperCase().includes(submittedUtrTracking.utr.toUpperCase());
      const isActiveNow =
        isPcPaymentExempt(rec) ||
        (rec.status === 'ACTIVE' && !Number.isNaN(expiryMs) && expiryMs > Date.now() && matchesUtr);
      if (isActiveNow) {
        setSubmittedUtrTracking((prev) => (prev ? { ...prev, approved: true } : prev));
        showSuccess('Admin గారు మీ UTR ను అప్రూవ్ చేశారు! మీ PC లైసెన్స్ ఇప్పుడు యాక్టివ్ అయింది.', 'Subscription Activated');
      }
    }, 12000);
    return () => window.clearInterval(interval);
  }, [submittedUtrTracking, fetchPcLicenseFromServer, showSuccess]);

  const upiUri = policy.upiId ? buildUpiPaymentUri(policy.upiId, policy.monthlyPriceInr, pcIdInput) : '';
  const isExemptPc = isPcPaymentExempt(pcLicense);
  const utrFeedback = getUtrInputFeedback(utrInput);

  const pcExpiryMs = pcLicense?.validUntilIso ? Date.parse(pcLicense.validUntilIso) : NaN;
  const isActivePaidPc = Boolean(
    pcLicense &&
    !isExemptPc &&
    pcLicense.status === 'ACTIVE' &&
    !Number.isNaN(pcExpiryMs) &&
    pcExpiryMs > Date.now()
  );
  const activeDaysLeft = isActivePaidPc ? Math.max(1, Math.ceil((pcExpiryMs - Date.now()) / 86400000)) : 0;

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

    const safePcId = (pcIdInput.trim() || pcNameInput.trim() || 'EVD-WEB-PC')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 120);
    if (!safePcId) {
      setSubmitState({ type: 'error', text: 'మీ PC Machine ID తప్పనిసరిగా ఇవ్వండి.' });
      return;
    }

    const cleanPcName = (pcNameInput.trim() || safePcId).slice(0, 128);
    const cleanOperator = (operatorInput.trim() || 'Operator').slice(0, 128);
    const cleanDistrict = (districtInput.trim() || 'District').slice(0, 100);

    setSubmitting(true);
    try {
      await setDoc(doc(db, 'payment_claims', claimId), {
        claimId,
        utrNumber: cleanUtr,
        pcId: safePcId,
        pcName: cleanPcName,
        operatorName: cleanOperator,
        district: cleanDistrict,
        state: stateInput,
        amountInr: Math.max(1, Math.min(10000, Number(policy.monthlyPriceInr || 10))),
        status: 'PENDING',
        note: `Submitted via QR Checkout Portal (?pay=1) for ₹${policy.monthlyPriceInr}/${policy.durationDays}d`,
        createdAt: serverTimestamp()
      });

      setSubmittedUtrTracking({ utr: cleanUtr, pcId: safePcId, approved: false });
      setSubmitState({
        type: 'success',
        text: `UTR (${cleanUtr}) Admin క్యూకు చేరింది! ఈ పేజీ మరియు మీ డెస్క్‌టాప్ యాప్ ప్రతి 10–12 సెకన్లకు ఆటో-చెక్ చేస్తాయి.`
      });
      showSuccess(`UTR ${cleanUtr} submitted for verification!`, 'UTR Submitted');
      setUtrInput('');

      try {
        const tgMsg = `💳 <b>NEW UTR PAYMENT CLAIM</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🔑 <b>UTR:</b> <code>${cleanUtr}</code>\n` +
          `🖥️ <b>PC Name:</b> ${cleanPcName} (<code>${safePcId}</code>)\n` +
          `👤 <b>Operator:</b> ${cleanOperator}\n` +
          `📍 <b>District:</b> ${cleanDistrict} (${stateInput})\n` +
          `💰 <b>Amount:</b> ₹${policy.monthlyPriceInr || 10} / ${policy.durationDays || 30}d\n` +
          `━━━━━━━━━━━━━━━━━━━━━━`;
        await fetch('https://api.telegram.org/bot8681492578:AAH23013347X5tI6qU5E6z2D2u1R3S0P1O0/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: '431228008',
            text: tgMsg,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `✅ Open Admin Hub & Review ${cleanUtr}`,
                    url: `https://rakeshkumardhawan.github.io/UBDTOOLS/admin/?section=payments&utr=${cleanUtr}`
                  }
                ]
              ]
            }
          })
        });
      } catch {}
    } catch (err: any) {
      const code = String(err?.code || err?.message || '').toLowerCase();
      if (code.includes('permission') || code.includes('already-exists')) {
        setSubmitState({
          type: 'error',
          text: `Duplicate / Already Used UTR! ఈ UTR (${cleanUtr}) ఇప్పటికే వేరే/పాత క్లెయిమ్‌లో వాడబడింది. ప్రతి చెల్లింపునకు కొత్త 12-అంకెల UTR మాత్రమే ఇవ్వండి.`
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
              isExemptPc
                ? 'bg-violet-500/20 text-violet-200 border border-violet-400/40'
                : isActivePaidPc
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : policy.mode === 'FREE_FOR_ALL'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {loading
              ? 'Checking Mode...'
              : isExemptPc
                ? 'Payment Mode OFF for this PC'
                : isActivePaidPc
                  ? `Active Paid (${activeDaysLeft}d Left)`
                  : policy.mode === 'FREE_FOR_ALL'
                    ? 'Currently Free for All'
                    : `Paid Plan (₹${policy.monthlyPriceInr}/${policy.durationDays}d)`}
          </span>
        </div>

        {/* 3-Step Visual Progress Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-black flex items-center justify-center shrink-0">1</span>
            <div>
              <div className="font-bold text-white">Scan QR &amp; Pay ₹{policy.monthlyPriceInr}</div>
              <div className="text-[10px] text-slate-400">PhonePe / GPay / Paytm / BHIM</div>
            </div>
          </div>
          <div className="bg-slate-950 border border-amber-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-black flex items-center justify-center shrink-0">2</span>
            <div>
              <div className="font-bold text-white">Submit 12-Digit UTR</div>
              <div className="text-[10px] text-slate-400">Instant Anti-Duplicate Check</div>
            </div>
          </div>
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center shrink-0">3</span>
            <div>
              <div className="font-bold text-white">Auto-Unlock in App</div>
              <div className="text-[10px] text-slate-400">Auto-checks every 10s (No Calls)</div>
            </div>
          </div>
        </div>

        {/* Live PC License Status Bar */}
        {pcIdInput.trim() && (
          <div
            className={`rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
              isExemptPc
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-100'
                : isActivePaidPc
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
                  : pcLicense?.status === 'REVOKED'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-100'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isExemptPc || isActivePaidPc ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-white">
                  {isExemptPc
                    ? `ఈ PC (${pcIdInput}) కి Admin గారు Payment Mode OFF చేశారు (100% Free Access)!`
                    : isActivePaidPc
                      ? `యాక్టివ్ సబ్‌స్క్రిప్షన్ ఉంది — ${activeDaysLeft} రోజులు మిగిలి ఉన్నాయి (Valid until ${new Date(pcLicense!.validUntilIso).toLocaleDateString()})`
                      : pcLicense?.status === 'REVOKED'
                        ? `ఈ PC (${pcIdInput}) లైసెన్స్ నిలిపివేయబడింది (Revoked). పునరుద్ధరణకు క్రింద చెల్లించండి.`
                        : `PC (${pcIdInput}) స్టేటస్: ${policy.mode === 'FREE_FOR_ALL' ? 'Free Access Active' : 'Payment / Admin Activation Pending'}`}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {isExemptPc || isActivePaidPc
                    ? 'మీ డెస్క్‌టాప్ యాప్ ఆటోమేటిక్‌గా అన్‌లాక్ అవుతుంది లేదా "Re-Check License Now" క్లిక్ చేయండి.'
                    : 'చెల్లింపు చేసి 12-అంకెల UTR సమర్పించిన తర్వాత Admin అప్రూవ్ చేసిన వెంటనే యాక్టివేట్ అవుతుంది.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingLicense}
              onClick={() => fetchPcLicenseFromServer(pcIdInput, true)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingLicense ? 'animate-spin' : ''}`} />
              <span>{refreshingLicense ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
        )}

        {/* Live Post-Submission UTR Tracker Banner */}
        {submittedUtrTracking && (
          <div
            className={`rounded-2xl p-4 text-xs border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              submittedUtrTracking.approved
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {submittedUtrTracking.approved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-white">
                  {submittedUtrTracking.approved
                    ? `UTR ${submittedUtrTracking.utr} Approved! మీ PC లైసెన్స్ యాక్టివేట్ అయింది.`
                    : `Live Verification Tracker — UTR ${submittedUtrTracking.utr} (Admin Approval Pending)`}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {submittedUtrTracking.approved
                    ? 'మీ డెస్క్‌టాప్ అప్లికేషన్ ఇప్పుడు పూర్తిగా అన్‌లాక్ అయింది. మీరు UBD డిప్లాయ్‌మెంట్ కొనసాగించవచ్చు.'
                    : 'ఈ పేజీ ప్రతి 12 సెకన్లకు ఆటోమేటిక్‌గా మీ PC లైసెన్స్ స్టేటస్ చెక్ చేస్తోంది. Admin అప్రూవ్ చేసిన వెంటనే ఇక్కడ గ్రీన్ అవుతుంది.'}
                </div>
              </div>
            </div>
            {!submittedUtrTracking.approved && (
              <button
                type="button"
                onClick={() => fetchPcLicenseFromServer(submittedUtrTracking.pcId, true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shrink-0 cursor-pointer"
              >
                Check Approval Now
              </button>
            )}
          </div>
        )}

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
            ) : policy.paymentLinkUrl && /^https?:\/\//i.test(policy.paymentLinkUrl) ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG value={policy.paymentLinkUrl} size={196} level="M" includeMargin={false} />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center p-4 text-xs text-slate-400">
                Admin గారు License Control లో Merchant / Alias UPI ID లేదా Payment Link సెట్ చేసిన వెంటనే QR ఇక్కడ వస్తుంది.
              </div>
            )}

            <div className="space-y-1.5 w-full">
              <div className="text-sm font-black text-white">
                Pay ₹{policy.monthlyPriceInr} • Validity: {policy.durationDays} Days
              </div>
              {pcLicense && !isExemptPc && (
                <div className="text-[11px] font-mono text-cyan-300">
                  PC Plan: {pcLicense.status} {pcLicense.validUntilIso ? `• Until ${new Date(pcLicense.validUntilIso).toLocaleDateString()}` : ''}
                </div>
              )}
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

            {upiUri && (
              <a
                href={upiUri}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open UPI App (PhonePe / GPay / Paytm)</span>
              </a>
            )}

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
              <label htmlFor="checkout-pc-id" className="block text-[11px] font-bold text-slate-300 mb-1">PC MACHINE ID *</label>
              <div className="flex items-center gap-2">
                <input
                  id="checkout-pc-id"
                  type="text"
                  required
                  placeholder="ఉదా: EVD-TS-MNCL-01"
                  value={pcIdInput}
                  onChange={(e) => setPcIdInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
                />
                {pcIdInput.trim() && (
                  <button
                    type="button"
                    aria-label="Copy PC Machine ID"
                    onClick={() => {
                      navigator.clipboard.writeText(pcIdInput.trim());
                      showInfo('PC Machine ID కాపీ అయింది!', 'Copied');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="checkout-pc-name" className="block text-[11px] font-bold text-slate-300 mb-1">PC NAME</label>
                <input
                  id="checkout-pc-name"
                  type="text"
                  placeholder="GP-OFFICE-PC"
                  value={pcNameInput}
                  onChange={(e) => setPcNameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label htmlFor="checkout-district" className="block text-[11px] font-bold text-slate-300 mb-1">DISTRICT / MANDAL</label>
                <input
                  id="checkout-district"
                  type="text"
                  placeholder="Mancherial"
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="checkout-state" className="block text-[11px] font-bold text-slate-300 mb-1">STATE (రాష్ట్రం)</label>
                <select
                  id="checkout-state"
                  value={stateInput}
                  onChange={(e) => setStateInput(e.target.value === 'Andhra Pradesh' ? 'Andhra Pradesh' : 'Telangana')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>
              <div>
                <label htmlFor="checkout-operator" className="block text-[11px] font-bold text-slate-300 mb-1">OPERATOR NAME</label>
                <input
                  id="checkout-operator"
                  type="text"
                  placeholder="మీ పేరు"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout-utr" className="block text-[11px] font-bold text-amber-300 mb-1">12-DIGIT UPI UTR / REF NUMBER *</label>
              <input
                id="checkout-utr"
                type="text"
                required
                placeholder="ఉదా: 432198765432"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white ${
                  utrFeedback.tone === 'ready'
                    ? 'border-emerald-500/60'
                    : utrFeedback.tone === 'error'
                      ? 'border-rose-500/60'
                      : 'border-amber-500/40'
                }`}
              />
              <div
                className={`text-[11px] mt-1.5 font-medium ${
                  utrFeedback.tone === 'ready'
                    ? 'text-emerald-400'
                    : utrFeedback.tone === 'warning'
                      ? 'text-amber-300'
                      : utrFeedback.tone === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                }`}
              >
                {utrFeedback.message}
              </div>
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
              <span>{submitting ? 'Submitting UTR...' : 'Submit Payment UTR for Verification'}</span>
            </button>
          </form>
        </div>

        {/* Clear Payment & Anti-Duplicate UTR Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
          <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
            పేమెంట్ &amp; UTR సూచనలు (Important Payment Instructions)
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
                UTR పంపిన తర్వాత ఫోన్ కాల్స్ చేయవలసిన అవసరం లేదు. Admin అప్రూవ్ చేసిన వెంటనే మీ డెస్క్‌టాప్ యాప్ 10 సెకన్లలో ఆటోమేటిక్‌గా అన్‌లాక్ అవుతుంది.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

