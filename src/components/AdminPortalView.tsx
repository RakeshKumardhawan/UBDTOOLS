import React, { useEffect, useState } from 'react';
import { BarChart3, CreditCard, ShieldCheck, ArrowLeft, AlertTriangle, Lock, LogOut } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut, ADMIN_EMAIL } from '../firebase';
import { ReportCenter } from './ReportCenter';
import { PaymentLicenseHubView } from './PaymentLicenseHubView';

interface AdminErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, AdminErrorBoundaryState> {
  declare state: AdminErrorBoundaryState;
  declare props: { children: React.ReactNode };
  declare setState: (state: Partial<AdminErrorBoundaryState>) => void;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Unexpected Admin error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto m-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Admin Cloud Sync Notice</span>
          </div>
          <p className="text-xs text-slate-300 font-mono break-all">{this.state.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
          >
            🔄 Retry Loading Panel
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminPortalViewProps {
  initialSection?: 'reports' | 'payments';
  onExitAdmin?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  initialSection = 'reports',
  onExitAdmin
}) => {
  const [section, setSection] = useState<'reports' | 'payments'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pathLower = window.location.pathname.toLowerCase();
      if (
        pathLower.endsWith('/admin/payments') ||
        params.get('pay') === '1' ||
        params.get('section') === 'payments' ||
        params.get('section') === 'admin-license'
      ) {
        return 'payments';
      }
    } catch {}
    return initialSection;
  });

  // Strict Google Admin Authentication Gate (Required for both /admin/ and /live-pc-reports)
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [signingIn, setSigningIn] = useState<boolean>(false);

  const isVerifiedAdmin = Boolean(
    authReady &&
    firebaseUser &&
    firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  // Unlock native html/body scrolling while Admin Portal is open so mouse wheel,
  // browser scrollbar, middle-click drag, and trackpad gestures work 100% natively!
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlOverflowY = html.style.overflowY;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverflowY = body.style.overflowY;
    const prevBodyHeight = body.style.height;
    const prevBodyMinHeight = body.style.minHeight;

    html.style.overflow = 'auto';
    html.style.overflowY = 'auto';
    body.style.overflow = 'auto';
    body.style.overflowY = 'auto';
    body.style.height = 'auto';
    body.style.minHeight = '100vh';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.overflowY = prevHtmlOverflowY;
      body.style.overflow = prevBodyOverflow;
      body.style.overflowY = prevBodyOverflowY;
      body.style.height = prevBodyHeight;
      body.style.minHeight = prevBodyMinHeight;
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (u && u.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthError(
          `ఈ అకౌంట్ (${u.email}) కు అడ్మిన్ అనుమతి లేదు. దయచేసి ${ADMIN_EMAIL} తో లాగిన్ అవ్వండి.`
        );
      } else {
        setAuthError('');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = !isVerifiedAdmin
      ? 'E-Vedhika Admin Portal — Secure Login'
      : section === 'payments'
        ? 'E-Vedhika Admin Portal — Payments & License Control'
        : 'E-Vedhika Admin Portal — Live PC Reports';
    return () => {
      document.title = prevTitle;
    };
  }, [section, isVerifiedAdmin]);

  const switchSection = (next: 'reports' | 'payments') => {
    setSection(next);
    try {
      const url = new URL(window.location.href);
      if (next === 'payments') {
        url.searchParams.set('section', 'payments');
      } else {
        url.searchParams.delete('section');
        url.searchParams.delete('pay');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleGoogleAdminLogin = async () => {
    setSigningIn(true);
    setAuthError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthError(
          `Access Denied: ${res.user?.email || 'Unknown user'} కు అడ్మిన్ యాక్సెస్ లేదు. దయచేసి ${ADMIN_EMAIL} తో లాగిన్ అవ్వండి.`
        );
      }
    } catch (e: any) {
      if (String(e?.code || e?.message || '').includes('unauthorized-domain')) {
        const host = window.location.hostname;
        setAuthError(
          `Firebase Authorized Domains లో "${host}" ను యాడ్ చేయండి (Firebase Console -> Authentication -> Settings -> Authorized domains).`
        );
      } else {
        setAuthError(e?.message || 'Google Admin Sign-In విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAuthError('');
  };

  // STRICT LOGIN GATE: Nothing in /admin/ or /live-pc-reports renders until verified Admin logs in
  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#07090F] text-slate-100 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#0D111C] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">
                E-VEDHIKA ADMIN PORTAL
              </h1>
              <p className="text-[11px] font-mono text-cyan-400">
                PROTECTED LIVE REPORTS &amp; PAYMENTS
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed space-y-1.5">
            <p className="font-semibold text-white">
              🔒 అడ్మిన్ లాగిన్ తప్పనిసరి (Admin Login Required)
            </p>
            <p>
              Live PC రిపోర్టులు (<span className="font-mono text-cyan-300">/live-pc-reports</span>) మరియు పేమెంట్లు / లైసెన్సులు చూడాలంటే కేవలం అడ్మినిస్ట్రేటర్ Google అకౌంట్ తో లాగిన్ అవ్వాలి.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {!authReady ? (
            <div className="py-3 text-center text-xs font-mono text-slate-400">
              Checking Admin Session...
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleAdminLogin}
                disabled={signingIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-60 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{signingIn ? 'Signing in...' : '🔐 Sign in with Google Admin'}</span>
              </button>

              {firebaseUser && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({firebaseUser.email}) &amp; Switch Account</span>
                </button>
              )}

              {onExitAdmin && (
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Main Tool</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#07090F] text-slate-100 flex flex-col relative z-10">
      {/* Dedicated Compact Admin Header (Only Reports & Payments) */}
      <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-5 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white">
                    E-VEDHIKA ADMIN PORTAL
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                    REPORTS &amp; PAYMENTS ONLY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Live PC రిపోర్టులు &amp; పేమెంట్లు — Admin: {firebaseUser?.email}
                </p>
              </div>
            </div>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="lg:hidden px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Tool</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => switchSection('reports')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                section === 'reports'
                  ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400/40'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Live PC Reports</span>
            </button>

            <button
              type="button"
              onClick={() => switchSection('payments')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                section === 'payments'
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                  : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payments &amp; License Control</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-800 border border-rose-500/40 text-xs font-mono text-rose-200 whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition"
              title="Sign out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="hidden lg:inline-flex px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 whitespace-nowrap items-center gap-1.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Main Tool</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: ONLY Reports OR Payments */}
      <main className="flex-1 w-full">
        <AdminErrorBoundary>
          {section === 'reports' ? (
            <ReportCenter />
          ) : (
            <PaymentLicenseHubView defaultSubTab="admin-controls" />
          )}
        </AdminErrorBoundary>
      </main>
    </div>
  );
};
