import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface FooterProps {
  onToggleConsole?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onToggleConsole }) => {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <footer className="border-t border-ink-faint px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 bg-bg z-20 shrink-0">
      <div className="label text-[0.55rem] sm:text-[0.6rem] text-center sm:text-left">
        Dev: Rakesh Dhawan // e-Panchayath Operators (PR&RD TS)
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        {onToggleConsole && (
          <button 
            onClick={onToggleConsole}
            className="xl:hidden label text-[0.55rem] sm:text-[0.6rem] text-accent flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Terminal size={11} />
            <span>CONSOLE</span>
          </button>
        )}
        <span className="label text-[0.55rem] sm:text-[0.6rem]">V1.0.1</span>
        <span className="label text-[0.55rem] sm:text-[0.6rem]">UPTIME: {formatUptime(uptime)}</span>
      </div>
    </footer>
  );
};
