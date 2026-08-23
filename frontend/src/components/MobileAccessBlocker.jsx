import React, { useState, useEffect } from 'react';
import { Smartphone, Clock, ShieldAlert, Monitor, RotateCcw } from 'lucide-react';

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  return isMobileUA || isSmallScreen;
};

const checkIsTimeAllowed = () => {
  const currentHour = new Date().getHours();
  // Strictly permitted only between 10:00 AM and 11:00 AM (10:00 - 10:59:59)
  return currentHour === 10;
};

const MobileAccessBlocker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const [isTimeAllowed, setIsTimeAllowed] = useState(checkIsTimeAllowed());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setIsTimeAllowed(checkIsTimeAllowed());
      setIsMobile(isMobileDevice());
    }, 5000);

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // If not a mobile device OR if within allowed window (10:00 AM - 11:00 AM), render app normally
  if (!isMobile || isTimeAllowed) {
    return <>{children}</>;
  }

  // Otherwise, display the restriction screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-850 border border-slate-750 p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Icon Header */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
          <Smartphone className="h-10 w-10" />
          <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow">
            <ShieldAlert className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
            Security Access Policy
          </span>
          <h1 className="text-xl font-extrabold text-white">
            Mobile Access Restricted
          </h1>
          <p className="mt-2 text-xs text-slate-350 leading-relaxed">
            In accordance with platform security protocols, mobile browser access is strictly permitted only between <strong className="text-white">10:00 AM and 11:00 AM</strong>.
          </p>
        </div>

        {/* Time Status Widget */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-4 w-4 text-sky-400" />
              Allowed Window
            </span>
            <span className="text-sky-300 font-mono font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
              10:00 AM – 11:00 AM
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-400">Current Device Time</span>
            <span className="text-amber-400 font-mono font-bold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800/50 py-1.5 px-3 text-[11px] font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Mobile Window is Currently Closed</span>
          </div>
        </div>

        {/* Desktop Recommendation */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 p-3.5 flex items-start gap-3 text-left">
          <Monitor className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <p className="font-bold text-slate-200">Desktop Access is Open 24/7</p>
            <p className="text-slate-400 mt-0.5">Please open InternConnect on a laptop or desktop computer to access your account immediately.</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setIsTimeAllowed(checkIsTimeAllowed());
            setIsMobile(isMobileDevice());
            setCurrentTime(new Date());
          }}
          className="btn-animate w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Check Access Again
        </button>

      </div>
    </div>
  );
};

export default MobileAccessBlocker;
