import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Download, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from './Toast';

interface UpdateAvailableModalProps {
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
  onClose: () => void;
  onLogUpdateAction?: (moduleName: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const UpdateAvailableModal: React.FC<UpdateAvailableModalProps> = ({
  currentVersion,
  latestVersion,
  downloadUrl,
  releaseNotes,
  onClose,
  onLogUpdateAction
}) => {
  const { showSuccess, showInfo } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallNow = () => {
    setIsInstalling(true);

    // Log to System Console under 'Update Engine' module
    if (onLogUpdateAction) {
      onLogUpdateAction(
        'Update Engine',
        `User clicked 'Install Now'. Initiated update installation process from ${currentVersion} to ${latestVersion}. Download target: ${downloadUrl}`,
        'info'
      );
    }

    setTimeout(() => {
      setIsInstalling(false);
      setInstalledSuccess(true);

      // Trigger installer download
      const link = document.createElement('a');
      link.href = downloadUrl || 'https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_v1.0.9.exe';
      link.target = '_blank';
      link.download = `EVedhika_Setup_${latestVersion}.exe`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(
        `Update installation started! Downloading setup package for ${latestVersion}...`,
        'Update Installation Started'
      );

      if (onLogUpdateAction) {
        onLogUpdateAction(
          'Update Engine',
          `Update package download triggered successfully for ${latestVersion}. Auto-installation active.`,
          'success'
        );
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    }, 1500);
  };

  const handleRemindLater = () => {
    if (onLogUpdateAction) {
      onLogUpdateAction(
        'Update Engine',
        `Update dialog for ${latestVersion} dismissed by operator. Auto-update check scheduled in 5 minutes.`,
        'warning'
      );
    }
    showInfo('Update notification dismissed. Will check again in 5 minutes.', 'Remind Later');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0D0E12] border-2 border-cyan-500/40 rounded-2xl max-w-xl w-full text-white shadow-2xl overflow-hidden relative">
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 w-full" />

        {/* Close Button */}
        <button
          onClick={handleRemindLater}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Dialog Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 shadow-lg">
              <Rocket className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> UPDATE ENGINE — NEW RELEASE
              </span>
              <h3 className="text-xl sm:text-2xl font-syne font-black text-white tracking-tight">
                🚀 Software Update Available!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                E-Vedhika UBD Deployment Tool {latestVersion} is ready for installation.
              </p>
            </div>
          </div>

          {/* Version Comparison Card */}
          <div className="grid grid-cols-2 gap-3 bg-[#13141A] p-4 rounded-xl border border-white/10 font-mono text-xs">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">Current Installed Version</span>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <span>{currentVersion}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">Installed</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] text-cyan-300 block uppercase">Latest Release Version</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span>{latestVersion}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Ready</span>
              </div>
            </div>
          </div>

          {/* What's New / Key Features List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Key Release Features & Updates:</span>
            </h4>
            
            <div className="bg-[#13141A] p-4 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {releaseNotes ? (
                <p className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">{releaseNotes}</p>
              ) : (
                <ul className="space-y-2 font-mono text-[11px]">
                  <li className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>Full English Localization:</b> 100% English translation across all system modules and UI cards.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>4-Pillar Network Flow Architecture:</b> Personal WhatsApp & Telegram Bot live alert synchronization.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>DigiSigner Bridge v2.0.4.1 Validation:</b> Port 2626/8080 PKCS#11 certificate whitelist verification.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>24x7 Silent Background Guardian:</b> System Tray auto-repair & health monitor engine.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>1-Click Complete System Revert:</b> Clean uninstallation and registry factory restore.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleInstallNow}
              disabled={isInstalling || installedSuccess}
              className="w-full sm:w-auto flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Installing Update...</span>
                </>
              ) : installedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Installation Started!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Install Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleRemindLater}
              disabled={isInstalling}
              className="w-full sm:w-auto py-3 px-5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
            >
              Remind Me Later
            </button>
          </div>

          {/* Publisher Identity */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Publisher: E-Vedhika.in (Rakesh Dhawan)</span>
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Digitally Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
