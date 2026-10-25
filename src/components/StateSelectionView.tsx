import React, { useState } from 'react';
import { 
  Shield, 
  Settings, 
  Headset, 
  Cloud, 
  ChevronRight, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { DepartmentProfile } from '../types';
import { departmentProfiles } from '../data/mockData';
import { EVedhikaLogo } from './EVedhikaLogo';

interface StateSelectionViewProps {
  onSelect: (profile: DepartmentProfile) => void;
}

export const StateSelectionView: React.FC<StateSelectionViewProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<string>('ubd-portal-ts');

  const tsProfile = departmentProfiles.find(p => p.id === 'ubd-portal-ts')!;
  const apProfile = departmentProfiles.find(p => p.id === 'ubd-portal-ap')!;

  const handleProceed = () => {
    const selected = departmentProfiles.find(p => p.id === selectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F1F7FF] overflow-hidden font-sans">
      {/* Background Abstract Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-[20%] left-[5%] w-[15%] h-[15%] bg-indigo-50 rounded-full blur-2xl opacity-40" />

      {/* Main Container */}
      <div className="relative w-full max-w-[1100px] bg-white/90 backdrop-blur-md rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden flex flex-col mx-4 max-h-[90vh]">
        
        {/* Header */}
        <header className="px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-blue-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <EVedhikaLogo size={32} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">E-VEDHIKA</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600 mt-1 uppercase">UBD Enterprise Solution</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 bg-blue-50/80 px-5 py-3 rounded-2xl border border-blue-100/50">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Unified Birth & Death Registration</p>
                <p className="text-[10px] font-medium text-slate-500">Deployment & Support Tool</p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="text-[12px] font-black text-slate-800 leading-tight tracking-tight uppercase">Digital Panchayat</p>
                <p className="text-[10px] font-bold text-blue-600 tracking-wide">Smart Governance</p>
              </div>
              <div className="relative w-11 h-11">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-red-500 rounded-xl rotate-12 opacity-20 animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-tr from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                    <path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-10 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-1 bg-blue-500 rounded-full mb-8" />
          
          <h2 className="text-[2.5rem] md:text-[3rem] font-black text-slate-900 leading-[1.1] mb-4">
            మీరు ఏ పోర్టల్/రాష్ట్రం కాస్టింగ్ చేయాలనుకుంటున్నారు?
          </h2>
          <p className="text-lg font-medium text-slate-500 mb-12">
            Select the Target Portal / State to Continue
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
            {/* Telangana Card */}
            <div 
              onClick={() => setSelectedId('ubd-portal-ts')}
              className={`group relative overflow-hidden rounded-[32px] p-8 cursor-pointer transition-all duration-500 border-2 ${
                selectedId === 'ubd-portal-ts' 
                  ? 'bg-[#EBF5FF] border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]' 
                  : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'
              }`}
            >
              {/* Checkmark */}
              <div className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                selectedId === 'ubd-portal-ts' ? 'bg-blue-500 scale-100' : 'bg-slate-100 scale-0'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>

              {/* Decorative Circle Background */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-48 h-32 flex items-center justify-center relative">
                  {/* Silhouette Placeholder - In a real app we'd use the actual SVG maps */}
                  <div className="absolute inset-0 bg-blue-100/50 rounded-2xl blur-xl" />
                  <div className={`w-32 h-32 transition-transform duration-700 ${selectedId === 'ubd-portal-ts' ? 'scale-110' : 'scale-100'}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current opacity-90 drop-shadow-lg">
                      <path d="M50 10 L80 30 L90 70 L50 90 L10 70 L20 30 Z" /> {/* Abstract map shape */}
                    </svg>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">E-VEDHIKA UBD PORTAL</h3>
                  <h4 className={`text-2xl font-black tracking-tight mb-4 transition-colors ${selectedId === 'ubd-portal-ts' ? 'text-blue-600' : 'text-slate-700'}`}>
                    (TELANGANA)
                  </h4>
                  <div className="w-12 h-1 bg-blue-500/30 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Government of Telangana</p>
                </div>
              </div>
            </div>

            {/* AP Card */}
            <div 
              onClick={() => setSelectedId('ubd-portal-ap')}
              className={`group relative overflow-hidden rounded-[32px] p-8 cursor-pointer transition-all duration-500 border-2 ${
                selectedId === 'ubd-portal-ap' 
                  ? 'bg-[#F0FFF4] border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]' 
                  : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg'
              }`}
            >
              {/* Checkmark placeholder circle */}
              <div className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                selectedId === 'ubd-portal-ap' ? 'bg-emerald-500 border-emerald-500 scale-100' : 'bg-transparent border-slate-200 scale-100 opacity-60'
              }`}>
                {selectedId === 'ubd-portal-ap' && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>

              {/* Decorative Circle Background */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-48 h-32 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-emerald-100/50 rounded-2xl blur-xl" />
                  <div className={`w-32 h-32 transition-transform duration-700 ${selectedId === 'ubd-portal-ap' ? 'scale-110' : 'scale-100'}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-600 fill-current opacity-90 drop-shadow-lg">
                      <path d="M20 20 Q50 10 80 20 L90 50 Q80 80 50 90 L10 50 Z" /> {/* Abstract map shape */}
                    </svg>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">E-VEDHIKA UBD PORTAL</h3>
                  <h4 className={`text-2xl font-black tracking-tight mb-4 transition-colors ${selectedId === 'ubd-portal-ap' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    (ANDHRA PRADESH)
                  </h4>
                  <div className="w-12 h-1 bg-emerald-500/30 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Government of Andhra Pradesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <button 
            onClick={handleProceed}
            className="group relative flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-3xl px-12 py-6 min-w-[400px] shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-7 h-7" />
            </div>
            
            <div className="h-8 w-px bg-white/20 mx-2" />
            
            <span className="text-2xl font-black tracking-tight uppercase">PROCEED / ముందుకు సాగండి</span>
            
            <div className="absolute right-6 opacity-20 transition-transform duration-500 group-hover:translate-x-4">
              <ChevronRight className="w-10 h-10" />
            </div>
          </button>
        </div>

        {/* Footer Features */}
        <footer className="bg-slate-50/80 px-10 py-8 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-tight">Secure & Reliable</p>
                <p className="text-[11px] font-medium text-slate-500">Government Standards</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-tight">Easy Deployment</p>
                <p className="text-[11px] font-medium text-slate-500">One Click Setup</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-tight">Technical Support</p>
                <p className="text-[11px] font-medium text-slate-500">Telangana & AP</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-tight">Always Updated</p>
                <p className="text-[11px] font-medium text-slate-500">Latest Compliance</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-200/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              E-Vedhika UBD Enterprise Support
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
