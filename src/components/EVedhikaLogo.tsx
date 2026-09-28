import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const EVedhikaLogo: React.FC<LogoProps> = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      width={size} 
      height={size}
      className={`${className} shrink-0 filter drop-shadow-md`}
    >
      <defs>
        <linearGradient id="metal-ev" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0"/>
          <stop offset="50%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="glow-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <radialGradient id="center-depth">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0f172a" stopOpacity="1"/>
        </radialGradient>
        <style>{`
          @keyframes ev-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes ev-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          @keyframes ev-breathe { 0%, 100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
          .ev-spin { transform-origin: center; animation: ev-spin 4s linear infinite; }
          .ev-pulse { animation: ev-pulse 2s ease-in-out infinite; }
          .ev-breathe { transform-origin: center; animation: ev-breathe 3s ease-in-out infinite; }
        `}</style>
      </defs>
      
      <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#1e293b" strokeWidth="1" className="ev-breathe"/>
      
      <path d="M50 16 A24 24 0 1 0 50 48" fill="none" stroke="url(#glow-ring)" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
      <path d="M50 16 A24 24 0 1 0 50 48" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4"/>

      <circle cx="32" cy="32" r="18" fill="url(#center-depth)" stroke="#1e40af" strokeWidth="1"/>
      
      <text x="32" y="34.5" textAnchor="middle" dominantBaseline="middle" fill="url(#metal-ev)" fontSize="16" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-1">EV</text>
      
      <circle cx="32" cy="32" r="28" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="10 100" className="ev-spin"/>
      <circle cx="50" cy="16" r="2" fill="#fff" className="ev-pulse"/>
      <circle cx="50" cy="48" r="2" fill="#fff" className="ev-pulse"/>
    </svg>
  );
};
