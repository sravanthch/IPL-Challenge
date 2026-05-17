'use client';

import { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';

export default function WinnerFlyer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Small delay to trigger the enter animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Auto close after 6 seconds (6000ms + 500ms delay)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsRendered(false);
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to complete before removing from DOM
    setTimeout(() => {
      setIsRendered(false);
    }, 500);
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md transition-opacity duration-700 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`relative w-[90vw] max-w-2xl transition-all duration-700 ease-out transform ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-10 opacity-0 scale-90'
        }`}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-1.5 sm:p-2 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.4)]">
          {/* Shimmer effect */}
          <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" style={{ left: '-100%' }}></div>
          
          <div className="bg-slate-950 px-6 sm:px-12 py-10 sm:py-16 rounded-2xl flex flex-col items-center text-center gap-6 relative z-10 border border-amber-500/30">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Trophy className="text-amber-400 w-10 h-10 sm:w-14 sm:h-14" />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-amber-400 text-sm sm:text-base font-bold uppercase tracking-[0.3em] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400 animate-pulse"></span>
                Grand Prize Winner
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400 animate-pulse"></span>
              </div>
              <div className="text-white font-black text-4xl sm:text-6xl md:text-7xl leading-tight mb-4">
                Rs. 500
              </div>
              <div className="text-slate-300 font-medium text-base sm:text-xl md:text-2xl max-w-md">
                For the ultimate champion of IPL Predictions 2026!
              </div>
            </div>

            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
