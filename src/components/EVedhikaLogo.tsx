import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const EVedhikaLogo: React.FC<LogoProps & { color?: string }> = ({ 
  className = "w-10 h-10", 
  size = 40,
  color
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={`${className} shrink-0 filter drop-shadow-lg`}
    >
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <filter id="inner-glow">
          <feFlood floodColor="white" floodOpacity="0.1" />
          <feComposite in2="SourceAlpha" operator="out" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite operator="atop" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Shield Shape */}
      <path 
        d="M50 5 L15 20 V50 C15 75 50 95 50 95 C50 95 85 75 85 50 V20 L50 5 Z" 
        fill={color === 'white' ? 'white' : 'url(#shield-grad)'}
        stroke={color === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
        strokeWidth="2"
        filter="url(#inner-glow)"
      />

      {/* Building Icon */}
      <g transform="translate(28, 30) scale(0.45)" fill={color === 'white' ? '#1E40AF' : 'white'}>
        <path d="M50 0 L0 30 V40 H100 V30 L50 0 Z M10 45 V100 H30 V45 H10 Z M40 45 V100 H60 V45 H40 Z M70 45 V100 H90 V45 H70 Z" />
      </g>
      
      {/* Accent Line */}
      <path 
        d="M35 80 H65" 
        stroke={color === 'white' ? '#1E40AF' : 'white'} 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.3"
      />
    </svg>
  );
};
