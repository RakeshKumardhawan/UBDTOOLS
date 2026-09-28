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
              <p className="text-sm text-sky-300 font-medium mt-0.5">Enterprise Version 3.5 (.NET 4.8 / Edge IE Mode Architecture)</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Lead Architect & Developer</span>
            <span className="text-base font-bold text-sky-400">Rakesh Dhawan</span>
          </div>
        </div>

        <p className="relative z-10 text-xs lg:text-sm text-slate-300 leading-relaxed max-w-3xl">
          The E-Vedhika One-Click Deployment Tool is an enterprise Windows deployment solution. It automatically configures Windows 7, 8, 10, and 11 computers to access UBD and legacy portals requiring Internet Explorer compatibility, ActiveX controls, WD ProxKey / HYP2003 DSC tokens, and NIC DigiSigner web bridges with zero manual steps.
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Target Audience */}
        <div className="glass-card-corporate rounded-2xl p-5 border border-corporate-200/80 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-corporate-700 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-corporate-100 rounded-lg"><User className="w-4 h-4 text-corporate-600" /></div>
            <span>Target Users</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Secretaries</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Computer Operators</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Offices & District Staff</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Enterprise Help Desk Teams</span></li>
          </ul>
        </div>

        {/* Card 2: Operating System Support */}
        <div className="glass-card-corporate rounded-2xl p-5 border border-corporate-200/80 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-corporate-700 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-corporate-100 rounded-lg"><Monitor className="w-4 h-4 text-corporate-600" /></div>
            <span>Supported Systems</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 font-mono mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Windows 11 (x64 / ARM64)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Windows 10 (32-bit & 64-bit)</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Windows 8 / 8.1 Pro</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Windows 7 SP1</span></li>
          </ul>
        </div>

        {/* Card 3: Core Technology Stack */}
        <div className="glass-card-corporate rounded-2xl p-5 border border-corporate-200/80 shadow-md space-y-3 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-2 text-corporate-700 font-bold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-corporate-100 rounded-lg"><Code className="w-4 h-4 text-corporate-600" /></div>
            <span>Technology Stack</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 font-mono mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>C# / .NET Framework 4.8</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Windows Forms & WPF UI</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Edge Enterprise Site List API</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-corporate-500 shrink-0 mt-0.5" /> <span>Gemini 3.6 Flash AI Engine</span></li>
          </ul>
        </div>
      </div>

      {/* Version History / Changelog */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-corporate-100 text-corporate-700 rounded-xl border border-corporate-200 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-corporate-900 tracking-tight">Deployment & Version Changelog</h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-corporate-200 shadow-sm overflow-hidden">
          <div className="relative border-l-2 border-corporate-100 ml-6 sm:ml-8 my-8 space-y-8 pb-4">
            {VERSION_HISTORY.map((log, idx) => (
              <div key={idx} className="relative pl-8 sm:pl-10 pr-6">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-corporate-500 shadow-sm" />
                
                {/* Content */}
                <div className="glass-card-corporate rounded-xl p-5 border border-corporate-200/80 shadow-xs transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-corporate-600 text-white font-bold text-xs rounded-lg shadow-corporate-600/20 shadow-sm">
                        {log.version}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {log.date}
                      </span>
                    </div>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-corporate-600 bg-corporate-50 px-2 py-0.5 rounded-full border border-corporate-200 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Current Version
                      </span>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mt-3">
                    {log.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <GitCommit className="w-4 h-4 text-corporate-400 shrink-0 mt-0.5" />
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

