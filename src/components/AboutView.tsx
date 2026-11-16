import React from 'react';
import { EVedhikaLogo } from './EVedhikaLogo';
import { VERSION_HISTORY } from '../utils/updateEngine';
import { 
  ShieldCheck, 
  Code, 
  User, 
  Layers, 
  CheckCircle2, 
  Award, 
  Globe, 
  Monitor,
  Heart,
  History,
  GitCommit
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0a1b31] via-[#0b2447] to-[#07172b] text-white rounded-2xl p-8 border border-corporate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-corporate-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-corporate-700/50 pb-6">
          <div className="flex items-center gap-4">
            <EVedhikaLogo size={56} className="w-14 h-14 drop-shadow-md" />
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">E-Vedhika UBD Deployment Tool</h1>
              <p className="text-sm text-sky-300 font-medium mt-0.5">Enterprise v1.1.0 • Free Early Access Active (Future Plan: ₹10 / Month)</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-widest font-extrabold">Architect & Developer</span>
            <span className="text-base font-bold text-sky-400">RAKESH KUMAR DHAWAN</span>
            <span className="text-[10px] text-slate-500 block font-mono">e-Panchayath Operator (TS)</span>
          </div>
        </div>

        <p className="relative z-10 text-xs lg:text-sm text-slate-300 leading-relaxed max-w-3xl">
          The E-Vedhika One-Click Deployment Tool is currently provided 100% Free for all Grama Panchayat &amp; Mandal operators (with optional ₹10/month per-PC subscription readiness built in for future activation). It configures Windows 7, 8, 8.1, 10, and 11 (x86/x64) PCs for UBD Internet Explorer compatibility, ActiveX controls, DSC tokens, and NIC DigiSigner with zero manual steps.
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Target Audience */}
        <div className="bg-slate-900/70 rounded-2xl p-5 border border-sky-500/25 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-sky-500/15 rounded-lg"><User className="w-4 h-4 text-sky-400" /></div>
            <span>Target Users & License</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Free Access Active Right Now</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Future Plan: ₹10 / Month (30 Days)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>GP Secretaries & Operators</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Mandal & District Staff</span></li>
          </ul>
        </div>

        {/* Card 2: Operating System Support */}
        <div className="bg-slate-900/70 rounded-2xl p-5 border border-sky-500/25 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-sky-500/15 rounded-lg"><Monitor className="w-4 h-4 text-sky-400" /></div>
            <span>Supported Systems</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-mono mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Windows 11 (x64 Pro / Home)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Windows 10 (32-bit & 64-bit)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Windows 8 / 8.1 (x86 & x64)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Windows 7 SP1 (.NET 4.0+)</span></li>
          </ul>
        </div>

        {/* Card 3: Core Technology Stack */}
        <div className="bg-slate-900/70 rounded-2xl p-5 border border-sky-500/25 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-sky-500/15 rounded-lg"><Code className="w-4 h-4 text-sky-400" /></div>
            <span>Technology Stack</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-mono mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>C# / .NET Framework 4.0–4.8</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Windows Forms Native UI</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Edge Enterprise Site List API</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>Cloud Firestore Live Telemetry</span></li>
          </ul>
        </div>
      </div>

      {/* Version History / Changelog */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sky-500/15 text-sky-300 rounded-xl border border-sky-500/30 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Deployment & Version Changelog</h2>
        </div>
        
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/70 shadow-sm overflow-hidden">
          <div className="relative border-l-2 border-sky-500/30 ml-6 sm:ml-8 my-8 space-y-8 pb-4">
            {VERSION_HISTORY.map((log, idx) => (
              <div key={idx} className="relative pl-8 sm:pl-10 pr-6">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-4 border-sky-400 shadow-sm" />
                
                {/* Content */}
                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 shadow-xs transition-shadow hover:border-sky-500/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-sky-600 text-white font-bold text-xs rounded-lg shadow-sm">
                        {log.version}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {log.date}
                      </span>
                    </div>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Current Version
                      </span>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mt-3">
                    {log.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5 text-sm text-slate-200">
                        <GitCommit className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

