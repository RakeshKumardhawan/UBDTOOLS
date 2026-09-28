import React from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Terminal, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Loader2,
  ChevronRight,
  ExternalLink,
  Globe,
  Monitor,
  Cpu,
  Server,
  Timer,
  Hourglass,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DeploymentStep, DepartmentProfile, LogEntry } from '../types';
import { LiveSystemStatsWidget } from './LiveSystemStatsWidget';

interface DeployViewProps {
  steps: DeploymentStep[];
  isDeploying: boolean;
  onStartDeployment: () => void;
  onResetDeployment: () => void;
  selectedProfile: DepartmentProfile;
  logs: LogEntry[];
  onGenerateReport: () => void;
}

export const DeployView: React.FC<DeployViewProps> = ({
  steps,
  isDeploying,
  onStartDeployment,
  onResetDeployment,
  selectedProfile,
  logs,
  onGenerateReport,
}) => {
  const formatLocalSystemTime = (d: Date = new Date()) => {
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const [currentClockTime, setCurrentClockTime] = React.useState<string>(() => formatLocalSystemTime());
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [realtimeRemainingSecs, setRealtimeRemainingSecs] = React.useState(18);
  const startTimeRef = React.useRef<number | null>(null);
  const targetEndRef = React.useRef<number | null>(null);
  const finalElapsedRef = React.useRef<number>(0);

  const completedCount = steps.filter(s => s.status === 'success').length;
  const failedCount = steps.filter(s => s.status === 'failed').length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const isFinished = completedCount === totalSteps && totalSteps > 0;
  const pendingCount = totalSteps - completedCount;

  // Real-time ticking engine (Runs every 100ms for continuous, smooth live clock & countdown updates)
  React.useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      setCurrentClockTime(formatLocalSystemTime(new Date(now)));

      if (isDeploying && startTimeRef.current) {
        const elapsed = now - startTimeRef.current;
        setElapsedMs(elapsed);
        finalElapsedRef.current = Math.max(1, Math.round(elapsed / 1000));

        if (targetEndRef.current) {
          const diffMs = Math.max(0, targetEndRef.current - now);
          const secsLeft = Math.max(1, Math.ceil(diffMs / 1000));
          setRealtimeRemainingSecs(secsLeft);
        }
      }
    }, 100);

    return () => clearInterval(ticker);
  }, [isDeploying]);

  // Handle start and adapt target end time dynamically as steps complete
  React.useEffect(() => {
    if (isDeploying) {
      const now = Date.now();
      if (!startTimeRef.current) {
        startTimeRef.current = now;
        // Baseline estimate: 15 steps * ~1.15s per step
        const estDurationMs = totalSteps * 1150;
        targetEndRef.current = now + estDurationMs;
        setRealtimeRemainingSecs(Math.ceil(estDurationMs / 1000));
      } else if (completedCount > 0 && pendingCount > 0) {
        // Recalculate target end smoothly based on true step speed
        const elapsedSoFar = now - startTimeRef.current;
        const actualAvgPerStep = elapsedSoFar / completedCount;
        const remainingDurationMs = Math.max(pendingCount * actualAvgPerStep, 1000);
        targetEndRef.current = now + remainingDurationMs;
        setRealtimeRemainingSecs(Math.max(1, Math.ceil(remainingDurationMs / 1000)));
      }
    } else {
      if (completedCount === 0) {
        startTimeRef.current = null;
        targetEndRef.current = null;
        setElapsedMs(0);
        setRealtimeRemainingSecs(18);
      }
    }
  }, [isDeploying, completedCount, pendingCount, totalSteps]);

  const elapsedSeconds = isFinished 
    ? finalElapsedRef.current 
    : Math.floor(elapsedMs / 1000);

  const displayRemainingSecs = isFinished ? 0 : isDeploying ? realtimeRemainingSecs : 18;

  const avgSecondsPerStep = elapsedSeconds > 0 && completedCount > 0 
    ? Number((elapsedSeconds / completedCount).toFixed(1))
    : 1.1;

  // Real-time Expected finish clock time (e.g. 10:45:28 AM)
  const expectedFinishClockTime = React.useMemo(() => {
    if (isFinished) return 'Completed';
    if (!isDeploying) {
      return formatLocalSystemTime(new Date(Date.now() + 18000));
    }
    const target = targetEndRef.current || (Date.now() + displayRemainingSecs * 1000);
    return formatLocalSystemTime(new Date(target));
  }, [isFinished, isDeploying, displayRemainingSecs, currentClockTime]);

  const activeStep = steps.find(s => s.status === 'running') || (isDeploying ? steps[completedCount] : null);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <LiveSystemStatsWidget mode="card" className="mb-4" />

      {/* Top Header Card with Premium Dark Gradient */}
      <div className="rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border border-slate-700/50 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-blue-300 text-[11px] font-bold tracking-wide uppercase shadow-inner">
              <Cpu className="w-3.5 h-3.5" />
              15-Step Enterprise Deployment
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Deployment Engine
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Configuring OS architecture, network policies, and drivers for portal profile:{' '}
              <span className="text-white font-semibold px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 ml-1">{selectedProfile.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-deploy-start-primary"
              onClick={onStartDeployment}
              disabled={isDeploying || isFinished}
              className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all duration-300 transform ${
                isFinished
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : isDeploying
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-blue-900/50 border border-blue-500/30'
              }`}
            >
              {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="tracking-wide uppercase">{isDeploying ? 'Deploying...' : isFinished ? 'Deployment Complete' : 'Start One-Click Deployment'}</span>
            </button>

            <button
              id="btn-deploy-reset"
              onClick={onResetDeployment}
              disabled={isDeploying}
              className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              id="btn-export-report"
              onClick={onGenerateReport}
              className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800/80 hover:bg-emerald-900/40 text-emerald-400 border border-slate-700 hover:border-emerald-500/30 flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Enhanced Progress Section */}
        <div className="mt-8 relative z-10 space-y-3 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-bold tracking-wide">
            <span className="text-slate-300 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Execution Progress ({completedCount}/{totalSteps})
            </span>
            <div className="flex items-center gap-4">
              {isDeploying && !isFinished && (
                <span className="text-amber-400 flex items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 shadow-inner font-mono">
                  <Clock className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                  <span>~{displayRemainingSecs}s remaining ({displayRemainingSecs}s left)</span>
                </span>
              )}
              <span className="text-white text-lg font-black drop-shadow-md">{progressPercent}%</span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full relative"
              style={{ width: `${progressPercent}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {isDeploying && (
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {isFinished && (
        <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 text-emerald-950 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CheckCircle2 className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1 mt-1">
                <h4 className="text-xl font-extrabold text-emerald-900 tracking-tight">System Configuration Completed!</h4>
                <p className="text-sm text-emerald-800/80 font-medium max-w-2xl">
                  Internet Explorer Mode, Zone 2 Trusted Sites, ActiveX Settings, and DSC Digital Signature Drivers have been successfully injected and are now active.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <span className="text-xs font-black tracking-wider uppercase text-emerald-900/60 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Direct Portal Launchers
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://ubd.telangana.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-3 shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open UBD Govt Portal</span>
                  <span className="px-2 py-1 rounded bg-emerald-800/50 text-emerald-100 text-[10px] font-mono border border-emerald-500/30">Edge IE Mode (IE5)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <a
                  href="https://www.e-vedhika.in/?postId=qkQ9PDCxO0myy5l2seda&tab=home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-3 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Open E-Vedhika Web App</span>
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">Chrome / Firefox</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Content: 3 cols for Steps, 2 cols for Time & ETA Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Step List (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-xl shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Operations Sequence (15 దశల ఆటోమేషన్)</span>
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
              {completedCount === totalSteps ? '✅ 15/15 పూర్తయింది' : `${completedCount}/${totalSteps} పూర్తయ్యాయి`}
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto custom-scrollbar pr-2 relative">
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-100 -z-10"></div>
            {steps.map((step, idx) => {
              const isRunning = step.status === 'running';
              const isSuccess = step.status === 'success';
              const isFailed = step.status === 'failed';
              const isPending = step.status === 'pending';

              return (
                <div
                  key={`deploy-step-${step.id}-${idx}`}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 ${
                    isRunning
                      ? 'bg-blue-50/30 border-blue-400 shadow-lg shadow-blue-900/5'
                      : isSuccess
                      ? 'bg-slate-50/50 border-emerald-100 hover:border-emerald-200'
                      : isFailed
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  {/* Status Indicator Bubble */}
                  <div className="mt-0.5 shrink-0 bg-white relative z-10 rounded-full">
                    {isRunning && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner shadow-blue-900/10 ring-4 ring-white">
                        <Loader2 className="w-4 h-4 animate-spin font-bold" />
                      </div>
                    )}
                    {isSuccess && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    {isFailed && (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-4 ring-white">
                        <XCircle className="w-5 h-5" />
                      </div>
                    )}
                    {isPending && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className={`text-sm font-bold truncate ${isRunning ? 'text-blue-900' : isSuccess ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {step.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase border border-slate-200/60 shrink-0">
                        {step.module}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.description}</p>
                    
                    {step.details && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100/70 text-slate-700 text-xs leading-relaxed border border-slate-200/70 flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">ఫలితం: </span>
                          <span>{step.details}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isRunning && (
                    <div className="shrink-0 pt-1">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-200/50 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        రన్ అవుతోంది...
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Reassurance Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ఆటోమేషన్ ప్రక్రియ సురక్షితంగా రన్ అవుతుంది. ఎలాంటి టెక్నికల్ కమాండ్స్ అవసరం లేదు.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Verified for Windows 10 & 11 (64-Bit)
            </span>
          </div>
        </div>

        {/* Right Side: Deployment Time & ETA Monitor */}
          <div className="lg:col-span-2 bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 rounded-3xl p-6 lg:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6">
            
            {/* Header with Live Real-Time System Clock */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Deployment Time & Status</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Real-time automation countdown</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Real-Time System Clock */}
                <div
                  id="live-system-pc-clock"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-xs flex items-center gap-2 border border-slate-800"
                  title="Your PC Operating System Real-Time Clock (కంప్యూటర్ లోని లైవ్ సిస్టమ్ సమయం)"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold hidden sm:inline">సిస్టమ్ సమయం:</span>
                  <span className="tabular-nums text-emerald-300 font-extrabold">{currentClockTime}</span>
                </div>

                {isDeploying ? (
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Running
                  </span>
                ) : isFinished ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Completed
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    Ready
                  </span>
                )}
              </div>
            </div>

            {/* Main Hero Card: Estimated Time Remaining (Continuous Live Real-Time Ticking) */}
            <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${
              isDeploying
                ? 'bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950 text-white border-blue-500/40 shadow-xl shadow-blue-950/20'
                : isFinished
                ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                : 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-slate-700/60 shadow-lg'
            }`}>
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Hourglass className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isFinished ? 'Execution Finished' : 'Estimated Time Remaining'}</span>
                    {isDeploying && (
                      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold tracking-wider animate-pulse border border-amber-400/30">
                        ● LIVE TICKING
                      </span>
                    )}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono tracking-wider">
                    {completedCount}/{totalSteps} Steps Done
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm font-sans tabular-nums text-white">
                    {isFinished ? '0s' : isDeploying ? `${displayRemainingSecs}s` : '~18s'}
                  </span>
                  <span className="text-base font-bold text-slate-300">
                    {isFinished ? 'left • Completed' : 'left'}
                  </span>
                </div>

                {/* Exact English user-friendly guidance message */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isDeploying ? 'bg-amber-400 animate-ping' : isFinished ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                  <p className="text-xs font-semibold text-slate-200">
                    {isFinished ? (
                      <span>All 15 operations completed successfully in <strong className="text-emerald-300">{elapsedSeconds} seconds</strong>!</span>
                    ) : isDeploying ? (
                      <span>Will finish in approximately <strong className="text-amber-300">~{displayRemainingSecs} seconds</strong></span>
                    ) : (
                      <span>Will finish in approximately <strong className="text-blue-300">~18 to 20 seconds</strong> once started</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Metrics Grid: Time Elapsed & Expected Completion (Live Updates) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <Clock className={`w-3.5 h-3.5 ${isDeploying ? 'text-indigo-600 animate-spin' : 'text-indigo-600'}`} />
                  <span>Time Elapsed</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                  {elapsedSeconds < 10 ? `00:0${elapsedSeconds}s` : `00:${elapsedSeconds}s`}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isDeploying ? '⏱ Live stopwatch ticking' : 'Total duration'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Finishing Time</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                  {isFinished ? 'Finished' : expectedFinishClockTime}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isFinished ? 'Ready to use' : 'Live estimated clock time'}
                </p>
              </div>
            </div>

            {/* Active Operation Status Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Current Step In Progress</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                  {isDeploying ? `Step ${Math.min(completedCount + 1, totalSteps)} of ${totalSteps}` : isFinished ? 'All Steps Done' : 'Step 1 of 15 Queued'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {isDeploying && activeStep ? activeStep.title : isFinished ? 'System is 100% configured for UBD Portal & DSC Token' : 'Ready for 1-click deployment initiation'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                <span>Speed: ~{avgSecondsPerStep.toFixed(1)}s / operation</span>
                <span className="text-indigo-600 font-bold">{progressPercent}% completed</span>
              </div>
            </div>

            {/* Friendly English Reassurance Note */}
            <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Confusion Automated Execution</span>
              </div>
              <p>
                All 15 configurations (IE5 Quirks mode, USB DSC token drivers, Trusted Zone policies) execute automatically with zero command-line input.
              </p>
            </div>

          </div>

      </div>
    </div>
  );
};

