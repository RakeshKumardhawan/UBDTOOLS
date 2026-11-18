import React, { useEffect, useState } from 'react';
import { BarChart3, CreditCard, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto m-6 bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 text-slate-100 space-y-3">
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

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      section === 'payments'
        ? 'E-Vedhika Admin Portal — Payments & License Control'
        : 'E-Vedhika Admin Portal — Live PC Reports';
    return () => {
      document.title = prevTitle;
    };
  }, [section]);

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

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 flex flex-col">
      {/* Dedicated Clean Admin Header (Only Reports & Payments) */}
      <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
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
                  ఈ అడ్మిన్ పోర్టల్‌లో కేవలం Live PC రిపోర్టులు మరియు పేమెంట్లు / లైసెన్సులు మాత్రమే అందుబాటులో ఉంటాయి.
                </p>
              </div>
            </div>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="lg:hidden px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
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
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                section === 'payments'
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                  : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payments &amp; License Control</span>
            </button>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="hidden lg:inline-flex px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 whitespace-nowrap items-center gap-1.5 cursor-pointer transition"
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

