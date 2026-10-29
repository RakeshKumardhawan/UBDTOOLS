import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const EVedhikaLogo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10", 
  size = 40 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size} 
      height={size}
      className={className}
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0c2242" />
          <stop offset="70%" stopColor="#07152b" />
          <stop offset="100%" stopColor="#040b17" />
        </radialGradient>

        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#0284c7" />
          <stop offset="70%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <radialGradient id="coreGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#14325e" />
          <stop offset="60%" stopColor="#091b38" />
          <stop offset="100%" stopColor="#050e1f" />
        </radialGradient>

        <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f0f6fc" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <filter id="knobGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>

      <circle cx="256" cy="256" r="248" fill="url(#bgGrad)" stroke="#112d56" strokeWidth="4" />
      <circle cx="256" cy="256" r="236" fill="none" stroke="#0a1c36" strokeWidth="3" />

      <circle cx="256" cy="256" r="200" fill="none" stroke="#091b34" strokeWidth="38" />

      <path
        d="M 384.5 102.8 A 200 200 0 1 0 384.5 409.2"
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="36"
        strokeLinecap="round"
      />

      <path
        d="M 378 110 A 200 200 0 1 0 378 402"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="3 14"
        opacity="0.75"
      />

      <circle cx="384.5" cy="102.8" r="18" fill="#ffffff" filter="url(#knobGlow)" />
      <circle cx="384.5" cy="102.8" r="10" fill="#e0f2fe" />

      <circle cx="384.5" cy="409.2" r="18" fill="#ffffff" filter="url(#knobGlow)" />
      <circle cx="384.5" cy="409.2" r="10" fill="#e0f2fe" />

      <path
        d="M 448 230 A 215 215 0 0 1 448 282"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <circle cx="256" cy="256" r="156" fill="url(#coreGrad)" stroke="#1d4ed8" strokeWidth="3" />
      <circle cx="256" cy="256" r="148" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />

      <text
        x="256"
        y="298"
        textAnchor="middle"
        fill="url(#textGrad)"
        fontSize="124"
        fontWeight="900"
        fontFamily="'Inter', 'Arial Black', Impact, 'Segoe UI', system-ui, sans-serif"
        letterSpacing="-2"
        filter="url(#textShadow)"
      >
        EV
      </text>
    </svg>
  );
};
