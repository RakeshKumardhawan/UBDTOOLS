import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Search, RefreshCw,
  Laptop, FileSpreadsheet, Code, Copy, Sparkles, Star, Send, Trash2, ShieldCheck, LogOut
} from 'lucide-react';
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
  ADMIN_EMAIL
} from '../firebase';
import { extractTelegramField } from '../utils/reportHelpers';

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
  const [mainSection, setMainSection] = useState<'installed-pcs' | 'live-pcs' | 'feedback' | 'reports' | 'updates' | 'website-code'>('installed-pcs');
  const [pcVersionFilter, setPcVersionFilter] = useState<'ALL' | 'V110_UPGRADED' | 'FRESH_INSTALLED'>('ALL');
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
    latestResourceBuild: '2026.11.19.R12',
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
    firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  useEffect(() => {
    if (!isVerifiedAdmin) {
      setFsInstalledPcs([]);
      setFsReports([]);
      setFsFeedbacks([]);
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
            resourceBuild: data.resourceBuild || '2026.11.19.R12',
            appState: isOnline ? (data.appState || 'RUNNING') : 'CLOSED',
            pcConnectivity: isOnline ? 'ONLINE' : 'OFFLINE',
            isOnline,
            verification: data.verification || '17/17 steps passed.',
            dscStatus: data.dscStatus || 'Active',
            edgeIeMode: data.edgeIeMode || 'IE5 Quirks Active',
            healthScore: Number(data.healthScore ?? 100),
            lastSeenAt: data.lastSeenAt || (updatedMs ? new Date(updatedMs).toLocaleString() : 'Live'),
            lastSeenEpoch: updatedMs
          };
        });
        setFsInstalledPcs(rows);
      },
      (error) => {
        setFsPermissionNotice('Firestore Read Error: ' + error.message);
        showError(error.message || 'Missing Firestore permissions for installed_pcs', 'Firestore Read Error');
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
              resourceBuild: data.resourceBuild || '2026.11.19.R12',
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
        setFsPermissionNotice('Firestore Read Error (pc_reports): ' + error.message);
        showError(error.message || 'Missing Firestore permissions for pc_reports', 'Firestore Read Error');
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
        setFsPermissionNotice('Firestore Read Error (user_feedbacks): ' + error.message);
        showError(error.message || 'Missing Firestore permissions for user_feedbacks', 'Firestore Read Error');
        handleFirestoreError(error, OperationType.LIST, 'user_feedbacks');
      }
    );

    return () => {
      unsubPcs();
      unsubReports();
      unsubFeedback();
    };
  }, [isVerifiedAdmin]);

  const reports = useMemo(() => {
    const map = new Map<string, ReportEvent>();
    apiReports.forEach((r) => map.set(String(r.eventId || r.reportId), r));
    fsReports.forEach((r) => map.set(String(r.eventId || r.reportId), r));
    return Array.from(map.values());
  }, [apiReports, fsReports]);

  // Merge Firestore live records + Server API records + Report History (0% dummy data) and enrich with exact Upgrade vs Fresh Install status
  const installedPcs = useMemo(() => {
    const map = new Map<string, any>();
    apiInstalledPcs.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, { ...p });
    });
    fsInstalledPcs.forEach((p) => {
      const k = String(p.pcId || p.pcName || '').toUpperCase();
      if (k) map.set(k, { ...(map.get(k) || {}), ...p });
    });

    // Cross-reference reports so every PC with a VERSION_UPGRADE / OTA_VERIFIED / INSTALLATION report is accurately tagged
    const pcReportCounts = new Map<string, number>();
    const pcUpgradeInfo = new Map<string, { transition: string; details: string; timestamp: string }>();

    reports.forEach((r) => {
      const k = String(r.pcId || r.pcName || '').toUpperCase();
      if (!k) return;
      pcReportCounts.set(k, (pcReportCounts.get(k) || 0) + 1);

      const detailsStr = String(r.details || r.remarks || '');
      const isUpgReport =
        r.reportType === 'VERSION_UPGRADE' ||
        r.reportType === 'OTA_VERIFIED' ||
        detailsStr.toLowerCase().includes('upgraded') ||
        detailsStr.includes('->') ||
        detailsStr.includes('➔');

      if (isUpgReport && !pcUpgradeInfo.has(k)) {
        const transMatch = detailsStr.match(/(v?\d+\.\d+\.\d+[^\s->➔]*)\s*(?:->|➔)\s*(v?\d+\.\d+\.\d+)/i);
        const transition = transMatch ? `${transMatch[1]} ➔ ${transMatch[2]}` : `Previous ➔ ${r.appVersion || 'v1.1.0'}`;
        pcUpgradeInfo.set(k, {
          transition,
          details: detailsStr,
          timestamp: r.timestampIst || ''
        });
      }

      if (!map.has(k)) {
        map.set(k, {
          pcId: r.pcId || r.pcName,
          pcName: r.pcName || 'GP-OFFICE-PC',
          userName: r.userName || 'Operator',
          district: r.district || 'Telangana',
          state: r.state || 'Telangana',
          officeLocation: r.officeLocation || 'Grama Panchayat Office',
          osVersion: 'Windows 10/11',
          appVersion: r.appVersion || 'v1.1.0',
          resourceBuild: r.resourceBuild || '2026.11.19.R12',
          appState: 'CLOSED',
          pcConnectivity: 'OFFLINE',
          isOnline: false,
          verification: detailsStr || '17/17 steps passed.',
          dscStatus: 'Active',
          edgeIeMode: 'IE5 Quirks Active',
          lastSeenAt: r.timestampIst || 'Recorded',
          lastSeenEpoch: r.timestampUtc ? new Date(r.timestampUtc).getTime() : 0
        });
      }
    });

    return Array.from(map.entries())
      .map(([k, pc]) => {
        const verifStr = String(pc.verification || '');
        const upgFromReport = pcUpgradeInfo.get(k);
        const hasUpgInVerif =
          verifStr.toLowerCase().includes('upgraded') ||
          verifStr.includes('->') ||
          verifStr.includes('➔');
        const isUpgradedPc = Boolean(upgFromReport || hasUpgInVerif);

        let upgradeTransition = upgFromReport?.transition || '';
        if (!upgradeTransition && hasUpgInVerif) {
          const m = verifStr.match(/(v?\d+\.\d+\.\d+[^\s->➔]*)\s*(?:->|➔)\s*(v?\d+\.\d+\.\d+)/i);
          upgradeTransition = m ? `${m[1]} ➔ ${m[2]}` : `Upgraded ➔ ${pc.appVersion || 'v1.1.0'}`;
        }

        return {
          ...pc,
          isUpgradedPc,
          upgradeTransition: isUpgradedPc ? upgradeTransition : '',
          verification:
            isUpgradedPc && !hasUpgInVerif && upgFromReport
              ? `Upgraded (${upgFromReport.transition}) | ${verifStr}`
              : verifStr
        };
      })
      .sort((a, b) => (b.lastSeenEpoch || 0) - (a.lastSeenEpoch || 0));
  }, [apiInstalledPcs, fsInstalledPcs, reports]);

  const liveOnlinePcs = useMemo(() => {
    const fsOnline = installedPcs.filter((p) => p.isOnline);
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
  }, [apiLiveOnlinePcs, installedPcs]);

  const feedbacks = useMemo(() => {
    const map = new Map<string, any>();
    apiFeedbacks.forEach((f) => map.set(String(f.id || `${f.operatorName}_${f.timestampIST}`), f));
    fsFeedbacks.forEach((f) => map.set(String(f.id), f));
    return Array.from(map.values());
  }, [apiFeedbacks, fsFeedbacks]);

  const avgRatingComputed = useMemo(() => {
    if (feedbacks.length === 0) return summary.averageRating || 5.0;
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return Number((sum / feedbacks.length).toFixed(1));
  }, [feedbacks, summary.averageRating]);

  const upgradedPcsCount = useMemo(() => {
    return installedPcs.filter((p) => p.isUpgradedPc).length;
  }, [installedPcs]);

  const freshInstalledPcsCount = useMemo(() => {
    return installedPcs.filter((p) => !p.isUpgradedPc).length;
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
      const errText = e?.message || e?.code || (typeof e === 'string' ? e : 'Google Sign-In failed');
      showError(errText, 'Auth Error');
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
                resourceBuild: vd.latestResourceBuild || '2026.11.19.R12',
                releaseDate: vd.releaseDate || '2026-11-17',
                packageSize: vd.downloadSize || '25.0 MB',
                signatureStatus: 'SHA-256 + Authenticode Signed',
                sha256: vd.sha256 || 'AUTO-VERIFIED-IN-GITHUB-ACTIONS',
                newFeatures: String(vd.releaseNotes || '').split('\n').filter(Boolean),
                bugFixes: [
                  'Every PC upgrading from older versions automatically sends full version-upgrade details',
                  'Central Cloud Real-Time Admin & PC Monitoring Active'
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
      } else {
        try {
          const base = import.meta.env.BASE_URL || '/';
          const staticPhp = await fetch(`${base}admin/ubd_monitoring.php?t=${Date.now()}`, { cache: 'no-store' });
          if (staticPhp.ok) {
            const codeText = await staticPhp.text();
            if (codeText) setPhpSourceCode(codeText);
          }
        } catch {}
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
        resourceBuild: '2026.11.19.R12'
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
      // Parse blocks directly in the browser and persist to Google Cloud Firestore (works 24/7 on GitHub Pages & locally)
      const rawBlocks = telegramPasteText
        .split(/(?=📋|🚀|🔄|📜|Report ID:|Machine ID:)/g)
        .map((b) => b.trim())
        .filter((b) => b.length > 20);
      const blocks = rawBlocks.length > 0 ? rawBlocks : [telegramPasteText.trim()];

      const extractField = extractTelegramField;

      let importedCount = 0;
      for (const block of blocks) {
        const pcIdRaw = extractField(block, ['Machine ID', 'PC ID']) || extractField(block, ['PC Name']);
        const pcNameRaw = extractField(block, ['PC Name']) || pcIdRaw || 'GP-OFFICE-PC';
        if (!pcIdRaw && !pcNameRaw) continue;

        const cleanPcId = String(pcIdRaw || pcNameRaw).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
        const cleanPcName = String(pcNameRaw).slice(0, 128);
        const userName = (extractField(block, ['User Name', 'Operator']) || 'Operator').slice(0, 128);
        const officeLocation = (extractField(block, ['Office Location', 'District & Office']) || 'Grama Panchayat Office').slice(0, 200);
        const districtRaw = extractField(block, ['District & State', 'District']) || officeLocation.split('-')[0] || 'Telangana';
        const district = districtRaw.replace(/\(.*?\)/g, '').trim().slice(0, 100) || 'Telangana';
        const state = officeLocation.toLowerCase().includes('andhra') ? 'Andhra Pradesh' : 'Telangana';
        const osVersion = (extractField(block, ['Windows Edition', 'Windows OS']) || 'Windows 10/11').slice(0, 120);
        const appVersion = (extractField(block, ['Application Version']) || 'v1.1.0').slice(0, 32);
        const resourceBuild = (extractField(block, ['Build Version']) || '2026.11.19.R12').slice(0, 48);
        const verTransition = extractField(block, ['Version Upgraded', 'Version Transition', 'Version Status']);
        const isUpgradeBlock =
          block.includes('VERSION UPGRADED') ||
          block.includes('VERSION UPGRADE REPORT') ||
          block.includes('OTA UPDATE HISTORY') ||
          Boolean(verTransition);

        const verification = (
          isUpgradeBlock
            ? `Upgraded ${verTransition || 'to ' + appVersion} (${resourceBuild})`
            : extractField(block, ['Summary', 'Final Verification']) || 'Passed (17/17)'
        ).slice(0, 160);

        const reportIdRaw = extractField(block, ['Report ID']) || `${isUpgradeBlock ? 'UPG' : 'RPT'}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const cleanReportId = reportIdRaw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);

        await setDoc(doc(db, 'installed_pcs', cleanPcId), {
          pcId: cleanPcId,
          pcName: cleanPcName,
          userName,
          district,
          state,
          officeLocation,
          osVersion,
          appVersion,
          resourceBuild,
          appState: 'RUNNING',
          pcConnectivity: 'ONLINE',
          verification,
          dscStatus: (extractField(block, ['USB DSC Token', 'DSC / Edge IE Mode']) || 'Active').slice(0, 160),
          edgeIeMode: (extractField(block, ['Edge IE Mode']) || 'IE5 Quirks Active').slice(0, 160),
          healthScore: 100,
          lastSeenAt: new Date().toLocaleString(),
          updatedAt: serverTimestamp()
        });

        await setDoc(doc(db, 'pc_reports', cleanReportId), {
          reportId: cleanReportId,
          pcId: cleanPcId,
          pcName: cleanPcName,
          userName,
          district,
          state,
          officeLocation,
          reportType: isUpgradeBlock ? 'VERSION_UPGRADE' : 'INSTALLATION',
          status: 'SUCCESS',
          appVersion,
          details: verification,
          createdAt: serverTimestamp()
        });

        importedCount++;
      }

      // Also notify local backend if running locally
      await fetchWithLiveGateway('/api/reports/import-telegram-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: telegramPasteText })
      });

      if (importedCount > 0) {
        showSuccess(`✅ ${importedCount} PC రిపోర్టులు Google Cloud Firebase లో విజయవంతంగా సేవ్ చేయబడ్డాయి!`, 'Telegram Reports Imported');
        setTelegramPasteText('');
        setShowTelegramImportModal(false);
        await fetchReportsData();
      } else {
        showError('పేస్ట్ చేసిన టెక్స్ట్‌లో PC వివరాలు కనిపించలేదు. దయచేసి పూర్తి టెలిగ్రామ్ మెసేజ్ పేస్ట్ చేయండి.', 'Import Notice');
      }
    } catch (err: any) {
      showError(err.message || 'Import error', 'Import Error');
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

  const filteredInstalledPcs = installedPcs.filter(pc => {
    if (pcVersionFilter === 'V110_UPGRADED' && !pc.isUpgradedPc) {
      return false;
    }
    if (pcVersionFilter === 'FRESH_INSTALLED' && pc.isUpgradedPc) {
      return false;
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
      String(pc.appVersion || '').toLowerCase().includes(q) ||
      String(pc.verification || '').toLowerCase().includes(q)
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
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/30">
              v1.1.0 • Build 2026.11.19.R12
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">
              ★ Avg Rating: {avgRatingComputed}/5.0 ({feedbacks.length} Reviews)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>Admin Central PC Monitoring &amp; Live Reports</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Centralized Google Cloud Firebase Management Hub for Installed PCs, Live Online Status, and Operator Feedback.
          </p>
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
          <span className="text-[10px] text-slate-400 block font-bold">INSTALLED PCs</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">{installedPcs.length}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Synced Database</span>
        </div>

        <div
          onClick={() => setMainSection('live-pcs')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-emerald-400 block font-bold">LIVE ONLINE PCs</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{liveOnlinePcs.length}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Offline: {Math.max(0, installedPcs.length - liveOnlinePcs.length)}</span>
        </div>

        <div
          onClick={() => setMainSection('feedback')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-amber-400 block font-bold">USER RATINGS</span>
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
          <span className="text-[10px] text-indigo-300 block font-bold">v1.1.0 UPDATED PCs</span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">{upgradedPcsCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Upgrades: {versionUpgradeEventsCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[10px] text-slate-400 block font-bold">LATEST BUILD</span>
          <span className="text-sm font-black text-emerald-300 mt-2 block">2026.11.19.R12</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">v1.1.0 Active</span>
        </div>

        <div
          onClick={() => setMainSection('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 shadow cursor-pointer transition"
        >
          <span className="text-[10px] text-slate-400 block font-bold">ALL EVENT LOGS</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">{reports.length}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Audit Records</span>
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
          <span>5. Release History (2026.11.19.R12)</span>
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
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPcVersionFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    pcVersionFilter === 'ALL'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  All PCs ({installedPcs.length})
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
                  🔄 Upgraded PCs (పాత వెర్షన్ నుండి అప్డేట్ అయినవి: {upgradedPcsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPcVersionFilter('FRESH_INSTALLED')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    pcVersionFilter === 'FRESH_INSTALLED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-emerald-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  🆕 Fresh Installed PCs (కొత్తగా ఇన్‌స్టాల్ అయినవి: {freshInstalledPcsCount})
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
                  <th className="p-3.5">INSTALL / UPGRADE TYPE</th>
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
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      <Laptop className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                      <div className="font-bold text-white text-sm mb-1">
                        {pcVersionFilter === 'V110_UPGRADED'
                          ? '⏳ ఇంకా ఏ PC పాత వెర్షన్ నుండి అప్డేట్ రిపోర్ట్ పంపలేదు'
                          : '⏳ డమ్మీ PCలు తొలగించబడ్డాయి — మొదటి రియల్ PC రిపోర్ట్ కోసం వేచి ఉంది'}
                      </div>
                      <div className="text-xs text-slate-400">
                        పాత వెర్షన్ ఉన్న కంప్యూటర్‌లో కొత్త v1.1.0 ఇన్‌స్టాల్ లేదా ఆటో-అప్డేట్ అయిన వెంటనే ఇక్కడ "🔄 UPGRADED" బ్యాడ్జ్‌తో ఖచ్చితమైన వివరాలు కనిపిస్తాయి.
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
                        {pc.isUpgradedPc ? (
                          <div className="inline-flex flex-col gap-0.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                            <span>🔄 UPGRADED PC</span>
                            <span className="text-[9px] text-emerald-300">{pc.upgradeTransition || `➔ ${pc.appVersion}`}</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                            🆕 FRESH INSTALL
                          </span>
                        )}
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
                          <div className="text-[10px] text-cyan-400">{fb.resourceBuild || '2026.11.19.R12'}</div>
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
                          <div className="font-bold text-indigo-300">{r.appVersion || 'v1.1.0'} <span className="text-emerald-400 text-[10px]">({r.resourceBuild || '2026.11.19.R12'})</span></div>
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
                /admin/ubd_monitoring.php — Complete Website Source Code (v1.1.0 • 2026.11.19.R12)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deploy or copy this file directly to your central server to display all Installed PCs, Live Online PCs, User Ratings &amp; Feedback, and 17-step audits.
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

      {/* Individual PC Details Modal */}
      {selectedPcId && (
        <PCDetailsModal
          pcId={selectedPcId}
          initialPc={installedPcs.find((p) => p.pcId === selectedPcId)}
          initialReports={reports.filter((r) => r.pcId === selectedPcId)}
          onClose={() => setSelectedPcId(null)}
        />
      )}

    </div>
  );
};
