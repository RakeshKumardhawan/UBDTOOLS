import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const EVedhikaLogo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10", 
  size = 40 
}) => {
  return (
    <img 
      src="/logo.png" 
      alt="E-Vedhika Official Logo" 
      style={{ width: size, height: size }}
      className={`${className} shrink-0 object-contain drop-shadow-md rounded-full`} 
    />
  );
};
