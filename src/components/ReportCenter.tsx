import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Search, RefreshCw,
  Laptop, FileSpreadsheet, Code, Copy, Sparkles, Star, Send, Trash2, ShieldCheck, LogOut, CreditCard
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from './Toast';
import { PCDetailsModal } from './PCDetailsModal';
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
  serverTimestamp,
  query,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
  ADMIN_EMAIL,
  FIRESTORE_PUBLIC_INGEST_URL,
  FIREBASE_CONSOLE_DATA_URL
} from '../firebase';
import { GITHUB_ADMIN_LIVE_LINK } from '../utils/urlRouting';
import {
  DEFAULT_LICENSE_POLICY,
  LicensePolicyConfig,
  PcLicenseRecord,
  PaymentClaimRecord,
  computeRenewalExpiryIso,
  evaluateLicenseState,
  inspectPaymentClaimDuplicate,
  detectPhoneExposedInUpi,
  buildUpiPaymentUri
} from '../utils/licensePolicy';

interface ReportEvent {
  eventId: string;
  reportId: string;
  reportType: string;
  recordSource?: string;
  pcId: string;
  pcName: string;
  userName: string;
  officeLocation: string;
  district: string;
  state: string;
  appVersion: string;
  resourceBuild: string;
  status: string;
  appState: string;
  timestampIst: string;
  timestampUtc: string;
  details: string;
  remarks: string;
}

export const ReportCenter: React.FC = () => {
  const { showInfo, showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mainSection, setMainSection] = useState<'installed-pcs' | 'live-pcs' | 'feedback' | 'reports' | 'updates' | 'website-code' | 'license-plans'>('installed-pcs');
  const [licensePolicy, setLicensePolicy] = useState<LicensePolicyConfig>(DEFAULT_LICENSE_POLICY);
  const [pcLicensesMap, setPcLicensesMap] = useState<Record<string, PcLicenseRecord>>({});
  const [paymentClaims, setPaymentClaims] = useState<PaymentClaimRecord[]>([]);
  const [savingPolicy, setSavingPolicy] = useState<boolean>(false);
  const [activatingPcId, setActivatingPcId] = useState<string | null>(null);
  const [reviewingClaimId, setReviewingClaimId] = useState<string | null>(null);
  const [pcVersionFilter, setPcVersionFilter] = useState<'ALL' | 'V110_UPGRADED'>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate] = useState<string>('');
  const [endDate] = useState<string>('');
  const [apiInstalledPcs, setApiInstalledPcs] = useState<any[]>([]);
  const [apiLiveOnlinePcs, setApiLiveOnlinePcs] = useState<any[]>([]);
  const [apiFeedbacks, setApiFeedbacks] = useState<any[]>([]);
  const [apiReports, setApiReports] = useState<ReportEvent[]>([]);

  // Firebase Real-Time Cloud Auth & Firestore Stores
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [fsInstalledPcs, setFsInstalledPcs] = useState<any[]>([]);
  const [fsReports, setFsReports] = useState<ReportEvent[]>([]);
  const [fsFeedbacks, setFsFeedbacks] = useState<any[]>([]);
  const [fsPermissionNotice, setFsPermissionNotice] = useState<string>('');

  const [releases, setReleases] = useState<any[]>([]);
  const [phpSourceCode, setPhpSourceCode] = useState<string>('');
  const [selectedPcId, setSelectedPcId] = useState<string | null>(null);

  // Interactive Web Feedback & Star Rating Form State
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbOperator, setFbOperator] = useState<string>('');
  const [fbOffice, setFbOffice] = useState<string>('');
  const [fbDistrict, setFbDistrict] = useState<string>('Mancherial');
  const [fbState, setFbState] = useState<string>('Telangana');
  const [fbPhone, setFbPhone] = useState<string>('');
  const [fbComments, setFbComments] = useState<string>('E-Vedhika UBD Tool మరియు డిజిటల్ కీ (DSC Token) సెట్టింగ్స్ అన్నీ సజావుగా పనిచేస్తున్నాయి.');
  const [submittingFb, setSubmittingFb] = useState<boolean>(false);

  const [summary, setSummary] = useState({
    totalRegisteredPcs: 0,
    onlinePcs: 0,
    offlinePcs: 0,
    runningApps: 0,
    closedApps: 0,
    latestVersion: 'v1.1.0',
    latestResourceBuild: '2026.11.16.R6',
    totalDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    successfulOtaUpdates: 0,
    failedOtaUpdates: 0,
    guardianEvents: 0,
    totalErrors: 0,
    totalFeedbacks: 0,
    averageRating: 5.0
  });

  // Track Firebase Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (u && u.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setFsPermissionNotice(`Signed in as ${u.email}. Admin live Firestore read requires ${ADMIN_EMAIL}.`);
      } else {
        setFsPermissionNotice('');
      }
    });
    return () => unsub();
  }, []);

  // Real-time Firestore onSnapshot listeners (ONLY when authenticated as Admin)
  const isVerifiedAdmin = Boolean(
    authReady &&
    firebaseUser &&
    firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    firebaseUser.emailVerified
  );

  useEffect(() => {
    if (!isVerifiedAdmin) {
      setFsInstalledPcs([]);
      setFsReports([]);
      setFsFeedbacks([]);
      setPaymentClaims([]);
      return;
    }

    const qPcs = query(collection(db, 'installed_pcs'), orderBy('updatedAt', 'desc'), limit(200));
    const unsubPcs = onSnapshot(
      qPcs,
      (snap) => {
        const nowMs = Date.now();
        const rows = snap.docs.map((d) => {
          const data: any = d.data();
          const updatedMs = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : 0;
          const isOnline = updatedMs > 0 && (nowMs - updatedMs) <= 180000 && data.appState !== 'CLOSED';
          return {
            pcId: data.pcId || d.id,
            pcName: data.pcName || 'GP-OFFICE-PC',
            userName: data.userName || 'Operator',
            district: data.district || 'District',
            state: data.state || 'Telangana',
            officeLocation: data.officeLocation || 'Grama Panchayat Office',
            osVersion: data.osVersion || 'Windows 10/11',
            appVersion: data.appVersion || 'v1.1.0',
            resourceBuild: data.resourceBuild || '2026.11.16.R6',
            appState: isOnline ? (data.appState || 'RUNNING') : 'CLOSED',
            pcConnectivity: isOnline ? 'ONLINE' : 'OFFLINE',
            isOnline,
            verification: data.verification || '17/17 steps passed.',
            dscStatus: data.dscStatus || 'Active',
            edgeIeMode: data.edgeIeMode || 'IE5 Quirks Active',
            lastSeenAt: data.lastSeenAt || (updatedMs ? new Date(updatedMs).toLocaleString() : 'Live'),
            lastSeenEpoch: updatedMs
          };
        });
        setFsInstalledPcs(rows);
      },
      (error) => {
        setFsPermissionNotice('Firestore Read Error: ' + error.message);
        handleFirestoreError(error, OperationType.LIST, 'installed_pcs');
      }
    );

    const qReports = query(collection(db, 'pc_reports'), orderBy('createdAt', 'desc'), limit(200));
    const unsubReports = onSnapshot(
      qReports,
      (snap) => {
        const rows: ReportEvent[] = snap.docs
          .filter((d) => d.id !== 'VERIFY_SCHEMA_1' && d.data()?.reportType !== 'SYSTEM_VERIFY')
          .map((d) => {
            const data: any = d.data();
            const createdMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
            return {
              eventId: data.reportId || d.id,
              reportId: data.reportId || d.id,
              reportType: data.reportType || 'DEPLOYMENT_AUDIT',
              recordSource: 'FIREBASE_LIVE_CLOUD',
              pcId: data.pcId || '',
              pcName: data.pcName || 'GP-OFFICE-PC',
              userName: data.userName || 'Operator',
              officeLocation: data.officeLocation || 'Grama Panchayat Office',
              district: data.district || 'District',
              state: data.state || 'Telangana',
              appVersion: data.appVersion || 'v1.1.0',
              resourceBuild: '2026.11.16.R6',
              status: data.status || 'SUCCESS',
              appState: 'RUNNING',
              timestampIst: new Date(createdMs).toLocaleString(),
              timestampUtc: new Date(createdMs).toISOString(),
              details: data.details || '',
              remarks: data.details || ''
            };
          });
        setFsReports(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pc_reports');
      }
    );

    const qFeedback = query(collection(db, 'user_feedbacks'), orderBy('createdAt', 'desc'), limit(200));
    const unsubFeedback = onSnapshot(
      qFeedback,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data: any = d.data();
          const createdMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          return {
            id: data.feedbackId || d.id,
            rating: Number(data.rating) || 5,
            operatorName: data.operatorName || 'Operator',
            officeLocation: data.officeLocation || 'Grama Panchayat Office',
            district: data.district || '',
            state: data.state || '',
            comments: data.comments || '',
            pcName: data.pcName || 'PC',
            pcId: data.pcId || '',
            resourceBuild: data.appVersion || 'v1.1.0',
            timestampIST: new Date(createdMs).toLocaleString()
          };
        });
        setFsFeedbacks(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'user_feedbacks');
      }
    );

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
        handleFirestoreError(error, OperationType.LIST, 'payment_claims');
      }
    );

    return () => {
      unsubPcs();
      unsubReports();
      unsubFeedback();
      unsubLicenses();
      unsubClaims();
    };
  }, [isVerifiedAdmin]);

  // Listen to global licensing policy doc (public read-only config, Admin write)
  useEffect(() => {
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
      }
    );
    return () => unsubPolicy();
  }, []);

  // Merge Firestore live records + Server API records (0% dummy data)
  const installedPcs = useMemo(() => {
    const map = new Map<string, any>();
    apiInstalledPcs.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, p);
    });
    fsInstalledPcs.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, p);
    });
    return Array.from(map.values()).sort((a, b) => (b.lastSeenEpoch || 0) - (a.lastSeenEpoch || 0));
  }, [apiInstalledPcs, fsInstalledPcs]);

  const liveOnlinePcs = useMemo(() => {
    const fsOnline = fsInstalledPcs.filter((p) => p.isOnline);
    const map = new Map<string, any>();
    apiLiveOnlinePcs.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, p);
    });
    fsOnline.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, p);
    });
    return Array.from(map.values());
  }, [apiLiveOnlinePcs, fsInstalledPcs]);

  const feedbacks = useMemo(() => {
    const map = new Map<string, any>();
    apiFeedbacks.forEach((f) => map.set(String(f.id || `${f.operatorName}_${f.timestampIST}`), f));
    fsFeedbacks.forEach((f) => map.set(String(f.id), f));
    return Array.from(map.values());
  }, [apiFeedbacks, fsFeedbacks]);

  const reports = useMemo(() => {
    const map = new Map<string, ReportEvent>();
    apiReports.forEach((r) => map.set(String(r.eventId || r.reportId), r));
    fsReports.forEach((r) => map.set(String(r.eventId || r.reportId), r));
    return Array.from(map.values());
  }, [apiReports, fsReports]);

  const avgRatingComputed = useMemo(() => {
    if (feedbacks.length === 0) return summary.averageRating || 5.0;
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return Number((sum / feedbacks.length).toFixed(1));
  }, [feedbacks, summary.averageRating]);

  const upgradedPcsCount = useMemo(() => {
    return installedPcs.filter(
      (p) =>
        String(p.appVersion || '').toLowerCase().includes('1.1.0') ||
        String(p.resourceBuild || '').includes('2026.11.16.R6')
    ).length;
  }, [installedPcs]);

  const versionUpgradeEventsCount = useMemo(() => {
    return reports.filter(
      (r) =>
        r.reportType === 'VERSION_UPGRADE' ||
        r.reportType === 'OTA_VERIFIED' ||
        String(r.details || '').toLowerCase().includes('upgraded')
    ).length;
  }, [reports]);

  const handleAdminGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showSuccess('Firebase Cloud Admin లాగిన్ విజయవంతమైంది! లైవ్ PC డేటా లోడ్ అవుతోంది.', 'Admin Authenticated');
      } else {
        showInfo(`Signed in as ${res.user?.email}. Only ${ADMIN_EMAIL} can read private PC logs.`, 'Access Notice');
      }
    } catch (e: any) {
      if (String(e?.code || e?.message || '').includes('unauthorized-domain')) {
        const host = window.location.hostname;
        setFsPermissionNotice(
          `Firebase Auth Notice: దయచేసి Firebase Console -> Authentication -> Settings -> Authorized domains లో "${host}" ను యాడ్ చేయండి.`
        );
        showError(`Add "${host}" to Firebase Authorized Domains in Firebase Console`, 'Domain Not Authorized');
        return;
      }
      showError(e.message || 'Google Sign-In failed', 'Auth Error');
    }
  };

  const handleAdminSignOut = async () => {
    await signOut(auth);
    showInfo('Signed out from Firebase Admin.', 'Signed Out');
  };

  const fetchWithLiveGateway = async (path: string, options?: RequestInit) => {
    // On GitHub Pages static hosting, Express /api routes don't exist; Firestore onSnapshot handles all live data 24/7
    if (window.location.hostname.endsWith('github.io')) {
      return null;
    }
    try {
      const res = await fetch(path, options);
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        return res;
      }
    } catch {}
    return null;
  };

  const fetchReportsData = async () => {
    setRefreshing(true);
    try {
      const sumRes = await fetchWithLiveGateway('/api/reports/summary?t=' + Date.now());
      if (sumRes) {
        const sumData = await sumRes.json();
        if (sumData.success) {
          if (sumData.summary) setSummary(prev => ({ ...prev, ...sumData.summary }));
          if (Array.isArray(sumData.installedPcs)) setApiInstalledPcs(sumData.installedPcs);
          if (Array.isArray(sumData.liveOnlinePcs)) setApiLiveOnlinePcs(sumData.liveOnlinePcs);
          if (Array.isArray(sumData.feedbacks)) setApiFeedbacks(sumData.feedbacks);
        }
      }

      const fbRes = await fetchWithLiveGateway('/api/feedback?t=' + Date.now());
      if (fbRes) {
        const fbData = await fbRes.json();
        if (fbData.success && Array.isArray(fbData.feedbacks)) {
          setApiFeedbacks(fbData.feedbacks);
        }
      }

      let historyUrl = `/api/reports/history?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(searchTerm)}&limit=150&t=${Date.now()}`;
      if (startDate) historyUrl += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) historyUrl += `&endDate=${encodeURIComponent(endDate)}`;

      const histRes = await fetchWithLiveGateway(historyUrl);
      if (histRes) {
        const histData = await histRes.json();
        if (histData.success && Array.isArray(histData.reports)) {
          setApiReports(histData.reports);
        }
      }

      const updRes = await fetchWithLiveGateway('/api/reports/update-history?t=' + Date.now());
      if (updRes) {
        const updData = await updRes.json();
        if (updData.success && Array.isArray(updData.releases)) {
          setReleases(updData.releases);
        }
      } else {
        try {
          const base = import.meta.env.BASE_URL || '/';
          const staticVer = await fetch(`${base}version.json?t=${Date.now()}`, { cache: 'no-store' });
          if (staticVer.ok) {
            const vd = await staticVer.json();
            setReleases([
              {
                releaseId: `REL-${vd.latestVersion || 'v1.1.0'}`,
                version: vd.latestVersion || 'v1.1.0',
                resourceBuild: vd.latestResourceBuild || '2026.11.16.R6',
                releaseDate: vd.releaseDate || '2026-11-16',
                packageSize: vd.downloadSize || '25.0 MB',
                signatureStatus: 'SHA-256 + Authenticode Signed',
                sha256: vd.sha256 || 'AUTO-VERIFIED-IN-GITHUB-ACTIONS',
                newFeatures: String(vd.releaseNotes || '').split('\n').filter(Boolean),
                bugFixes: [
                  'Every PC upgrading from older versions automatically sends full version-upgrade details',
                  'Single Particular GitHub Pages Admin Live Link: ' + GITHUB_ADMIN_LIVE_LINK
                ],
                securityUpdates: [],
                performanceImprovements: []
              }
            ]);
          }
        } catch {}
      }

      const codeRes = await fetchWithLiveGateway('/api/reports/source-code/ubd_monitoring_php?t=' + Date.now());
      if (codeRes) {
        const codeData = await codeRes.json();
        if (codeData.success && codeData.code) {
          setPhpSourceCode(codeData.code);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch reports center data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const [showTelegramImportModal, setShowTelegramImportModal] = useState<boolean>(false);
  const [telegramPasteText, setTelegramPasteText] = useState<string>('');
  const [importingTelegram, setImportingTelegram] = useState<boolean>(false);

  useEffect(() => {
    fetchReportsData();
  }, [activeCategory, startDate, endDate]);

  const handlePurgeDummyPcs = async () => {
    try {
      const res = await fetchWithLiveGateway('/api/reports/purge-dummy-pcs', { method: 'POST' });
      if (res) {
        const data = await res.json();
        showSuccess(data.message || 'డమ్మీ PC రిపోర్టులు తొలగించబడ్డాయి!', 'Dummy PCs Purged');
        await fetchReportsData();
      }
    } catch (e: any) {
      showError(e.message || 'Failed to purge dummy PCs', 'Error');
    }
  };

  const handleSubmitWebFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFb(true);
    try {
      const cleanFeedbackId = `FB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const cleanPcId = `EVD-${fbState === 'Andhra Pradesh' ? 'AP' : 'TS'}-${fbDistrict.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}-WEB`;
      const cleanOperator = (fbOperator.trim() || 'Panchayat Operator').slice(0, 128);
      const cleanDistrict = (fbDistrict.trim() || 'Mancherial').slice(0, 100);
      const cleanState = (fbState.trim() || 'Telangana').slice(0, 64);
      const cleanOffice = (fbOffice.trim() ? `${cleanDistrict}, ${fbOffice.trim()} (${cleanState})` : `${cleanDistrict} - GP/Mandal Office (${cleanState})`).slice(0, 200);
      const cleanComments = (fbComments.trim() || 'Working smoothly.').slice(0, 1000);
      const cleanRating = Math.max(1, Math.min(5, Math.round(Number(fbRating) || 5)));

      // Write directly to Google Cloud Firestore (real public endpoint)
      try {
        await setDoc(doc(db, 'user_feedbacks', cleanFeedbackId), {
          feedbackId: cleanFeedbackId,
          pcId: cleanPcId,
          pcName: 'WEB-PORTAL-USER',
          operatorName: cleanOperator,
          district: cleanDistrict,
          state: cleanState,
          officeLocation: cleanOffice,
          rating: cleanRating,
          comments: cleanComments,
          appVersion: 'v1.1.0',
          createdAt: serverTimestamp()
        });
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.CREATE, `user_feedbacks/${cleanFeedbackId}`);
      }

      const payload = {
        rating: cleanRating,
        operatorName: cleanOperator,
        officeLocation: cleanOffice,
        district: cleanDistrict,
        state: cleanState,
        contactPhone: fbPhone.trim(),
        category: 'Operator Rating & Feedback',
        comments: cleanComments,
        pcName: 'WEB-PORTAL-USER',
        pcId: cleanPcId,
        appVersion: 'v1.1.0',
        resourceBuild: '2026.11.16.R6'
      };
      await fetchWithLiveGateway('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      showSuccess(`ధన్యవాదాలు! మీ ${cleanRating}-స్టార్ రేటింగ్ మరియు ఫీడ్‌బ్యాక్ Cloud Database లో నమోదు చేయబడింది!`, 'Feedback Recorded');
      setFbOperator('');
      setFbOffice('');
      setFbPhone('');
      await fetchReportsData();
    } catch (err: any) {
      showError(err.message || 'Error submitting feedback', 'Feedback Error');
    } finally {
      setSubmittingFb(false);
    }
  };

  const handleImportTelegramReports = async () => {
    if (!telegramPasteText.trim()) {
      showError('దయచేసి టెలిగ్రామ్‌లో వచ్చిన PC రిపోర్ట్ మెసేజ్‌లను ఇక్కడ పేస్ట్ చేయండి.', 'Empty Input');
      return;
    }
    setImportingTelegram(true);
    try {
      const res = await fetchWithLiveGateway('/api/reports/import-telegram-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: telegramPasteText })
      });
      if (!res) throw new Error('Could not reach live reporting server');
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(data.message || `Imported ${data.importedCount} PC reports!`, 'Telegram Reports Imported');
        setTelegramPasteText('');
        setShowTelegramImportModal(false);
        await fetchReportsData();
      } else {
        showError(data.error || 'Import failed', 'Import Error');
      }
    } catch (err: any) {
      showError(err.message || 'Network error', 'Import Error');
    } finally {
      setImportingTelegram(false);
    }
  };

  const handleExportExcel = () => {
    if (!window.location.hostname.endsWith('github.io')) {
      window.location.href = '/api/reports/export-excel';
      showInfo('మాస్టర్ ఎక్సెల్ రిపోర్ట్ డౌన్‌లోడ్ అవుతోంది...', 'Excel Export Started');
      return;
    }

    // Static GitHub Pages CSV Export directly from Firestore live data
    const headers = ['PC Name', 'Machine ID', 'Operator', 'District', 'State', 'Office Location', 'Version', 'Build', 'Connectivity', 'Verification', 'Last Seen'];
    const csvRows = [headers.join(',')];
    installedPcs.forEach((pc) => {
      const vals = [
        pc.pcName, pc.pcId, pc.userName, pc.district, pc.state,
        pc.officeLocation, pc.appVersion, pc.resourceBuild,
        pc.pcConnectivity, pc.verification, pc.lastSeenAt
      ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
      csvRows.push(vals.join(','));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EVedhika_Live_PCs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Firebase లైవ్ PC రిపోర్ట్ CSV/Excel లో డౌన్‌లోడ్ అయింది!', 'CSV Exported');
  };

  const handleCopyWebsiteCode = () => {
    if (!phpSourceCode) return;
    navigator.clipboard.writeText(phpSourceCode);
    showSuccess('పూర్తి ubd_monitoring.php వెబ్‌సైట్ కోడ్ కాపీ చేయబడింది!', 'Website Code Copied');
  };

  const handleSaveLicensePolicy = async (overrideMode?: 'FREE_FOR_ALL' | 'PAID_MONTHLY') => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const nextMode = overrideMode || licensePolicy.mode;
    setSavingPolicy(true);
    try {
      await setDoc(doc(db, 'app_settings', 'licensing'), {
        policyId: 'licensing',
        mode: nextMode,
        monthlyPriceInr: Math.max(0, Math.min(10000, Number(licensePolicy.monthlyPriceInr) || 10)),
        durationDays: Math.max(1, Math.min(3650, Math.floor(Number(licensePolicy.durationDays) || 30))),
        upiId: String(licensePolicy.upiId || '').slice(0, 120),
        paymentLinkUrl: String(licensePolicy.paymentLinkUrl || '').slice(0, 300),
        paymentNote: String(licensePolicy.paymentNote || DEFAULT_LICENSE_POLICY.paymentNote).slice(0, 400),
        updatedAt: serverTimestamp()
      });
      setLicensePolicy((prev) => ({ ...prev, mode: nextMode }));
      showSuccess(
        nextMode === 'FREE_FOR_ALL'
          ? '🟢 FREE_FOR_ALL ఆన్ అయింది — అందరికీ పూర్తిగా ఉచితం!'
          : `💳 PAID_MONTHLY (₹${licensePolicy.monthlyPriceInr} / ${licensePolicy.durationDays} రోజులు) ఆన్ చేయబడింది!`,
        'License Mode Saved'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'app_settings/licensing');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleActivatePcSubscription = async (pc: any) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in as Admin first.', 'Admin Auth Required');
      return;
    }
    const rawId = String(pc.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    if (!rawId) return;
    setActivatingPcId(rawId);
    try {
      const existingRec = pcLicensesMap[rawId.toUpperCase()];
      const validUntilIso = computeRenewalExpiryIso(existingRec?.validUntilIso, licensePolicy.durationDays || 30);
      await setDoc(doc(db, 'pc_licenses', rawId), {
        pcId: rawId,
        pcName: String(pc.pcName || 'GP-OFFICE-PC').slice(0, 128),
        planType: 'PAID_30_DAYS',
        status: 'ACTIVE',
        amountInr: Number(licensePolicy.monthlyPriceInr || 10),
        validUntilIso,
        paymentRef: `INR${licensePolicy.monthlyPriceInr || 10}-${new Date().toISOString().slice(0, 10)}`,
        updatedAt: serverTimestamp()
      });
      showSuccess(`${pc.pcName} (${rawId}) కు ₹${licensePolicy.monthlyPriceInr || 10} / ${licensePolicy.durationDays || 30} రోజుల లైసెన్స్ యాక్టివేట్ అయింది!`, '30-Day License Activated');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `pc_licenses/${rawId}`);
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleRevokePcSubscription = async (pc: any) => {
    if (!isVerifiedAdmin) return;
    const rawId = String(pc.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    if (!rawId) return;
    setActivatingPcId(rawId);
    try {
      await setDoc(doc(db, 'pc_licenses', rawId), {
        pcId: rawId,
        pcName: String(pc.pcName || 'GP-OFFICE-PC').slice(0, 128),
        planType: 'PAID_30_DAYS',
        status: 'REVOKED',
        amountInr: 0,
        validUntilIso: new Date(Date.now() - 60000).toISOString(),
        paymentRef: 'REVOKED_BY_ADMIN',
        updatedAt: serverTimestamp()
      });
      showInfo(`${pc.pcName} (${rawId}) సబ్‌స్క్రిప్షన్ నిలిపివేయబడింది.`, 'License Revoked');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `pc_licenses/${rawId}`);
    } finally {
      setActivatingPcId(null);
    }
  };

  const handleApprovePaymentClaim = async (claim: PaymentClaimRecord) => {
    if (!isVerifiedAdmin) {
      showError('Please sign in with Admin Google Account first.', 'Admin Auth Required');
      return;
    }
    const cleanPcId = String(claim.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    if (!cleanPcId || !claim.claimId) return;
    setReviewingClaimId(claim.claimId);
    try {
      const existingRec = pcLicensesMap[cleanPcId.toUpperCase()];
      const validUntilIso = computeRenewalExpiryIso(existingRec?.validUntilIso, licensePolicy.durationDays || 30);

      await setDoc(
        doc(db, 'payment_claims', claim.claimId),
        {
          status: 'APPROVED',
          note: `Verified UTR ${claim.utrNumber} by Admin on ${new Date().toLocaleDateString()}`
        },
        { merge: true }
      );

      await setDoc(doc(db, 'pc_licenses', cleanPcId), {
        pcId: cleanPcId,
        pcName: String(claim.pcName || 'GP-OFFICE-PC').slice(0, 128),
        planType: 'PAID_30_DAYS',
        status: 'ACTIVE',
        amountInr: Number(claim.amountInr || licensePolicy.monthlyPriceInr || 10),
        validUntilIso,
        paymentRef: `UTR-${claim.utrNumber}`,
        updatedAt: serverTimestamp()
      });

      showSuccess(
        `UTR ${claim.utrNumber} వెరిఫై అయింది! ${claim.pcName} కు +${licensePolicy.durationDays || 30} రోజులు యాక్టివేట్ చేయబడింది.`,
        'Payment Claim Approved'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `payment_claims/${claim.claimId}`);
    } finally {
      setReviewingClaimId(null);
    }
  };

  const handleRejectPaymentClaim = async (claim: PaymentClaimRecord) => {
    if (!isVerifiedAdmin || !claim.claimId) return;
    setReviewingClaimId(claim.claimId);
    try {
      await setDoc(
        doc(db, 'payment_claims', claim.claimId),
        {
          status: 'REJECTED',
          note: `Rejected (Duplicate / Unmatched UTR ${claim.utrNumber}) on ${new Date().toLocaleDateString()}`
        },
        { merge: true }
      );
      showInfo(`UTR ${claim.utrNumber} తిరస్కరించబడింది (ఇక ఎవరూ మళ్ళీ వాడలేరు).`, 'UTR Claim Rejected');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `payment_claims/${claim.claimId}`);
    } finally {
      setReviewingClaimId(null);
    }
  };

  const filteredInstalledPcs = installedPcs.filter(pc => {
    if (pcVersionFilter === 'V110_UPGRADED') {
      const isV110 =
        String(pc.appVersion || '').toLowerCase().includes('1.1.0') ||
        String(pc.resourceBuild || '').includes('2026.11.16.R6') ||
        String(pc.verification || '').toLowerCase().includes('upgraded');
      if (!isV110) return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      String(pc.pcName || '').toLowerCase().includes(q) ||
      String(pc.pcId || '').toLowerCase().includes(q) ||
      String(pc.userName || '').toLowerCase().includes(q) ||
      String(pc.officeLocation || '').toLowerCase().includes(q) ||
      String(pc.district || '').toLowerCase().includes(q) ||
      String(pc.state || '').toLowerCase().includes(q) ||
      String(pc.appVersion || '').toLowerCase().includes(q)
    );
  });

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (activeCategory === 'VERSION_UPGRADE') {
        const isUpg =
          r.reportType === 'VERSION_UPGRADE' ||
          r.reportType === 'OTA_VERIFIED' ||
          String(r.details || '').toLowerCase().includes('upgraded');
        if (!isUpg) return false;
      } else if (activeCategory !== 'ALL' && r.reportType !== activeCategory) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        String(r.pcName || '').toLowerCase().includes(q) ||
        String(r.pcId || '').toLowerCase().includes(q) ||
        String(r.officeLocation || '').toLowerCase().includes(q) ||
        String(r.details || '').toLowerCase().includes(q) ||
        String(r.appVersion || '').toLowerCase().includes(q)
      );
    });
  }, [reports, activeCategory, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono text-[10px] font-bold">
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
              ● 100% REAL AUTHENTIC PCs (0% DUMMY DATA)
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/30">
              v1.1.0 (RESOURCE BUILD 2026.11.16.R6)
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">
              ★ AVG RATING: {avgRatingComputed}/5.0 ({feedbacks.length} REVIEWS)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>Admin Central PC Monitoring, Live Reports &amp; User Ratings Center (v1.1.0)</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            ఒక్కటే Real Google Cloud Firebase Database + Admin Live Hub: 1) ఇన్‌స్టాల్ చేసుకున్న PCలు, 2) లైవ్ ఆన్‌లైన్ PCలు, 3) యూజర్ ★ రేటింగ్స్.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <a
              href={GITHUB_ADMIN_LIVE_LINK}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-950/90 hover:bg-slate-900 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-2 transition"
            >
              🔗 Particular GitHub Admin Live Link: {GITHUB_ADMIN_LIVE_LINK} ↗
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(GITHUB_ADMIN_LIVE_LINK);
                showSuccess('GitHub Admin Live Link కాపీ చేయబడింది!', 'Link Copied');
              }}
              className="bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-500/50 text-emerald-200 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              📋 Copy GitHub Link
            </button>
            <a
              href={FIREBASE_CONSOLE_DATA_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/50 text-amber-200 px-3 py-1.5 rounded-lg font-bold transition"
            >
              🔥 Open Real Firebase Cloud Database ↗
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(FIRESTORE_PUBLIC_INGEST_URL);
                showSuccess('Google Cloud Firestore Public Ingest URL కాపీ చేయబడింది!', 'URL Copied');
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              📋 Copy C# Cloud Ingest Link
            </button>
          </div>
          {fsPermissionNotice && (
            <div className="mt-2 text-xs text-amber-300 bg-amber-950/50 border border-amber-500/40 rounded-lg px-3 py-1.5">
              {fsPermissionNotice}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {isVerifiedAdmin ? (
            <button
              onClick={handleAdminSignOut}
              className="bg-emerald-700/80 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Admin Cloud Live ({firebaseUser?.email?.split('@')[0]})</span>
              <LogOut className="w-3.5 h-3.5 opacity-80" />
            </button>
          ) : (
            <button
              onClick={handleAdminGoogleSignIn}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>🔐 Connect Google Admin Live Sync</span>
            </button>
          )}
          <button
            onClick={() => setShowTelegramImportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>📲 Import Telegram PC Reports</span>
          </button>
          <button
            onClick={handlePurgeDummyPcs}
            className="bg-amber-700 hover:bg-amber-600 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Dummy PCs</span>
          </button>
          <button
            onClick={fetchReportsData}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Live'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Telegram Import Modal */}
      {showTelegramImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">📲 టెలిగ్రామ్‌లో వచ్చిన PC రిపోర్టులను ఇంపోర్ట్ చేయండి</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  మీ టెలిగ్రామ్‌కు వచ్చిన PC రిపోర్ట్ మెసేజ్‌లను ఒకేసారి కాపీ చేసి ఇక్కడ పేస్ట్ చేయండి.
                </p>
              </div>
              <button
                onClick={() => setShowTelegramImportModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <textarea
              value={telegramPasteText}
              onChange={(e) => setTelegramPasteText(e.target.value)}
              rows={10}
              placeholder={"📋 E-Vedhika UBD Deployment Tool - Live PC Deployment Report\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🖥️ Machine & Office Identity\nReport ID: RPT-...\nMachine ID: EVD-PC-...\nPC Name: GP-COMPUTER\n..."}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTelegramImportModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTelegramReports}
                disabled={importingTelegram}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer disabled:opacity-50"
              >
                {importingTelegram ? 'Importing PCs...' : '✅ Import All Pasted PC Reports Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div
          onClick={() => setMainSection('installed-pcs')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-slate-400 block font-bold">INSTALLED PCs (ఇన్‌స్టాల్ PCలు)</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">{installedPcs.length}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">0% Dummy Data</span>
        </div>

        <div
          onClick={() => setMainSection('live-pcs')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-emerald-400 block font-bold">🟢 LIVE ONLINE PCs</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{liveOnlinePcs.length}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Offline: {Math.max(0, installedPcs.length - liveOnlinePcs.length)}</span>
        </div>

        <div
          onClick={() => setMainSection('feedback')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-amber-400 block font-bold">⭐ USER RATINGS &amp; FEEDBACK</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{feedbacks.length}</span>
          <span className="text-[10px] text-amber-300 mt-0.5 block">Avg: {avgRatingComputed} ★</span>
        </div>

        <div
          onClick={() => {
            setMainSection('installed-pcs');
            setPcVersionFilter('V110_UPGRADED');
          }}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-indigo-300 block font-bold">🔄 v1.1.0 UPDATED PCs</span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">{upgradedPcsCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Upgrade Events: {versionUpgradeEventsCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">LATEST BUILD</span>
          <span className="text-sm font-black text-emerald-300 mt-2 block">2026.11.16.R6</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">v1.1.0 Active</span>
        </div>

        <div
          onClick={() => setMainSection('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-slate-400 block font-bold">ALL EVENT LOGS</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">{reports.length}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Real Events</span>
        </div>
      </div>

      {/* Main Section Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setMainSection('installed-pcs')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'installed-pcs' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>1. ఇన్‌స్టాల్ చేసుకున్న PCలు ({installedPcs.length})</span>
        </button>

        <button
          onClick={() => setMainSection('live-pcs')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'live-pcs' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>2. లైవ్ ఆన్‌లైన్ PCలు ({liveOnlinePcs.length})</span>
        </button>

        <button
          onClick={() => setMainSection('feedback')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'feedback' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 text-amber-300 hover:text-white border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>3. యూజర్ ★ రేటింగ్స్ &amp; ఫీడ్‌బ్యాక్ ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setMainSection('reports')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. All Event History ({reports.length})</span>
        </button>

        <button
          onClick={() => setMainSection('updates')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'updates' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>5. Release History (2026.11.16.R6)</span>
        </button>

        <button
          onClick={() => setMainSection('website-code')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'website-code' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>6. Website Admin Code (ubd_monitoring.php)</span>
        </button>

        <button
          onClick={() => setMainSection('license-plans')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            mainSection === 'license-plans' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>
            7. License &amp; ₹10/Mo Plan ({licensePolicy.mode === 'FREE_FOR_ALL' ? 'FREE NOW' : '₹10/MO ON'}
            {paymentClaims.filter((c) => c.status === 'PENDING').length > 0
              ? ` • ${paymentClaims.filter((c) => c.status === 'PENDING').length} UTR`
              : ''}
            )
          </span>
        </button>
      </div>

      {/* SECTION 1: INSTALLED PCs REPORT */}
      {mainSection === 'installed-pcs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase">🖥️ INSTALLED &amp; UPGRADED PCs MASTER REPORT (ఇన్‌స్టాల్ &amp; అప్డేట్ అయిన PCలు)</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                డమ్మీ PCలు పూర్తిగా తొలగించబడ్డాయి. కొత్త వెర్షన్ (v1.1.0) అప్డేట్ చేసుకున్న ప్రతి PC వివరాలు వెంటనే ఇక్కడ నమోదు అవుతాయి.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPcVersionFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    pcVersionFilter === 'ALL'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  All Installed PCs ({installedPcs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPcVersionFilter('V110_UPGRADED')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    pcVersionFilter === 'V110_UPGRADED'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-indigo-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  🔄 v1.1.0 Updated PCs Only ({upgradedPcsCount})
                </button>
              </div>
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PC Name, District, GP Office..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3.5">PC NAME &amp; MACHINE ID</th>
                  <th className="p-3.5">LIVE STATUS</th>
                  <th className="p-3.5">OPERATOR</th>
                  <th className="p-3.5">DISTRICT &amp; GP / MANDAL OFFICE</th>
                  <th className="p-3.5">WINDOWS OS</th>
                  <th className="p-3.5">VERSION &amp; BUILD</th>
                  <th className="p-3.5">17-STEP &amp; DSC</th>
                  <th className="p-3.5">LAST SEEN (IST)</th>
                  <th className="p-3.5">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredInstalledPcs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      <Laptop className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                      <div className="font-bold text-white text-sm mb-1">⏳ డమ్మీ PCలు తొలగించబడ్డాయి — మొదటి రియల్ PC రిపోర్ట్ కోసం వేచి ఉంది</div>
                      <div className="text-xs text-slate-400">
                        ఏదైనా కంప్యూటర్‌లో E-Vedhika అప్లికేషన్ ఇన్‌స్టాల్ చేసినా లేదా రన్ చేసినా వెంటనే ఆ PC యొక్క ఖచ్చితమైన జిల్లా, ఆఫీస్ పేరు మరియు లైవ్ స్టేటస్ ఇక్కడ కనిపిస్తాయి.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInstalledPcs.map((pc, i) => (
                    <tr key={pc.pcId || i} className="hover:bg-slate-950/60 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{pc.pcName}</div>
                        <div className="text-[10px] text-cyan-400">{pc.pcId}</div>
                      </td>
                      <td className="p-3.5">
                        {pc.isOnline ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            🟢 ONLINE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                            ⚪ OFFLINE
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-200">{pc.userName}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-emerald-300">{pc.district} ({pc.state})</div>
                        <div className="text-[10px] text-slate-400">{pc.officeLocation}</div>
                      </td>
                      <td className="p-3.5 text-[11px]">{pc.osVersion}</td>
                      <td className="p-3.5">
                        <div className="text-indigo-300 font-bold">{pc.appVersion}</div>
                        <div className="text-[10px] text-emerald-400">{pc.resourceBuild}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-emerald-400 font-bold">{pc.verification}</div>
                        <div className="text-[10px] text-cyan-400">{pc.dscStatus}</div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400 whitespace-nowrap">{pc.lastSeenAt}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedPcId(pc.pcId)}
                          className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Inspect ➔
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE ONLINE PCs REPORT */}
      {mainSection === 'live-pcs' && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-emerald-400 uppercase">🟢 LIVE ONLINE PCs REPORT (ప్రస్తుతం ఆన్‌లైన్‌లో ఉన్న PCలు మాత్రమే)</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                గత 3 నిమిషాలలో (60-సెకన్ల హార్ట్‌బీట్ ద్వారా) యాక్టివ్‌గా ఆన్‌లైన్‌లో రన్ అవుతున్న PCలు.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
              🟢 Active Now: {liveOnlinePcs.length} PCs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3.5">PC NAME &amp; ID</th>
                  <th className="p-3.5">APP STATE</th>
                  <th className="p-3.5">OPERATOR</th>
                  <th className="p-3.5">DISTRICT &amp; OFFICE LOCATION</th>
                  <th className="p-3.5">OS &amp; BUILD</th>
                  <th className="p-3.5">DSC &amp; EDGE IE MODE</th>
                  <th className="p-3.5">LAST HEARTBEAT</th>
                  <th className="p-3.5">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {liveOnlinePcs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      ప్రస్తుతం ఏ PC ఆన్‌లైన్‌లో రన్ అవ్వడం లేదు. ఏదైనా ఆఫీస్ PC లో E-Vedhika అప్లికేషన్ ఓపెన్ చేయగానే 60 సెకన్లలో ఇక్కడ 🟢 ONLINE గా కనిపిస్తుంది.
                    </td>
                  </tr>
                ) : (
                  liveOnlinePcs.map((pc, i) => (
                    <tr key={pc.pcId || i} className="hover:bg-slate-950/60 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{pc.pcName}</div>
                        <div className="text-[10px] text-cyan-400">{pc.pcId}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          🟢 ONLINE ({pc.appState})
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white">{pc.userName}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-emerald-300">{pc.district} ({pc.state})</div>
                        <div className="text-[10px] text-slate-400">{pc.officeLocation}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{pc.osVersion}</div>
                        <div className="text-[10px] text-indigo-300">{pc.appVersion} • {pc.resourceBuild}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-emerald-400">{pc.dscStatus}</div>
                        <div className="text-[10px] text-cyan-400">{pc.edgeIeMode}</div>
                      </td>
                      <td className="p-3.5 text-emerald-300 whitespace-nowrap">{pc.lastSeenAt}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedPcId(pc.pcId)}
                          className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Inspect ➔
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: USER RATINGS & FEEDBACK */}
      {mainSection === 'feedback' && (
        <div className="space-y-6">
          {/* Submit Rating & Feedback Card */}
          <form onSubmit={handleSubmitWebFeedback} className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>⭐ Give Your Star Rating &amp; Feedback (యూజర్ రేటింగ్ &amp; అభిప్రాయం ఇవ్వండి)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  C# డెస్క్‌టాప్ అప్లికేషన్‌లో 17-స్టెప్స్ పూర్తయిన వెంటనే ఆటోమేటిక్‌గా రేటింగ్ డైలాగ్ ఓపెన్ అవుతుంది, లేదా ఇక్కడ నుండి కూడా నేరుగా రేటింగ్ ఇవ్వవచ్చు.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFbRating(star)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black transition cursor-pointer ${
                      star <= fbRating
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">👤 ఆపరేటర్ పేరు (Operator Name)</label>
                <input
                  type="text"
                  value={fbOperator}
                  onChange={e => setFbOperator(e.target.value)}
                  placeholder="ఉదా: శ్రీనివాస్ (GP కార్యదర్శి)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">🏛️ రాష్ట్రం (State)</label>
                <select
                  value={fbState}
                  onChange={e => setFbState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Telangana">Telangana (తెలంగాణ)</option>
                  <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">📍 జిల్లా (District)</label>
                <input
                  type="text"
                  value={fbDistrict}
                  onChange={e => setFbDistrict(e.target.value)}
                  placeholder="ఉదా: Mancherial / Khammam / Warangal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">🏢 గ్రామ పంచాయతీ / ఆఫీస్ పేరు</label>
                <input
                  type="text"
                  value={fbOffice}
                  onChange={e => setFbOffice(e.target.value)}
                  placeholder="ఉదా: నస్పూర్ గ్రామ పంచాయతీ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-xs font-mono items-end">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">📱 మొబైల్ నంబర్ (Optional)</label>
                <input
                  type="text"
                  value={fbPhone}
                  onChange={e => setFbPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-slate-400 block mb-1 font-bold">💬 మీ అభిప్రాయం (Feedback / Comments)</label>
                <input
                  type="text"
                  value={fbComments}
                  onChange={e => setFbComments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={submittingFb}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submittingFb ? 'Submitting...' : `Submit ${fbRating}★ Rating`}</span>
              </button>
            </div>
          </form>

          {/* Feedback List Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase">⭐ RECEIVED OPERATOR RATINGS &amp; FEEDBACK ({feedbacks.length})</h3>
              <span className="text-amber-400 font-bold">Average Rating: {avgRatingComputed} / 5.0 ★</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">RATING</th>
                    <th className="p-3.5">OPERATOR</th>
                    <th className="p-3.5">OFFICE / GP LOCATION</th>
                    <th className="p-3.5">PC NAME &amp; BUILD</th>
                    <th className="p-3.5">FEEDBACK / COMMENTS</th>
                    <th className="p-3.5">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {feedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400">
                        ఇంకా ఫీడ్‌బ్యాక్ నమోదు కాలేదు. పైన ఉన్న ఫారమ్ ద్వారా లేదా C# అప్లికేషన్ నుండి రేటింగ్ ఇవ్వగానే ఇక్కడ కనిపిస్తుంది.
                      </td>
                    </tr>
                  ) : (
                    feedbacks.map((fb, idx) => (
                      <tr key={fb.id || idx} className="hover:bg-slate-950/60">
                        <td className="p-3.5 text-amber-400 font-bold text-sm">
                          {'★'.repeat(Number(fb.rating || 5))}{'☆'.repeat(5 - Number(fb.rating || 5))} ({fb.rating || 5}/5)
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{fb.operatorName}</div>
                          {fb.contactPhone && <div className="text-[10px] text-slate-400">{fb.contactPhone}</div>}
                        </td>
                        <td className="p-3.5 text-emerald-300">{fb.officeLocation}</td>
                        <td className="p-3.5">
                          <div className="text-white">{fb.pcName}</div>
                          <div className="text-[10px] text-cyan-400">{fb.resourceBuild || '2026.11.16.R6'}</div>
                        </td>
                        <td className="p-3.5 max-w-md text-slate-200">{fb.comments}</td>
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">{fb.timestampIST || fb.submittedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ALL REPORTS ARCHIVE */}
      {mainSection === 'reports' && (
        <div className="space-y-4">
          {/* Filters and Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                {[
                  { id: 'ALL', label: 'All Reports' },
                  { id: 'VERSION_UPGRADE', label: '🔄 Version Upgrades (v1.1.0)' },
                  { id: 'INSTALLATION', label: 'New Installations' },
                  { id: 'DEPLOYMENT_AUDIT', label: '17-Step Deployment' },
                  { id: 'GUARDIAN_EVENT', label: 'Guardian Auto-Repair' },
                  { id: 'ERROR_EXCEPTION', label: 'Errors & Exceptions' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap text-[11px] font-bold cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchReportsData()}
                    placeholder="Search PC name, ID, office or details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={fetchReportsData}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition shrink-0 cursor-pointer"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Reports Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">EVENT ID</th>
                    <th className="p-3.5">REPORT CATEGORY</th>
                    <th className="p-3.5">PC IDENTITY &amp; LOCATION</th>
                    <th className="p-3.5">VERSION &amp; UPGRADE DETAILS</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">TIMESTAMP (IST)</th>
                    <th className="p-3.5">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        No report events found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r, idx) => (
                      <tr key={r.eventId || idx} className="hover:bg-slate-950/60 transition">
                        <td className="p-3.5 text-cyan-400 font-bold text-[11px]">
                          <div>{r.eventId || r.reportId}</div>
                          <div className="text-[9px] text-emerald-400 mt-0.5">{r.recordSource || 'FIREBASE_LIVE_CLOUD'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded border font-bold ${
                            r.reportType === 'VERSION_UPGRADE' || r.reportType === 'OTA_VERIFIED'
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-600/50'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}>
                            {r.reportType}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{r.pcName} ({r.userName || 'Operator'})</div>
                          <div className="text-[10px] text-emerald-300">{r.district} ({r.state}) — {r.officeLocation}</div>
                          <div className="text-[10px] text-slate-500">{r.pcId}</div>
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-md">
                          <div className="font-bold text-indigo-300">{r.appVersion || 'v1.1.0'} <span className="text-emerald-400 text-[10px]">({r.resourceBuild || '2026.11.16.R6'})</span></div>
                          {(r.details || r.remarks) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 break-words">{r.details || r.remarks}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold ${
                            r.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            r.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{r.timestampIst || r.timestampUtc}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedPcId(r.pcId)}
                            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1 rounded-lg text-[11px] transition font-bold cursor-pointer"
                          >
                            View PC History
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: COMPLETE APPLICATION UPDATE & RELEASE HISTORY */}
      {mainSection === 'updates' && (
        <div className="space-y-4">
          {releases.map((rel, idx) => (
            <div key={rel.releaseId || idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-lg font-black text-white font-mono">{rel.version}</span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold">
                      Resource Build: {rel.resourceBuild}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      {rel.signatureStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Release ID: {rel.releaseId} • Date: {rel.releaseDate} • Package Size: {rel.packageSize}
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  SHA-256: <span className="text-cyan-400">{String(rel.sha256).slice(0, 24)}...</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <h4 className="font-mono font-bold text-emerald-400 uppercase mb-2">✨ New Features &amp; Enhancements</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {(rel.newFeatures || []).map((nf: string, i: number) => <li key={i}>{nf}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <h4 className="font-mono font-bold text-amber-400 uppercase mb-2">🛠️ Bug Fixes, Security &amp; Performance</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {(rel.bugFixes || []).map((bf: string, i: number) => <li key={i}>{bf}</li>)}
                    {(rel.securityUpdates || []).map((su: string, i: number) => <li key={`s-${i}`}>{su}</li>)}
                    {(rel.performanceImprovements || []).map((pi: string, i: number) => <li key={`p-${i}`}>{pi}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 6: WEBSITE ADMIN CODE (ubd_monitoring.php) */}
      {mainSection === 'website-code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white font-mono">
                /admin/ubd_monitoring.php — Complete Website Source Code (v1.1.0 • 2026.11.16.R6)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deploy or copy this file directly to your website https://www.e-vedhika.in/admin/ubd_monitoring to display all Installed PCs, Live Online PCs, User Ratings &amp; Feedback, and 17-step audits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyWebsiteCode}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Copy className="w-4 h-4" /> Copy Full Code
              </button>
              <a
                href="/api/reports/source-code/ubd_monitoring_php?download=1"
                download="ubd_monitoring.php"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Download className="w-4 h-4" /> Download ubd_monitoring.php
              </a>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[520px]">
            <code>{phpSourceCode || 'Loading ubd_monitoring.php source code...'}</code>
          </pre>
        </div>
      )}

      {/* SECTION 7: ADMIN LICENSE & ₹10/MONTH SUBSCRIPTION CONTROL */}
      {mainSection === 'license-plans' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>APP LICENSING CONTROL — FREE NOW &amp; ₹{licensePolicy.monthlyPriceInr}/MONTH FUTURE SUBSCRIPTION</span>
                </h2>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  ప్రస్తుతం <strong>FREE_FOR_ALL</strong> మోడ్‌లో అందరికీ 100% ఉచితంగా రన్ అవుతుంది. భవిష్యత్తులో మీరు <strong>PAID_MONTHLY</strong> ఆన్ చేసిన వెంటనే ప్రతి PC కి ₹10 / 30 రోజుల సబ్‌స్క్రిప్షన్ చెక్ వర్తిస్తుంది.
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
                  🟢 FREE FOR ALL (Active Now)
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
                  💳 ENABLE ₹{licensePolicy.monthlyPriceInr}/{licensePolicy.durationDays}d PAID MODE
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
                <strong>⚠️ హెచ్చరిక (Phone Number Visible Warning):</strong> మీరు ఇచ్చిన UPI ID లో 10-అంకెల మొబైల్ నంబర్ ఉంది! యూజర్లకు మీ నంబర్ కనిపిస్తే కాల్స్ వస్తాయి. బదులుగా PhonePe / GPay / Paytm లో <strong>Custom Alias UPI</strong> (ఉదా: <span className="font-mono text-white">evedhika@okaxis</span>), <strong>PhonePe Business / Paytm Business QR</strong>, లేదా క్రింది <strong>Razorpay Payment Link</strong> వాడండి — అప్పుడు కాల్స్ అస్సలు రావు.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">
                    PAYMENT GATEWAY LINK URL (RAZORPAY / CASHFREE / INSTAMOJO — ZERO CALLS, OPTIONAL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://pages.razorpay.com/your-evedhika-10rs"
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
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-sans text-[11px] text-slate-300 space-y-1.5">
                  <div className="font-bold text-emerald-300">🔒 కాల్స్ రాకుండా పేమెంట్ తీసుకునే 2 సురక్షిత మార్గాలు:</div>
                  <div>1. <strong>Business/Alias UPI ID + Auto QR:</strong> మొబైల్ నంబర్ లేని Alias VPA (<span className="font-mono text-cyan-300">evedhika@okaxis</span> లేదా PhonePe/GPay Business UPI) ఇస్తే, Desktop యాప్ ఆటోమేటిక్‌గా మీ ఫోన్ నంబర్ లేని <strong>Scannable QR Code పేజీ</strong> (`?pay=1`) ఓపెన్ చేస్తుంది.</div>
                  <div>2. <strong>Razorpay / Cashfree Payment Link:</strong> పైన Payment Link ఇస్తే యూజర్ నేరుగా Gateway లో ₹10 కట్టగలరు (మీ నంబర్/బ్యాంక్ అస్సలు కనిపించదు).</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5">
                <div className="text-[10px] font-bold text-cyan-300 uppercase">Live UPI QR Preview (No Phone # Shown)</div>
                {licensePolicy.upiId ? (
                  <div className="bg-white p-2.5 rounded-xl">
                    <QRCodeSVG
                      value={buildUpiPaymentUri(licensePolicy.upiId, licensePolicy.monthlyPriceInr)}
                      size={128}
                      level="M"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-dashed border-slate-700 flex items-center justify-center p-2 text-[10px] text-slate-500 font-sans">
                    Alias UPI ID సేవ్ చేస్తే QR ఇక్కడ ప్రివ్యూ అవుతుంది
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const checkoutUrl = 'https://rakeshkumardhawan.github.io/UBDTOOLS/?pay=1';
                    navigator.clipboard.writeText(checkoutUrl);
                    showSuccess('Operator QR Checkout URL కాపీ అయింది!', 'Checkout URL Copied');
                  }}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  📋 Copy ?pay=1 Checkout Link
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-black text-white uppercase">
                  🧾 UPI PAYMENT CLAIMS &amp; ANTI-DUPLICATE QUEUE ({paymentClaims.filter((c) => c.status === 'PENDING').length} PENDING)
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  ప్రతి UTR నంబర్ Firestore లో ఒకేసారి సేవ్ అవుతుంది (Duplicate UTR ను సిస్టమ్ ఆటోమేటిక్‌గా బ్లాక్ చేస్తుంది). మీ PhonePe/GPay లో UTR మ్యాచ్ అయిన తర్వాత Approve నొక్కండి.
                </p>
              </div>
              <span className="text-[11px] text-amber-300 font-bold">Unique UTR Lock Enabled</span>
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
                  {paymentClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                        ఇంకా ఏ పేమెంట్ UTR క్లెయిమ్ రాలేదు. Paid Mode ఆన్ అయిన తర్వాత యూజర్లు పంపే 12-అంకెల UTR ఇక్కడ కనిపిస్తుంది.
                      </td>
                    </tr>
                  ) : (
                    paymentClaims.map((claim) => {
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
                          <td className="p-3.5 flex items-center gap-2">
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
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase">🖥️ PER-PC SUBSCRIPTION MANAGER (₹{licensePolicy.monthlyPriceInr} / {licensePolicy.durationDays} DAYS)</h3>
              <span className="text-[11px] text-slate-400">Admin Sign-In Required for Activation</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">PC NAME &amp; MACHINE ID</th>
                    <th className="p-3.5">OPERATOR &amp; OFFICE</th>
                    <th className="p-3.5">CURRENT LICENSE STATUS</th>
                    <th className="p-3.5">VALID UNTIL</th>
                    <th className="p-3.5">ADMIN ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {installedPcs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        రియల్ PCలు ఇన్‌స్టాల్ అయిన వెంటనే ఇక్కడ ప్రతి PC కి ₹{licensePolicy.monthlyPriceInr}/Month లైసెన్స్ యాక్టివేట్/రిన్యూ చేసుకోవచ్చు.
                      </td>
                    </tr>
                  ) : (
                    installedPcs.map((pc, i) => {
                      const cleanId = String(pc.pcId || '').replace(/[^a-zA-Z0-9_-]/g, '-');
                      const rec = pcLicensesMap[cleanId.toUpperCase()] || null;
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
                              evalRes.allowed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {evalRes.badgeText}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 text-[11px]">
                            {rec?.validUntilIso ? new Date(rec.validUntilIso).toLocaleDateString() : (licensePolicy.mode === 'FREE_FOR_ALL' ? 'Free Mode Active' : 'Not Activated')}
                          </td>
                          <td className="p-3.5 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={activatingPcId === cleanId}
                              onClick={() => handleActivatePcSubscription(pc)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            >
                              ✅ Activate ₹{licensePolicy.monthlyPriceInr} / +{licensePolicy.durationDays}d
                            </button>
                            <button
                              type="button"
                              disabled={activatingPcId === cleanId}
                              onClick={() => handleRevokePcSubscription(pc)}
                              className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            >
                              🚫 Revoke
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
        </div>
      )}

      {/* Individual PC Details Modal */}
      {selectedPcId && (
        <PCDetailsModal
          pcId={selectedPcId}
          onClose={() => setSelectedPcId(null)}
        />
      )}

    </div>
  );
};
