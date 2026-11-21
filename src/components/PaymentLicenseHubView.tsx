import React, { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ShieldCheck, LogOut, QrCode, SlidersHorizontal, Copy, Search, Download, Link2, Cloud, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from './Toast';
import { PublicPaymentCheckout } from './PublicPaymentCheckout';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
  ADMIN_EMAIL
} from '../firebase';
import {
  DEFAULT_LICENSE_POLICY,
  LicensePolicyConfig,
  PcLicenseRecord,
  PaymentClaimRecord,
  computeRenewalExpiryIso,
  evaluateLicenseState,
  isPcPaymentExempt,
  inspectPaymentClaimDuplicate,
  detectPhoneExposedInUpi,
  buildUpiPaymentUri,
  computePaymentHubStats,
  filterPaymentClaims,
  buildOperatorCheckoutUrl,
  buildPaymentsCsv
} from '../utils/licensePolicy';
import {
  CLOUDFLARE_WORKER_DASHBOARD_URL,
  checkCloudflareWorkerHealth,
  deleteWorkerClaim,
  discoverCloudflareWorkerUrl,
  fetchWorkerAdminState,
  isDashboardLinkNotWorkerUrl,
  normalizeCloudflareWorkerUrl,
  resetMultipleWorkerPcLicenses,
  resetWorkerPcLicense,
  reviewWorkerClaim,
  saveCloudflareWorkerUrl,
  saveWorkerPcLicense,
  saveWorkerPolicy
} from '../utils/cloudflareWorkerClient';
import { CLOUDFLARE_WORKER_SOURCE } from '../utils/cloudflareWorkerSource';

interface PaymentLicenseHubViewProps {
  defaultSubTab?: 'qr-checkout' | 'admin-controls';
}

export const PaymentLicenseHubView: React.FC<PaymentLicenseHubViewProps> = ({
  defaultSubTab = 'qr-checkout'
}) => {
  const { showInfo, showSuccess, showError } = useToast();

  const [subTab, setSubTab] = useState<'qr-checkout' | 'admin-controls'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('pay') === '1') return 'qr-checkout';
      if (params.get('section') === 'admin-license') return 'admin-controls';
    } catch {}
    return defaultSubTab;
  });

  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authNotice, setAuthNotice] = useState<string>('');

  const [licensePolicy, setLicensePolicy] = useState<LicensePolicyConfig>(DEFAULT_LICENSE_POLICY);
  const [pcLicensesMap, setPcLicensesMap] = useState<Record<string, PcLicenseRecord>>({});
  const [paymentClaims, setPaymentClaims] = useState<PaymentClaimRecord[]>([]);
  const [installedPcs, setInstalledPcs] = useState<any[]>([]);

  const [savingPolicy, setSavingPolicy] = useState<boolean>(false);
  const [activatingPcId, setActivatingPcId] = useState<string | null>(null);
  const [reviewingClaimId, setReviewingClaimId] = useState<string | null>(null);
  const [bypassPcIdInput, setBypassPcIdInput] = useState<string>('');
  const [bypassPcNameInput, setBypassPcNameInput] = useState<string>('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [claimSearchFilter, setClaimSearchFilter] = useState<string>('');
  const [pcSearchFilter, setPcSearchFilter] = useState<string>('');
  const [customActivateDays, setCustomActivateDays] = useState<number>(30);
  const [confirmBulkApprove, setConfirmBulkApprove] = useState<boolean>(false);
  const [bulkApproving, setBulkApproving] = useState<boolean>(false);
  const [confirmResetPc, setConfirmResetPc] = useState<{ pcId: string; pcName: string } | null>(null);
  const [confirmResetAllOverrides, setConfirmResetAllOverrides] = useState<boolean>(false);
  const [resettingAllOverrides, setResettingAllOverrides] = useState<boolean>(false);
  const [confirmDeleteClaim, setConfirmDeleteClaim] = useState<PaymentClaimRecord | null>(null);
  const [deletingClaimId, setDeletingClaimId] = useState<string | null>(null);

  // Cloudflare Worker (`ubdtools`) Zero-Quota License Engine state
  const [cfWorkerUrlInput, setCfWorkerUrlInput] = useState<string>('');
  const [activeCfWorkerUrl, setActiveCfWorkerUrl] = useState<string>('');
  const [cfWorkerStatus, setCfWorkerStatus] = useState<'idle' | 'testing' | 'connected' | 'kv-missing' | 'error'>('idle');
  const [cfWorkerMessage, setCfWorkerMessage] = useState<string>('');
  const [cfSyncing, setCfSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (u && u.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthNotice(`Signed in as ${u.email}. Admin controls require ${ADMIN_EMAIL}.`);
      } else {
        setAuthNotice('');
      }
    });
    try {
      const params = new URLSearchParams(window.location.search);
      const utrParam = params.get('utr');
      if (utrParam) {
        setClaimStatusFilter('ALL');
        setClaimSearchFilter(utrParam);
        setPcSearchFilter(utrParam);
      }
    } catch {}
    return () => unsub();
  }, []);

  const isVerifiedAdmin = Boolean(
    authReady &&
    firebaseUser &&
    firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const syncFromCloudflareWorker = useCallback(
    async (workerBaseUrl: string, showToastOnSuccess: boolean = false) => {
      if (!workerBaseUrl || !firebaseUser) return false;
      setCfSyncing(true);
      try {
        const idToken = await firebaseUser.getIdToken();
        const state = await fetchWorkerAdminState(workerBaseUrl, idToken);
        setLicensePolicy(state.policy);
        setPcLicensesMap(state.pcLicenses || {});
        setPaymentClaims(
          (Array.isArray(state.claims) ? state.claims : []).sort(
            (a, b) => Date.parse(b.createdAtIso || '0') - Date.parse(a.createdAtIso || '0')
          )
        );
        setCfWorkerStatus('connected');
        setCfWorkerMessage(`Cloudflare Worker Connected (Synced ${new Date().toLocaleTimeString()})`);
        if (showToastOnSuccess) {
          showSuccess('Cloudflare Worker (ubdtools) KV నుండి లైవ్ డేటా సింక్ అయింది!', 'Cloudflare Synced');
        }
        return true;
      } catch (err: any) {
        const msg = String(err?.message || 'Worker sync failed');
        if (msg.includes('KV_NOT_BOUND')) {
          setCfWorkerStatus('kv-missing');
          setCfWorkerMessage('Worker Live, కానీ UBD_LICENSES KV Namespace ఇంకా Bind చేయలేదు.');
        } else {
          setCfWorkerStatus('error');
          setCfWorkerMessage(msg);
        }
        return false;
      } finally {
        setCfSyncing(false);
      }
    },
    [firebaseUser, showSuccess]
  );

  // Discover saved/manifest Cloudflare Worker URL on mount
  useEffect(() => {
    let active = true;
    (async () => {
      const discovered = await discoverCloudflareWorkerUrl();
      if (!active || !discovered) return;
      setCfWorkerUrlInput(discovered);
      setActiveCfWorkerUrl(discovered);
      const health = await checkCloudflareWorkerHealth(discovered);
      if (!active) return;
      if (health.ok && health.kvBound) {
        setCfWorkerStatus('connected');
        setCfWorkerMessage('Cloudflare Worker (ubdtools) + UBD_LICENSES KV Active (100,000 free reads/day)');
      } else if (health.ok && !health.kvBound) {
        setCfWorkerStatus('kv-missing');
        setCfWorkerMessage('Worker Online — Settings -> Bindings లో "UBD_LICENSES" KV Namespace Bind చేయండి.');
      } else {
        setCfWorkerStatus('error');
        setCfWorkerMessage(health.error || 'Worker connection failed');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load Admin state from Cloudflare Worker whenever verified Admin + Worker URL are ready (plus live 15s auto-refresh)
  useEffect(() => {
    if (!isVerifiedAdmin || !activeCfWorkerUrl) return;
    void syncFromCloudflareWorker(activeCfWorkerUrl, false);
    const interval = window.setInterval(() => {
      void syncFromCloudflareWorker(activeCfWorkerUrl, false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [isVerifiedAdmin, activeCfWorkerUrl, syncFromCloudflareWorker]);

  const handleTestAndSaveCloudflareWorker = async () => {
    if (isDashboardLinkNotWorkerUrl(cfWorkerUrlInput)) {
      setCfWorkerStatus('error');
      setCfWorkerMessage('అది Cloudflare Dashboard లింక్! Worker deploy చేసిన తర్వాత వచ్చే https://ubdtools.<subdomain>.workers.dev URL ఇక్కడ పేస్ట్ చేయండి.');
      showError('Dashboard లింక్ కాదు — మీ live https://ubdtools.<subdomain>.workers.dev URL ఇవ్వండి.', 'Use workers.dev URL');
      return;
    }
    const normalized = normalizeCloudflareWorkerUrl(cfWorkerUrlInput);
    if (!normalized) {
      setCfWorkerStatus('error');
      setCfWorkerMessage('సరైన Worker URL ఇవ్వండి (ఉదా: https://ubdtools.<your-subdomain>.workers.dev)');
      showError('సరైన Cloudflare Worker URL ఎంటర్ చేయండి.', 'Invalid Worker URL');
      return;
    }
    setCfWorkerStatus('testing');
    setCfWorkerMessage('Cloudflare Worker health చెక్ చేస్తున్నాం...');
    const health = await checkCloudflareWorkerHealth(normalized);
    if (!health.ok) {
      setCfWorkerStatus('error');
      setCfWorkerMessage(health.error || 'Cloudflare Worker రెస్పాండ్ అవ్వలేదు.');
      showError(health.error || 'Failed to connect to Worker', 'Worker Check Failed');
      return;
    }
    saveCloudflareWorkerUrl(normalized);
    setCfWorkerUrlInput(normalized);
    setActiveCfWorkerUrl(normalized);
    if (!health.kvBound) {
      setCfWorkerStatus('kv-missing');
      setCfWorkerMessage('Worker URL సేవ్ అయింది! కానీ UBD_LICENSES KV Bind చేయలేదు — Cloudflare Worker -> Settings -> Bindings లో Add చేయండి.');
      showInfo('Worker కనెక్ట్ అయింది, కానీ UBD_LICENSES KV Bind చేయాలి.', 'Bind KV Namespace');
      return;
    }
    setCfWorkerStatus('connected');
    setCfWorkerMessage('Cloudflare Worker (ubdtools) + UBD_LICENSES KV Connected (Zero Firebase Quota Issues!)');
    showSuccess('Cloudflare Worker కనెక్ట్ అయింది! ఇక Firebase 429 Quota సమస్య రాదు.', 'Cloudflare Worker Connected');
    if (isVerifiedAdmin) {
      await syncFromCloudflareWorker(normalized, false);
    }
  };

  const handleCopyCloudflareWorkerCode = async () => {
    try {
      await navigator.clipboard.writeText(CLOUDFLARE_WORKER_SOURCE);
      showSuccess('ubdtools Cloudflare Worker కోడ్ కాపీ అయింది! Cloudflare Dashboard లో పేస్ట్ చేసి Deploy నొక్కండి.', 'Worker Code Copied');
    } catch {
      showError('Clipboard copy failed. Please retry.', 'Copy Failed');
    }
  };

  // Public read listener for global licensing config (only when Cloudflare Worker is NOT active)
  useEffect(() => {
    if (activeCfWorkerUrl) return;
    const policyRef = doc(db, 'app_settings', 'licensing');
    const unsubPolicy = onSnapshot(
      policyRef,
      (snap) => {
        if (snap.exists()) {
          const data: any = snap.data();
          setLicensePolicy({
            policyId: 'licensing',
            mode: data.mode === 'PAID_MONTHLY' ? 'PAID_MONTHLY' : 'FREE_FOR_ALL',
            monthlyPriceInr: Number(data.monthlyPriceInr ?? 10),
            durationDays: Number(data.durationDays ?? 30),
            upiId: String(data.upiId || ''),
            paymentLinkUrl: String(data.paymentLinkUrl || ''),
            paymentNote: String(data.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote)
          });
        }
      },
      (error) => {
        console.warn('Licensing policy listener notice:', error.message);
        if (/quota|resource-exhausted/i.test(String(error?.code || error?.message || ''))) {
          setAuthNotice('Firestore Daily Free Quota Exceeded (429 RESOURCE_EXHAUSTED). Quota resets tomorrow, or upgrade in Firebase Console.');
        }
      }
    );
    return () => unsubPolicy();
  }, [activeCfWorkerUrl]);

  // Admin-only listeners: installed_pcs directory (best-effort) + Firestore fallback only when Cloudflare Worker is not active
  useEffect(() => {
    if (!isVerifiedAdmin) {
      setPaymentClaims([]);
      setPcLicensesMap({});
      setInstalledPcs([]);
      return;
    }

    const qPcs = query(collection(db, 'installed_pcs'), orderBy('updatedAt', 'desc'), limit(200));
    const unsubPcs = onSnapshot(
      qPcs,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            pcId: data.pcId || d.id,
            pcName: data.pcName || 'GP-OFFICE-PC',
            userName: data.userName || 'Operator',
            district: data.district || 'District',
            state: data.state || 'Telangana',
            officeLocation: data.officeLocation || 'Grama Panchayat Office'
          };
        });
        setInstalledPcs(rows);
      },
      (error) => {
        if (!activeCfWorkerUrl) {
          setAuthNotice('Firestore Read Error (installed_pcs): ' + error.message);
          showError(error.message || 'Failed to load installed PCs', 'Firestore Read Error');
          handleFirestoreError(error, OperationType.LIST, 'installed_pcs');
        }
      }
    );

    if (activeCfWorkerUrl) {
      return () => {
        unsubPcs();
      };
    }

    const qLicList = query(collection(db, 'pc_licenses'), limit(200));
    const unsubLicenses = onSnapshot(
      qLicList,
      (snap) => {
        const nextMap: Record<string, PcLicenseRecord> = {};
        snap.docs.forEach((d) => {
          const data: any = d.data();
          const key = String(data.pcId || d.id).toUpperCase();
          nextMap[key] = {
            pcId: data.pcId || d.id,
            pcName: data.pcName || '',
            planType: data.planType || 'PAID_30_DAYS',
            status: data.status || 'ACTIVE',
            amountInr: Number(data.amountInr ?? 10),
            validUntilIso: String(data.validUntilIso || ''),
            paymentRef: data.paymentRef || ''
          };
        });
        setPcLicensesMap(nextMap);
      },
      (error) => {
        setAuthNotice('Firestore Read Error (pc_licenses): ' + error.message);
        showError(error.message || 'Failed to load PC licenses', 'Firestore Read Error');
        handleFirestoreError(error, OperationType.LIST, 'pc_licenses');
      }
    );

    const qClaimsList = query(collection(db, 'payment_claims'), orderBy('createdAt', 'desc'), limit(200));
    const unsubClaims = onSnapshot(
      qClaimsList,
      (snap) => {
        const list: PaymentClaimRecord[] = snap.docs.map((d) => {
          const data: any = d.data();
          const createdMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
          return {
            claimId: data.claimId || d.id,
            utrNumber: String(data.utrNumber || ''),
            pcId: String(data.pcId || ''),
            pcName: String(data.pcName || 'GP-OFFICE-PC'),
            operatorName: String(data.operatorName || ''),
            district: String(data.district || ''),
            state: String(data.state || ''),
            amountInr: Number(data.amountInr ?? 10),
            status: (data.status === 'APPROVED' || data.status === 'REJECTED') ? data.status : 'PENDING',
            note: String(data.note || ''),
            createdAtIso: createdMs ? new Date(createdMs).toISOString() : ''
          };
        });
        setPaymentClaims(list);
      },
      (error) => {
        setAuthNotice('Firestore Read Error (payment_claims): ' + error.message);
        showError(error.message || 'Failed to load payment claims', 'Firestore Read Error');
        handleFirestoreError(error, OperationType.LIST, 'payment_claims');
      }
    );

    return () => {
      unsubPcs();
      unsubLicenses();
      unsubClaims();
    };
  }, [isVerifiedAdmin, activeCfWorkerUrl, showError]);

  const handleAdminGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showSuccess('Firebase Cloud Admin లాగిన్ విజయవంతమైంది!', 'Admin Authenticated');
      } else {
        showInfo(`Signed in as ${res.user?.email}. Admin controls require ${ADMIN_EMAIL}.`, 'Access Notice');
      }
    } catch (e: any) {
      if (String(e?.code || e?.message || '').includes('unauthorized-domain')) {
        const host = window.location.hostname;
        setAuthNotice(`Firebase Auth Notice: "${host}" ను Authorized domains లో యాడ్ చేయండి.`);
        showError(`Add "${host}" to Firebase Authorized Domains in Firebase Console`, 'Domain Not Authorized');
        return;
      }
      showError(e?.message || 'Google Sign-In failed', 'Auth Error');
    }
  };

  const handleAdminSignOut = async () => {
    await signOut(auth);
    showInfo('Admin Cloud Session లాగౌట్ చేయబడింది.', 'Signed Out');
  };

  const resolveExactPcId = (pcIdRaw: string): string => {
    const trimmed = String(pcIdRaw || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    if (!trimmed) return '';
    const matchPc = installedPcs.find((p) => String(p.pcId || '').toUpperCase() === trimmed.toUpperCase());
    if (matchPc?.pcId) return String(matchPc.pcId).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    const matchLic = pcLicensesMap[trimmed.toUpperCase()];
    if (matchLic?.pcId) return String(matchLic.pcId).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    return trimmed;
  };

  const handleSaveLicensePolicy = async (overrideMode?: 'FREE_FOR_ALL' | 'PAID_MONTHLY') => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const nextMode = overrideMode || licensePolicy.mode;
    const rawPrice = Number(licensePolicy.monthlyPriceInr);
    const safePrice =
      nextMode === 'PAID_MONTHLY'
        ? Math.max(1, Math.min(10000, Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 10))
        : Math.max(0, Math.min(10000, Number.isFinite(rawPrice) ? rawPrice : 10));
    const safeDays = Math.max(1, Math.min(3650, Math.floor(Number(licensePolicy.durationDays) || 30)));
    const cleanUpi = String(licensePolicy.upiId || '').trim().slice(0, 120);
    let cleanLink = String(licensePolicy.paymentLinkUrl || '').trim().slice(0, 300);
    if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
      cleanLink = `https://${cleanLink}`.slice(0, 300);
    }
    const cleanNote = String(licensePolicy.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote).trim().slice(0, 400);

    const nextPolicyPayload: LicensePolicyConfig = {
      policyId: 'licensing',
      mode: nextMode,
      monthlyPriceInr: safePrice,
      durationDays: safeDays,
      upiId: cleanUpi,
      paymentLinkUrl: cleanLink,
      paymentNote: cleanNote || DEFAULT_LICENSE_POLICY.paymentNote
    };

    setSavingPolicy(true);
    try {
      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await saveWorkerPolicy(activeCfWorkerUrl, idToken, nextPolicyPayload);
        savedViaWorker = true;
      }

      if (savedViaWorker) {
        // Best-effort Firestore mirror (ignore 429 quota failures)
        setDoc(doc(db, 'app_settings', 'licensing'), {
          ...nextPolicyPayload,
          updatedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        await setDoc(doc(db, 'app_settings', 'licensing'), {
          ...nextPolicyPayload,
          updatedAt: serverTimestamp()
        });
      }

      setLicensePolicy(nextPolicyPayload);
      if (nextMode === 'PAID_MONTHLY' && !cleanUpi && !cleanLink) {
        showInfo(
          'PAID_MONTHLY ఆన్ అయింది! దయచేసి Alias UPI ID లేదా Payment Gateway Link కూడా సేవ్ చేయండి (అప్పుడే యూజర్లకు QR కోడ్ కనిపిస్తుంది).',
          'Add UPI ID / Link'
        );
      } else {
        showSuccess(
          nextMode === 'FREE_FOR_ALL'
            ? `🟢 FREE_FOR_ALL ఆన్ అయింది${savedViaWorker ? ' (Cloudflare KV)' : ''} — అందరికీ పూర్తిగా ఉచితం!`
            : `💳 PAID_MONTHLY (₹${safePrice} / ${safeDays} రోజులు) ఆన్ చేయబడింది${savedViaWorker ? ' (Cloudflare KV)' : ''}!`,
          'License Mode Saved'
        );
      }
    } catch (err: any) {
      setAuthNotice('Save License Policy Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to save license policy', 'Save Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, 'app_settings/licensing');
      }
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleActivatePcSubscription = async (pc: any, overrideDays?: number) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in as Admin first.', 'Admin Auth Required');
      return;
    }
    const rawId = resolveExactPcId(pc.pcId || '');
    if (!rawId) {
      showError('దయచేసి సరైన PC Machine ID (ఉదా: EVD-TS-MNCL-01) ఇవ్వండి.', 'PC ID Required');
      return;
    }
    const grantDays = Math.max(1, Math.min(3650, Math.floor(overrideDays || customActivateDays || licensePolicy.durationDays || 30)));
    setActivatingPcId(rawId);
    try {
      const existingRec = pcLicensesMap[rawId.toUpperCase()];
      const validUntilIso = computeRenewalExpiryIso(existingRec?.validUntilIso, grantDays);
      const nextRec: PcLicenseRecord = {
        pcId: rawId,
        pcName: String(pc.pcName || rawId || 'GP-OFFICE-PC').trim().slice(0, 128),
        planType: 'PAID_30_DAYS',
        status: 'ACTIVE',
        amountInr: Math.max(0, Math.min(10000, Number(licensePolicy.monthlyPriceInr || 10))),
        validUntilIso,
        paymentRef: `INR${licensePolicy.monthlyPriceInr || 10}-${grantDays}D-${new Date().toISOString().slice(0, 10)}`
      };

      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await saveWorkerPcLicense(activeCfWorkerUrl, idToken, nextRec);
        savedViaWorker = true;
        setPcLicensesMap((prev) => ({ ...prev, [rawId.toUpperCase()]: nextRec }));
      }

      if (savedViaWorker) {
        setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() }).catch(() => {});
      } else {
        await setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() });
      }

      setBypassPcIdInput('');
      setBypassPcNameInput('');
      showSuccess(`${pc.pcName || rawId} (${rawId}) కు +${grantDays} రోజుల లైసెన్స్ యాక్టివేట్ అయింది${savedViaWorker ? ' (Cloudflare KV)' : ''}!`, 'License Activated');
    } catch (err: any) {
      setAuthNotice('License Activate Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to activate PC license', 'Activation Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, `pc_licenses/${rawId}`);
      }
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleRevokePcSubscription = async (pc: any) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in as Admin first.', 'Admin Auth Required');
      return;
    }
    const rawId = resolveExactPcId(pc.pcId || '');
    if (!rawId) return;
    setActivatingPcId(rawId);
    try {
      const nextRec: PcLicenseRecord = {
        pcId: rawId,
        pcName: String(pc.pcName || rawId || 'GP-OFFICE-PC').trim().slice(0, 128),
        planType: 'PAID_30_DAYS',
        status: 'REVOKED',
        amountInr: 0,
        validUntilIso: new Date(Date.now() - 60000).toISOString(),
        paymentRef: 'REVOKED_BY_ADMIN'
      };

      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await saveWorkerPcLicense(activeCfWorkerUrl, idToken, nextRec);
        savedViaWorker = true;
        setPcLicensesMap((prev) => ({ ...prev, [rawId.toUpperCase()]: nextRec }));
      }

      if (savedViaWorker) {
        setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() }).catch(() => {});
      } else {
        await setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() });
      }
      showInfo(`${pc.pcName || rawId} (${rawId}) సబ్‌స్క్రిప్షన్ నిలిపివేయబడింది.`, 'License Revoked');
    } catch (err: any) {
      setAuthNotice('Revoke License Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to revoke license', 'Revoke Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, `pc_licenses/${rawId}`);
      }
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleSetPcFreeBypass = async (pcIdRaw: string, pcNameRaw: string, enableFree: boolean) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const rawId = resolveExactPcId(pcIdRaw);
    if (!rawId) {
      showError('దయచేసి సరైన PC Machine ID (ఉదా: EVD-TS-MNCL-01) ఇవ్వండి.', 'PC ID Required');
      return;
    }
    const safeName = String(pcNameRaw || rawId || 'GP-OFFICE-PC').trim().slice(0, 128);
    setActivatingPcId(rawId);
    try {
      const nextRec: PcLicenseRecord = enableFree
        ? {
            pcId: rawId,
            pcName: safeName,
            planType: 'FREE_ACCESS',
            status: 'ACTIVE',
            amountInr: 0,
            validUntilIso: '2099-12-31T23:59:59.000Z',
            paymentRef: 'ADMIN_FREE_BYPASS'
          }
        : {
            pcId: rawId,
            pcName: safeName,
            planType: 'PAID_30_DAYS',
            status: 'EXPIRED',
            amountInr: Math.max(0, Math.min(10000, Number(licensePolicy.monthlyPriceInr || 10))),
            validUntilIso: new Date(Date.now() - 60000).toISOString(),
            paymentRef: 'PAYMENT_REQUIRED_BY_ADMIN'
          };

      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await saveWorkerPcLicense(activeCfWorkerUrl, idToken, nextRec);
        savedViaWorker = true;
        setPcLicensesMap((prev) => ({ ...prev, [rawId.toUpperCase()]: nextRec }));
      }

      if (savedViaWorker) {
        setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() }).catch(() => {});
      } else {
        await setDoc(doc(db, 'pc_licenses', rawId), { ...nextRec, updatedAt: serverTimestamp() });
      }

      if (enableFree) {
        showSuccess(
          `🔓 ${safeName} (${rawId}) కు Payment Mode OFF చేయబడింది${savedViaWorker ? ' (Cloudflare KV)' : ''}!`,
          'PC Payment Mode OFF'
        );
      } else {
        showInfo(
          `💳 ${safeName} (${rawId}) కు మళ్ళీ సాధారణ Payment Mode (₹${licensePolicy.monthlyPriceInr}/Month) ఆన్ చేయబడింది.`,
          'PC Payment Mode ON'
        );
      }
      setBypassPcIdInput('');
      setBypassPcNameInput('');
    } catch (err: any) {
      setAuthNotice('Per-PC Override Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to update PC override', 'Update Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, `pc_licenses/${rawId}`);
      }
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleApprovePaymentClaim = async (claim: PaymentClaimRecord) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const cleanPcId = resolveExactPcId(claim.pcId || '');
    if (!cleanPcId || !claim.claimId) return;
    setReviewingClaimId(claim.claimId);
    try {
      const existingRec = pcLicensesMap[cleanPcId.toUpperCase()];
      const validUntilIso = computeRenewalExpiryIso(existingRec?.validUntilIso, licensePolicy.durationDays || 30);
      const approvedNote = `Verified UTR ${claim.utrNumber} by Admin on ${new Date().toLocaleDateString()}`.slice(0, 300);

      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const reviewed = await reviewWorkerClaim(activeCfWorkerUrl, idToken, {
          claimId: claim.claimId,
          decision: 'APPROVED',
          utrNumber: claim.utrNumber,
          pcId: cleanPcId,
          pcName: String(claim.pcName || 'GP-OFFICE-PC').trim().slice(0, 128),
          operatorName: claim.operatorName,
          district: claim.district,
          state: claim.state,
          amountInr: Math.max(0, Math.min(10000, Number(claim.amountInr || licensePolicy.monthlyPriceInr || 10))),
          durationDays: licensePolicy.durationDays || 30,
          validUntilIso,
          note: approvedNote
        });
        savedViaWorker = true;
        setPaymentClaims((prev) => prev.map((c) => (c.claimId === claim.claimId ? reviewed.claim : c)));
        if (reviewed.pcLicense) {
          setPcLicensesMap((prev) => ({ ...prev, [cleanPcId.toUpperCase()]: reviewed.pcLicense! }));
        }
      }

      if (savedViaWorker) {
        setDoc(doc(db, 'payment_claims', claim.claimId), { status: 'APPROVED', note: approvedNote }, { merge: true }).catch(() => {});
        setDoc(doc(db, 'pc_licenses', cleanPcId), {
          pcId: cleanPcId,
          pcName: String(claim.pcName || 'GP-OFFICE-PC').trim().slice(0, 128),
          planType: 'PAID_30_DAYS',
          status: 'ACTIVE',
          amountInr: Math.max(0, Math.min(10000, Number(claim.amountInr || licensePolicy.monthlyPriceInr || 10))),
          validUntilIso,
          paymentRef: `UTR-${claim.utrNumber}`.slice(0, 128),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        await setDoc(
          doc(db, 'payment_claims', claim.claimId),
          { status: 'APPROVED', note: approvedNote },
          { merge: true }
        );
        await setDoc(doc(db, 'pc_licenses', cleanPcId), {
          pcId: cleanPcId,
          pcName: String(claim.pcName || 'GP-OFFICE-PC').trim().slice(0, 128),
          planType: 'PAID_30_DAYS',
          status: 'ACTIVE',
          amountInr: Math.max(0, Math.min(10000, Number(claim.amountInr || licensePolicy.monthlyPriceInr || 10))),
          validUntilIso,
          paymentRef: `UTR-${claim.utrNumber}`.slice(0, 128),
          updatedAt: serverTimestamp()
        });
      }

      showSuccess(
        `UTR ${claim.utrNumber} వెరిఫై అయింది! ${claim.pcName} కు +${licensePolicy.durationDays || 30} రోజులు యాక్టివేట్ చేయబడింది${savedViaWorker ? ' (Cloudflare KV)' : ''}.`,
        'Payment Claim Approved'
      );
    } catch (err: any) {
      setAuthNotice('Approve UTR Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to approve UTR claim', 'Approve Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, `payment_claims/${claim.claimId}`);
      }
    } finally {
      setReviewingClaimId(null);
    }
  };

  const handleRejectPaymentClaim = async (claim: PaymentClaimRecord) => {
    if (!isVerifiedAdmin || !claim.claimId) return;
    setReviewingClaimId(claim.claimId);
    try {
      const rejectedNote = `Rejected (Duplicate / Unmatched UTR ${claim.utrNumber}) on ${new Date().toLocaleDateString()}`.slice(0, 300);
      let savedViaWorker = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const reviewed = await reviewWorkerClaim(activeCfWorkerUrl, idToken, {
          claimId: claim.claimId,
          decision: 'REJECTED',
          utrNumber: claim.utrNumber,
          pcId: claim.pcId,
          pcName: claim.pcName,
          note: rejectedNote
        });
        savedViaWorker = true;
        setPaymentClaims((prev) => prev.map((c) => (c.claimId === claim.claimId ? reviewed.claim : c)));
      }

      if (savedViaWorker) {
        setDoc(doc(db, 'payment_claims', claim.claimId), { status: 'REJECTED', note: rejectedNote }, { merge: true }).catch(() => {});
      } else {
        await setDoc(
          doc(db, 'payment_claims', claim.claimId),
          { status: 'REJECTED', note: rejectedNote },
          { merge: true }
        );
      }
      showInfo(`UTR ${claim.utrNumber} తిరస్కరించబడింది.`, 'UTR Claim Rejected');
    } catch (err: any) {
      setAuthNotice('Reject UTR Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to reject UTR claim', 'Reject Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.WRITE, `payment_claims/${claim.claimId}`);
      }
    } finally {
      setReviewingClaimId(null);
    }
  };

  const handleResetPcTrialLicense = async (pcIdRaw: string, pcNameRaw?: string) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const rawId = resolveExactPcId(pcIdRaw);
    if (!rawId) {
      showError('దయచేసి సరైన PC Machine ID (ఉదా: EVD-TS-MNCL-53) ఇవ్వండి.', 'PC ID Required');
      return;
    }
    const safeName = String(pcNameRaw || rawId).trim().slice(0, 128);
    setActivatingPcId(rawId);
    try {
      let resetMode: 'kv-deleted' | 'kv-reset-fallback' | 'firestore' = 'firestore';
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const res = await resetWorkerPcLicense(activeCfWorkerUrl, idToken, rawId, safeName);
        resetMode = res.mode;
        if (res.mode === 'kv-deleted') {
          setPcLicensesMap((prev) => {
            const next = { ...prev };
            delete next[rawId.toUpperCase()];
            return next;
          });
        } else if (res.fallbackRecord) {
          setPcLicensesMap((prev) => ({ ...prev, [rawId.toUpperCase()]: res.fallbackRecord! }));
        }
        deleteDoc(doc(db, 'pc_licenses', rawId)).catch(() => {});
      } else {
        await deleteDoc(doc(db, 'pc_licenses', rawId));
        setPcLicensesMap((prev) => {
          const next = { ...prev };
          delete next[rawId.toUpperCase()];
          return next;
        });
      }

      setConfirmResetPc(null);
      setBypassPcIdInput('');
      setBypassPcNameInput('');

      if (resetMode === 'kv-reset-fallback') {
        showInfo(
          `🔄 ${safeName} (${rawId}) ట్రయల్/లైసెన్స్ రీసెట్ అయింది! లిస్ట్ నుండి పూర్తిగా తొలగించాలంటే పైన ఉన్న "Copy ubdtools Worker Code" తో Worker ను ఒకసారి Deploy చేయండి.`,
          'Trial PC Reset Applied'
        );
      } else {
        showSuccess(
          `🔄 ${safeName} (${rawId}) ట్రయల్ / కస్టమ్ లైసెన్స్ పూర్తిగా రీసెట్ అయింది — ఇక ఫ్రెష్‌గా గ్లోబల్ పాలసీ ప్రకారం పనిచేస్తుంది!`,
          'Trial PC Reset Complete'
        );
      }
    } catch (err: any) {
      setAuthNotice('Reset Trial PC Error: ' + (err?.message || 'Permission denied'));
      showError(err?.message || 'Failed to reset trial PC license', 'Reset Failed');
      if (!activeCfWorkerUrl) {
        handleFirestoreError(err, OperationType.DELETE, `pc_licenses/${rawId}`);
      }
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleResetAllPcOverrides = async () => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const entries = Object.values(pcLicensesMap) as PcLicenseRecord[];
    if (entries.length === 0) {
      setConfirmResetAllOverrides(false);
      return;
    }
    setResettingAllOverrides(true);
    try {
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const res = await resetMultipleWorkerPcLicenses(
          activeCfWorkerUrl,
          idToken,
          entries.map((e) => ({ pcId: e.pcId, pcName: e.pcName }))
        );
        await Promise.all(entries.map((e) => deleteDoc(doc(db, 'pc_licenses', e.pcId)).catch(() => {})));
        if (res.mode === 'kv-deleted') {
          setPcLicensesMap({});
          showSuccess(`🔄 మొత్తం ${res.count} ట్రయల్/కస్టమ్ PC లైసెన్స్‌లు పూర్తిగా రీసెట్ అయ్యాయి!`, 'All Trial Overrides Reset');
        } else {
          await syncFromCloudflareWorker(activeCfWorkerUrl, false);
          showInfo(`🔄 ${res.count} PC లైసెన్స్‌లు రీసెట్ అయ్యాయి! పూర్తి KV క్లీనప్ కోసం కొత్త ubdtools Worker కోడ్‌ను Deploy చేయండి.`, 'Trial Overrides Reset');
        }
      } else {
        await Promise.all(entries.map((e) => deleteDoc(doc(db, 'pc_licenses', e.pcId))));
        setPcLicensesMap({});
        showSuccess(`🔄 మొత్తం ${entries.length} ట్రయల్/కస్టమ్ PC లైసెన్స్‌లు రీసెట్ అయ్యాయి!`, 'All Trial Overrides Reset');
      }
      setConfirmResetAllOverrides(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to reset all trial overrides', 'Bulk Reset Failed');
    } finally {
      setResettingAllOverrides(false);
    }
  };

  const handleDeletePaymentClaim = async (claim: PaymentClaimRecord) => {
    if (!isVerifiedAdmin || !claim.claimId) return;
    setDeletingClaimId(claim.claimId);
    try {
      let workerDeleted = false;
      if (activeCfWorkerUrl && firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const res = await deleteWorkerClaim(activeCfWorkerUrl, idToken, claim.claimId);
        workerDeleted = res.supported;
        deleteDoc(doc(db, 'payment_claims', claim.claimId)).catch(() => {});
      } else {
        await deleteDoc(doc(db, 'payment_claims', claim.claimId));
        workerDeleted = true;
      }

      setPaymentClaims((prev) => prev.filter((c) => c.claimId !== claim.claimId));
      setConfirmDeleteClaim(null);
      if (activeCfWorkerUrl && !workerDeleted) {
        showInfo(
          `UTR ${claim.utrNumber} తొలగించబడింది (Cloudflare KV లో శాశ్వతంగా డిలీట్ అవ్వడానికి కొత్త ubdtools Worker కోడ్‌ను Deploy చేయండి).`,
          'Claim Removed'
        );
      } else {
        showSuccess(`🗑️ టెస్ట్ / అదనపు UTR క్లెయిమ్ (${claim.utrNumber}) డిలీట్ చేయబడింది.`, 'UTR Claim Deleted');
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to delete UTR claim', 'Delete Failed');
    } finally {
      setDeletingClaimId(null);
    }
  };

  const hubStats = computePaymentHubStats(paymentClaims, pcLicensesMap);
  const { pendingClaimsCount, totalApprovedRevenueInr, activePaidPcsCount, expiringSoonPcsCount, freeBypassPcsCount } = hubStats;
  const filteredClaims = filterPaymentClaims(paymentClaims, claimStatusFilter, claimSearchFilter);

  const handleExportClaimsCsv = () => {
    const csv = buildPaymentsCsv(filteredClaims);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EVedhika_Payment_Claims_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(`${filteredClaims.length} పేమెంట్ క్లెయిమ్‌లు CSV గా డౌన్‌లోడ్ అయ్యాయి!`, 'CSV Exported');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-100">
      {/* Dedicated Payment & Licensing Hub Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono text-[10px] font-bold">
            <span className={`px-2.5 py-1 rounded border ${
              licensePolicy.mode === 'FREE_FOR_ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {licensePolicy.mode === 'FREE_FOR_ALL'
                ? '🟢 CURRENT MODE: FREE FOR ALL'
                : `💳 CURRENT MODE: PAID (₹${licensePolicy.monthlyPriceInr}/${licensePolicy.durationDays}d)`}
            </span>
            {pendingClaimsCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">
                ⏳ {pendingClaimsCount} Pending UTR Claims
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Payment &amp; License Hub (ప్రత్యేక పేమెంట్ విభాగం)</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Operator QR UPI Checkout, 12-Digit UTR Anti-Duplicate Queue, &amp; Per-PC Subscription Control — పూర్తిగా ప్రత్యేకమైన పేమెంట్ టాబ్.
          </p>
          {authNotice && (
            <div className="mt-2 text-xs text-amber-200 bg-amber-950/60 border border-amber-500/50 rounded-lg px-3 py-2 space-y-1">
              <div>{authNotice}</div>
              {/quota|resource-exhausted/i.test(authNotice) && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://console.firebase.google.com/project/e-vedhika-258f2/firestore/databases/ai-studio-ubdtools-ed9d3074-cce9-4bfd-90c3-8779cab02a82/data?openUpgradeDialog=true"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-cyan-300 hover:text-cyan-200"
                  >
                    Open Firebase Console Upgrade Dialog
                  </a>
                  <a
                    href="https://firebase.google.com/pricing#cloud-firestore"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-slate-300 hover:text-white"
                  >
                    Firestore Spark/Enterprise Quota Limits
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isVerifiedAdmin ? (
            <button
              type="button"
              onClick={handleAdminSignOut}
              className="bg-emerald-700/80 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Admin Authenticated ({firebaseUser?.email?.split('@')[0]})</span>
              <LogOut className="w-3.5 h-3.5 opacity-80" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdminGoogleSignIn}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>🔐 Admin Google Sign-In (Manage Plans)</span>
            </button>
          )}
        </div>
      </div>

      {/* Dedicated 2-Tab Bar inside Payment Hub (Admin Controls first when in Admin Portal) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {defaultSubTab === 'admin-controls' ? (
            <>
              <button
                type="button"
                onClick={() => setSubTab('admin-controls')}
                className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'admin-controls'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-slate-900 text-cyan-300 hover:text-white border border-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>
                  1. Admin License Plans, UTR Queue &amp; Per-PC Control
                  {pendingClaimsCount > 0 ? ` (${pendingClaimsCount})` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('qr-checkout')}
                className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'qr-checkout'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>2. Operator QR Payment &amp; UTR Checkout Preview</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSubTab('qr-checkout')}
                className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'qr-checkout'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>1. Operator QR Payment &amp; UTR Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('admin-controls')}
                className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'admin-controls'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-slate-900 text-cyan-300 hover:text-white border border-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>
                  2. Admin License Plans, UTR Queue &amp; Per-PC Control
                  {pendingClaimsCount > 0 ? ` (${pendingClaimsCount})` : ''}
                </span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText('https://rakeshkumardhawan.github.io/UBDTOOLS/pay-checkout?pay=1');
            showInfo('Operator Checkout Link కాపీ అయింది!', 'Checkout Link Copied');
          }}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Operator Pay Link</span>
        </button>
      </div>

      {/* Sub-Tab 1: Operator QR Payment Checkout */}
      {subTab === 'qr-checkout' && <PublicPaymentCheckout />}

      {/* Sub-Tab 2: Admin Licensing Plan, UTR Claims & Per-PC Overrides */}
      {subTab === 'admin-controls' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Quick Payment Mode & License Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold">GLOBAL MODE</div>
              <div className={`text-sm font-black mt-1 ${licensePolicy.mode === 'PAID_MONTHLY' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {licensePolicy.mode === 'PAID_MONTHLY' ? `PAID (₹${licensePolicy.monthlyPriceInr}/${licensePolicy.durationDays}d)` : 'FREE FOR ALL'}
              </div>
            </div>
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4">
              <div className="text-[10px] text-emerald-300 font-bold">TOTAL REVENUE</div>
              <div className="text-xl font-black text-emerald-400 mt-1">₹{totalApprovedRevenueInr}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold">PENDING UTR</div>
              <div className="text-xl font-black text-amber-400 mt-1">{pendingClaimsCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold">ACTIVE PAID PCs</div>
              <div className="text-xl font-black text-cyan-400 mt-1">{activePaidPcsCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold">EXPIRING (&le;5d)</div>
              <div className={`text-xl font-black mt-1 ${expiringSoonPcsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{expiringSoonPcsCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold">FREE BYPASS PCs</div>
              <div className="text-xl font-black text-violet-300 mt-1">{freeBypassPcsCount}</div>
            </div>
          </div>
          {!isVerifiedAdmin && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
              <div className="text-xs text-amber-200">
                <strong className="text-white block">🔐 Admin Authentication Required</strong>
                <span>పేమెంట్ ప్లాన్ మార్చడానికి, UTR క్లెయిమ్‌లు అప్రూవ్ చేయడానికి లేదా PC కి Free Bypass ఇవ్వడానికి Admin Google Sign-In చేయండి.</span>
              </div>
              <button
                type="button"
                onClick={handleAdminGoogleSignIn}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-mono text-xs font-bold shrink-0 cursor-pointer"
              >
                🔐 Sign In with Admin Google
              </button>
            </div>
          )}

          {/* Cloudflare Worker (ubdtools) Zero-Quota License Engine */}
          <div className="bg-slate-900 border border-orange-500/35 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-white uppercase tracking-wide inline-flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-orange-400 shrink-0" />
                    <span>Cloudflare Worker (ubdtools) — Zero-Quota License Backend</span>
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      cfWorkerStatus === 'connected'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : cfWorkerStatus === 'kv-missing'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : cfWorkerStatus === 'error'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {cfWorkerStatus === 'connected'
                      ? 'CLOUDFLARE KV ACTIVE (100K FREE/DAY)'
                      : cfWorkerStatus === 'kv-missing'
                        ? 'BIND UBD_LICENSES KV'
                        : cfWorkerStatus === 'error'
                          ? 'CHECK WORKER URL'
                          : 'READY TO CONNECT'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans mt-1">
                  Firebase 429 Quota లిమిట్ రాకుండా మీ <strong className="text-orange-300">ubdtools</strong> Cloudflare Worker + <strong className="text-cyan-300">UBD_LICENSES</strong> KV ద్వారా రోజుకు 1,00,000 ఉచిత లైసెన్స్ చెక్స్ రన్ అవుతాయి.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCloudflareWorkerCode}
                  className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ubdtools Worker Code</span>
                </button>
                <a
                  href={CLOUDFLARE_WORKER_DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Cloudflare ubdtools</span>
                </a>
                {activeCfWorkerUrl && isVerifiedAdmin && (
                  <button
                    type="button"
                    disabled={cfSyncing}
                    onClick={() => syncFromCloudflareWorker(activeCfWorkerUrl, true)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-cyan-700 text-cyan-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cfSyncing ? 'animate-spin' : ''}`} />
                    <span>{cfSyncing ? 'Syncing...' : 'Sync KV'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <label htmlFor="cf-worker-url-input" className="sr-only">
                Cloudflare Worker Live URL
              </label>
              <input
                id="cf-worker-url-input"
                type="text"
                value={cfWorkerUrlInput}
                onChange={(e) => setCfWorkerUrlInput(e.target.value)}
                placeholder="https://ubdtools.<your-subdomain>.workers.dev"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-orange-200 font-mono placeholder-slate-500 focus:outline-none focus:border-orange-400"
              />
              <button
                type="button"
                disabled={cfWorkerStatus === 'testing'}
                onClick={handleTestAndSaveCloudflareWorker}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition disabled:opacity-50 shrink-0"
              >
                {cfWorkerStatus === 'testing' ? 'Testing...' : 'Test & Connect Worker'}
              </button>
              {activeCfWorkerUrl && (
                <button
                  type="button"
                  onClick={() => {
                    saveCloudflareWorkerUrl('');
                    setActiveCfWorkerUrl('');
                    setCfWorkerUrlInput('');
                    setCfWorkerStatus('idle');
                    setCfWorkerMessage('');
                    showInfo('Cloudflare Worker URL తొలగించబడింది (Firestore Fallback Active).', 'Worker Cleared');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {cfWorkerMessage && (
              <div
                className={`rounded-xl px-3 py-2 text-xs font-sans flex items-center gap-2 border ${
                  cfWorkerStatus === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : cfWorkerStatus === 'kv-missing'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                }`}
              >
                {cfWorkerStatus === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{cfWorkerMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>APP LICENSING CONTROL — FREE NOW &amp; ₹{licensePolicy.monthlyPriceInr}/MONTH SUBSCRIPTION</span>
                </h2>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  {licensePolicy.mode === 'PAID_MONTHLY' ? (
                    <>
                      ప్రస్తుతం <strong className="text-amber-300">PAID_MONTHLY (₹{licensePolicy.monthlyPriceInr}/{licensePolicy.durationDays} రోజులు)</strong> ఆన్‌లో ఉంది! Active లైసెన్స్ లేదా Free Bypass లేని PCలకు సబ్‌స్క్రిప్షన్ చెక్ వర్తిస్తుంది.
                    </>
                  ) : (
                    <>
                      ప్రస్తుతం <strong className="text-emerald-300">FREE_FOR_ALL</strong> మోడ్ ఆన్‌లో ఉంది — అందరికీ 100% ఉచితంగా రన్ అవుతుంది. <strong className="text-amber-300">PAID_MONTHLY</strong> ఆన్ చేస్తే సబ్‌స్క్రిప్షన్ చెక్ వర్తిస్తుంది.
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={savingPolicy}
                  onClick={() => handleSaveLicensePolicy('FREE_FOR_ALL')}
                  className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                    licensePolicy.mode === 'FREE_FOR_ALL'
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  {licensePolicy.mode === 'FREE_FOR_ALL' ? '🟢 FREE FOR ALL (Active Now)' : '🟢 Switch to FREE FOR ALL'}
                </button>
                <button
                  type="button"
                  disabled={savingPolicy}
                  onClick={() => handleSaveLicensePolicy('PAID_MONTHLY')}
                  className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                    licensePolicy.mode === 'PAID_MONTHLY'
                      ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-amber-600 hover:text-white'
                  }`}
                >
                  {licensePolicy.mode === 'PAID_MONTHLY'
                    ? `💳 PAID MODE ₹${licensePolicy.monthlyPriceInr}/${licensePolicy.durationDays}d (Active Now)`
                    : `💳 ENABLE ₹${licensePolicy.monthlyPriceInr}/${licensePolicy.durationDays}d PAID MODE`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">MONTHLY FEE (₹ INR)</label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={licensePolicy.monthlyPriceInr}
                  onChange={(e) => setLicensePolicy((p) => ({ ...p, monthlyPriceInr: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">VALIDITY (DAYS)</label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={licensePolicy.durationDays}
                  onChange={(e) => setLicensePolicy((p) => ({ ...p, durationDays: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">ALIAS / MERCHANT UPI ID (NO PHONE #)</label>
                <input
                  type="text"
                  placeholder="evedhika.ubd@okaxis (NOT mobile#)"
                  value={licensePolicy.upiId}
                  onChange={(e) => setLicensePolicy((p) => ({ ...p, upiId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={savingPolicy}
                  onClick={() => handleSaveLicensePolicy()}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition disabled:opacity-50"
                >
                  {savingPolicy ? 'Saving...' : '💾 Save Plan Settings'}
                </button>
              </div>
            </div>

            {detectPhoneExposedInUpi(licensePolicy.upiId) && (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3.5 text-rose-200 font-sans text-xs">
                <strong>⚠️ హెచ్చరిక (Phone Number Visible Warning):</strong> మీరు ఇచ్చిన UPI ID లో 10-అంకెల మొబైల్ నంబర్ ఉంది! యూజర్లకు మీ నంబర్ కనిపిస్తే కాల్స్ వస్తాయి. బదులుగా Custom Alias UPI లేదా Merchant QR వాడండి.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">
                    PAYMENT GATEWAY OPTION (RAZORPAY / CASHFREE / INSTAMOJO — ZERO CALLS, OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Optional Payment Gateway Reference"
                    value={licensePolicy.paymentLinkUrl || ''}
                    onChange={(e) => setLicensePolicy((p) => ({ ...p, paymentLinkUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">OPERATOR PAYMENT NOTE (SHOWN WHEN PAID MODE IS ON)</label>
                  <input
                    type="text"
                    value={licensePolicy.paymentNote}
                    onChange={(e) => setLicensePolicy((p) => ({ ...p, paymentNote: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-sans"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5">
                <div className="text-[10px] font-bold text-cyan-300 uppercase">Live UPI QR Preview (No Phone # Shown)</div>
                {licensePolicy.upiId.trim() ? (
                  <div className="bg-white p-2.5 rounded-xl">
                    <QRCodeSVG
                      value={buildUpiPaymentUri(licensePolicy.upiId.trim(), licensePolicy.monthlyPriceInr)}
                      size={128}
                      level="M"
                    />
                  </div>
                ) : licensePolicy.paymentLinkUrl && /^https?:\/\//i.test(licensePolicy.paymentLinkUrl.trim()) ? (
                  <div className="bg-white p-2.5 rounded-xl">
                    <QRCodeSVG
                      value={licensePolicy.paymentLinkUrl.trim()}
                      size={128}
                      level="M"
                    />
                  </div>
                ) : licensePolicy.mode === 'PAID_MONTHLY' ? (
                  <div className="w-36 min-h-32 rounded-xl border border-amber-500/50 bg-amber-500/10 flex items-center justify-center p-2.5 text-[10px] text-amber-200 font-sans">
                    ⚠️ Paid Mode ఆన్‌లో ఉంది! ఆపరేటర్లకు QR రావాలంటే Alias UPI ID లేదా Gateway Link సేవ్ చేయండి.
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-dashed border-slate-700 flex items-center justify-center p-2 text-[10px] text-slate-500 font-sans">
                    Alias UPI ID సేవ్ చేస్తే QR ఇక్కడ ప్రివ్యూ అవుతుంది
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    UPI PAYMENT CLAIMS &amp; ANTI-DUPLICATE QUEUE ({pendingClaimsCount} PENDING)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    ప్రతి UTR నంబర్ Firestore లో ఒకేసారి సేవ్ అవుతుంది (Duplicate UTR ను సిస్టమ్ బ్లాక్ చేస్తుంది). మీ PhonePe/GPay లో UTR మ్యాచ్ అయిన తర్వాత Approve నొక్కండి.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {pendingClaimsCount > 0 && !confirmBulkApprove && (
                    <button
                      type="button"
                      onClick={() => setConfirmBulkApprove(true)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition flex items-center gap-1 mr-1"
                    >
                      <span>Bulk Approve All ({pendingClaimsCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportClaimsCsv}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 cursor-pointer transition flex items-center gap-1 mr-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((statusKey) => (
                    <button
                      key={statusKey}
                      type="button"
                      onClick={() => setClaimStatusFilter(statusKey)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        claimStatusFilter === statusKey
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {statusKey}
                    </button>
                  ))}
                </div>
              </div>

              {confirmBulkApprove && pendingClaimsCount > 0 && (
                <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-amber-200 font-sans">
                    మొత్తం <strong>{pendingClaimsCount}</strong> Pending UTR క్లెయిమ్‌లను ఒకేసారి Approve చేయాలా?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={bulkApproving}
                      onClick={async () => {
                        setBulkApproving(true);
                        const pending = paymentClaims.filter((c) => c.status === 'PENDING');
                        for (const claim of pending) {
                          try {
                            await handleApprovePaymentClaim(claim);
                          } catch {}
                        }
                        setBulkApproving(false);
                        setConfirmBulkApprove(false);
                        showSuccess(`Approved all ${pending.length} pending claims!`, 'Bulk Approve Complete');
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {bulkApproving ? 'Approving...' : `Confirm Approve (${pendingClaimsCount})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmBulkApprove(false)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {confirmDeleteClaim && (
                <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-rose-200 font-sans">
                    UTR క్లెయిమ్ <strong className="font-mono text-white">{confirmDeleteClaim.utrNumber}</strong> ({confirmDeleteClaim.pcName}) ను శాశ్వతంగా డిలీట్ చేయాలా?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={deletingClaimId === confirmDeleteClaim.claimId}
                      onClick={() => handleDeletePaymentClaim(confirmDeleteClaim)}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {deletingClaimId === confirmDeleteClaim.claimId ? 'Deleting...' : 'Confirm Delete UTR'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteClaim(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Search UTR claims"
                  value={claimSearchFilter}
                  onChange={(e) => setClaimSearchFilter(e.target.value)}
                  placeholder="Search UTR number, PC ID, Operator, District..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">UTR / REF NUMBER</th>
                    <th className="p-3.5">PC NAME &amp; MACHINE ID</th>
                    <th className="p-3.5">OPERATOR &amp; DISTRICT</th>
                    <th className="p-3.5">AMOUNT &amp; DUPLICATE CHECK</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">ADMIN ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                        ఎంచుకున్న ఫిల్టర్‌లో ఇంకా ఏ పేమెంట్ UTR క్లెయిమ్ లేదు. Paid Mode ఆన్ అయిన తర్వాత యూజర్లు పంపే 12-అంకెల UTR ఇక్కడ కనిపిస్తుంది.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => {
                      const samePcOthers = paymentClaims.filter(
                        (other) =>
                          other.claimId !== claim.claimId &&
                          String(other.pcId || '').toUpperCase() === String(claim.pcId || '').toUpperCase() &&
                          other.status !== 'REJECTED'
                      );
                      const dupInfo = inspectPaymentClaimDuplicate(
                        paymentClaims.filter((o) => o.claimId !== claim.claimId),
                        claim.utrNumber,
                        claim.pcId
                      );
                      return (
                        <tr key={claim.claimId} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-amber-300">{claim.utrNumber}</div>
                            <div className="text-[10px] text-slate-400">
                              {claim.createdAtIso ? new Date(claim.createdAtIso).toLocaleString() : 'Live'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{claim.pcName}</div>
                            <div className="text-[10px] text-cyan-400">{claim.pcId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-200">{claim.operatorName || 'Operator'}</div>
                            <div className="text-[10px] text-slate-400">
                              {claim.district || ''} {claim.state ? `(${claim.state})` : ''}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-emerald-300">₹{claim.amountInr}</div>
                            {(samePcOthers.length > 0 || dupInfo.isExactUtrDuplicate) && (
                              <div className="text-[10px] text-amber-400 font-sans mt-0.5">
                                ⚠️ Double-Pay Check: ఈ PC లో ఇప్పటికే {samePcOthers.length} ఇతర క్లెయిమ్(లు) ఉన్నాయి
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                claim.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : claim.status === 'REJECTED'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </td>
                          <td className="p-3.5 flex flex-wrap items-center gap-2">
                            {claim.status === 'PENDING' ? (
                              <>
                                <button
                                  type="button"
                                  disabled={reviewingClaimId === claim.claimId}
                                  onClick={() => handleApprovePaymentClaim(claim)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  ✅ Approve UTR &amp; +{licensePolicy.durationDays}d
                                </button>
                                <button
                                  type="button"
                                  disabled={reviewingClaimId === claim.claimId}
                                  onClick={() => handleRejectPaymentClaim(claim)}
                                  className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  🚫 Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans">{claim.note || claim.status}</span>
                            )}
                            <button
                              type="button"
                              aria-label={`Delete UTR claim ${claim.utrNumber}`}
                              disabled={deletingClaimId === claim.claimId}
                              onClick={() => setConfirmDeleteClaim(claim)}
                              className="bg-slate-800 hover:bg-rose-700 text-rose-300 hover:text-white px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                              title="Delete test or unnecessary UTR claim"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    🖥️ PER-PC SUBSCRIPTION &amp; ADMIN FREE-BYPASS MANAGER (₹{licensePolicy.monthlyPriceInr} / {licensePolicy.durationDays} DAYS)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    ఏ PC కైనా <strong>"🔓 Payment OFF (Free PC)"</strong> ఇవ్వవచ్చు, లేదా ట్రయల్ వేసిన PCలను <strong>"🔄 Reset Trial"</strong> తో తిరిగి ఫ్రెష్ డిఫాల్ట్ స్థితికి రీసెట్ చేయవచ్చు.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.keys(pcLicensesMap).length > 0 && !confirmResetAllOverrides && (
                    <button
                      type="button"
                      onClick={() => setConfirmResetAllOverrides(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All Trial Overrides ({Object.keys(pcLicensesMap).length})</span>
                    </button>
                  )}
                  <span className="text-[11px] text-emerald-400 font-bold">Per-PC Payment Override Ready</span>
                </div>
              </div>

              {confirmResetAllOverrides && Object.keys(pcLicensesMap).length > 0 && (
                <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-amber-200 font-sans">
                    మొత్తం <strong>{Object.keys(pcLicensesMap).length}</strong> ట్రయల్ / కస్టమ్ PC లైసెన్స్ రికార్డులను ఒకేసారి రీసెట్ చేయాలా? (ఆ తర్వాత అన్ని PCలు గ్లోబల్ పాలసీ ప్రకారం ఫ్రెష్‌గా పనిచేస్తాయి)
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={resettingAllOverrides}
                      onClick={handleResetAllPcOverrides}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {resettingAllOverrides ? 'Resetting...' : `Confirm Reset All (${Object.keys(pcLicensesMap).length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetAllOverrides(false)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {confirmResetPc && (
                <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-amber-200 font-sans">
                    ట్రయల్ PC <strong className="font-mono text-white">{confirmResetPc.pcName} ({confirmResetPc.pcId})</strong> లైసెన్స్/బైపాస్‌ను రీసెట్ చేయాలా? (ఇది Free PC / Paid / Revoked ఓవర్‌రైడ్‌ను తొలగించి ఫ్రెష్ స్టేట్‌కు తెస్తుంది)
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={activatingPcId === confirmResetPc.pcId}
                      onClick={() => handleResetPcTrialLicense(confirmResetPc.pcId, confirmResetPc.pcName)}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {activatingPcId === confirmResetPc.pcId ? 'Resetting...' : 'Confirm Reset Trial'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetPc(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                  <div className="text-[11px] font-bold text-cyan-300 shrink-0">
                    PC ID Control:
                  </div>
                  <input
                    type="text"
                    aria-label="PC Machine ID"
                    placeholder="PC Machine ID (ఉదా: EVD-TS-MNCL-01)"
                    value={bypassPcIdInput}
                    onChange={(e) => setBypassPcIdInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono"
                  />
                  <input
                    type="text"
                    aria-label="PC Name or Office Name"
                    placeholder="PC Name / ఆఫీస్ పేరు (Optional)"
                    value={bypassPcNameInput}
                    onChange={(e) => setBypassPcNameInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <select
                    aria-label="Subscription Duration Preset"
                    value={customActivateDays}
                    onChange={(e) => setCustomActivateDays(Number(e.target.value) || 30)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold shrink-0"
                  >
                    <option value={30}>+30 Days (1 Mo)</option>
                    <option value={90}>+90 Days (3 Mo)</option>
                    <option value={180}>+180 Days (6 Mo)</option>
                    <option value={365}>+365 Days (1 Yr)</option>
                  </select>
                  <button
                    type="button"
                    disabled={!bypassPcIdInput.trim() || activatingPcId === resolveExactPcId(bypassPcIdInput)}
                    onClick={() => handleSetPcFreeBypass(bypassPcIdInput, bypassPcNameInput, true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    Free PC
                  </button>
                  <button
                    type="button"
                    disabled={!bypassPcIdInput.trim() || activatingPcId === resolveExactPcId(bypassPcIdInput)}
                    onClick={() => handleActivatePcSubscription({ pcId: bypassPcIdInput, pcName: bypassPcNameInput }, customActivateDays)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    +{customActivateDays}d Paid
                  </button>
                  <button
                    type="button"
                    disabled={!bypassPcIdInput.trim() || activatingPcId === resolveExactPcId(bypassPcIdInput)}
                    onClick={() =>
                      setConfirmResetPc({
                        pcId: resolveExactPcId(bypassPcIdInput),
                        pcName: bypassPcNameInput.trim() || resolveExactPcId(bypassPcIdInput)
                      })
                    }
                    className="bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center gap-1"
                    title="Reset Trial / Clear custom license for this PC ID"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Trial</span>
                  </button>
                </div>

                <div className="relative lg:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="Search managed PCs"
                    value={pcSearchFilter}
                    onChange={(e) => setPcSearchFilter(e.target.value)}
                    placeholder="Search PC Name, ID, District..."
                    className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">PC NAME &amp; MACHINE ID</th>
                    <th className="p-3.5">OPERATOR &amp; OFFICE</th>
                    <th className="p-3.5">CURRENT LICENSE STATUS</th>
                    <th className="p-3.5">VALID UNTIL</th>
                    <th className="p-3.5">ADMIN ACTION (PER-PC CONTROL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(() => {
                    const combinedMap = new Map<string, any>();
                    installedPcs.forEach((p) => {
                      const k = String(p.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-').toUpperCase();
                      if (k) combinedMap.set(k, p);
                    });
                    (Object.values(pcLicensesMap) as PcLicenseRecord[]).forEach((lic) => {
                      const k = String(lic.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-').toUpperCase();
                      if (k && !combinedMap.has(k)) {
                        combinedMap.set(k, {
                          pcId: lic.pcId,
                          pcName: lic.pcName || lic.pcId,
                          userName: 'Whitelisted PC',
                          district: 'Admin Override',
                          officeLocation: lic.planType === 'FREE_ACCESS' ? 'Payment Mode OFF (Free Bypass)' : 'Custom License'
                        });
                      }
                    });
                    const q = pcSearchFilter.trim().toLowerCase();
                    const allManagedPcs = Array.from(combinedMap.values()).filter((p) => {
                      if (!q) return true;
                      return (
                        String(p.pcId || '').toLowerCase().includes(q) ||
                        String(p.pcName || '').toLowerCase().includes(q) ||
                        String(p.userName || '').toLowerCase().includes(q) ||
                        String(p.district || '').toLowerCase().includes(q) ||
                        String(p.officeLocation || '').toLowerCase().includes(q)
                      );
                    });

                    if (allManagedPcs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                            రియల్ PCలు ఇన్‌స్టాల్ అయిన వెంటనే లేదా పైన ఉన్న బాక్స్‌లో PC ID ఎంటర్ చేసిన వెంటనే ఇక్కడ కనిపిస్తాయి.
                          </td>
                        </tr>
                      );
                    }

                    return allManagedPcs.map((pc, i) => {
                      const cleanId = String(pc.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-');
                      const rec = pcLicensesMap[cleanId.toUpperCase()] || null;
                      const isFreeExempt = isPcPaymentExempt(rec);
                      const evalRes = evaluateLicenseState(licensePolicy, rec);
                      return (
                        <tr key={cleanId || i} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{pc.pcName}</div>
                            <div className="text-[10px] text-cyan-400">{cleanId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-200">{pc.userName || 'Operator'}</div>
                            <div className="text-[10px] text-slate-400">{pc.district} — {pc.officeLocation}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isFreeExempt
                                ? 'bg-violet-500/25 text-violet-200 border border-violet-400/40'
                                : evalRes.allowed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {evalRes.badgeText}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 text-[11px]">
                            {isFreeExempt
                              ? '♾️ Unlimited (Payment OFF)'
                              : rec?.validUntilIso
                                ? new Date(rec.validUntilIso).toLocaleDateString()
                                : licensePolicy.mode === 'FREE_FOR_ALL'
                                  ? 'Free Mode Active'
                                  : 'Not Activated'}
                          </td>
                          <td className="p-3.5 flex flex-wrap items-center gap-2">
                            {isFreeExempt ? (
                              <button
                                type="button"
                                disabled={activatingPcId === cleanId}
                                onClick={() => handleSetPcFreeBypass(cleanId, pc.pcName, false)}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                              >
                                💳 Turn Payment ON
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={activatingPcId === cleanId}
                                onClick={() => handleSetPcFreeBypass(cleanId, pc.pcName, true)}
                                className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                              >
                                🔓 Payment OFF (Free PC)
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={activatingPcId === cleanId}
                              onClick={() => handleActivatePcSubscription(pc, customActivateDays)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            >
                              +{customActivateDays}d Paid
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const link = buildOperatorCheckoutUrl(cleanId, pc.pcName);
                                navigator.clipboard.writeText(link);
                                showInfo(`${pc.pcName} వ్యక్తిగత QR Pay Link కాపీ అయింది!`, 'Pay Link Copied');
                              }}
                              className="bg-slate-800 hover:bg-cyan-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                              title="Copy personalized QR Checkout Link for WhatsApp/Telegram"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Pay Link</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Revoke license for ${pc.pcName || cleanId}`}
                              disabled={activatingPcId === cleanId}
                              onClick={() => handleRevokePcSubscription(pc)}
                              className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            >
                              Revoke
                            </button>
                            <button
                              type="button"
                              aria-label={`Reset trial license for ${pc.pcName || cleanId}`}
                              disabled={activatingPcId === cleanId}
                              onClick={() => setConfirmResetPc({ pcId: cleanId, pcName: pc.pcName || cleanId })}
                              className="bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                              title="Reset Trial / Clear custom license record for this PC"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Trial</span>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
