import React from 'react';
import { BUSINESS_CONFIG } from '../config.js';

interface MobileNavProps {
  currentTab: 'home' | 'services' | 'book' | 'admin' | 'success' | 'failure';
  setCurrentTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <>
      {/* Floating Action Call Button on Mobile */}
      <a
        aria-label="Instant Call Consultation"
        href={BUSINESS_CONFIG.telLink}
        className="fixed right-4 bottom-[80px] md:bottom-8 z-40 w-12 h-12 rounded-full bg-[#00f5a0] text-[#003921] shadow-[0_4px_24px_rgba(0,245,160,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
      >
        <span className="material-symbols-outlined text-[26px] group-hover:animate-bounce">
          support_agent
        </span>
      </a>

      {/* Fixed Bottom Safe Navigation Bar (Mobile / Tablet) */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#0a0e18]/90 backdrop-blur-xl border-t border-white/5 md:hidden">
        <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
          {/* Home */}
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors ${
              currentTab === 'home'
                ? 'text-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="font-['JetBrains_Mono'] text-[10px] mt-0.5 font-medium">Home</span>
          </button>

          {/* Services */}
          <button
            type="button"
            onClick={() => setCurrentTab('services')}
            className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors ${
              currentTab === 'services'
                ? 'text-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">terminal</span>
            <span className="font-['JetBrains_Mono'] text-[10px] mt-0.5 font-medium">Services</span>
          </button>

          {/* Book */}
          <button
            type="button"
            onClick={() => setCurrentTab('book')}
            className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors ${
              currentTab === 'book'
                ? 'text-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            <span className="font-['JetBrains_Mono'] text-[10px] mt-0.5 font-medium">Book (₹100)</span>
          </button>

          {/* Admin */}
          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors ${
              currentTab === 'admin'
                ? 'text-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            <span className="font-['JetBrains_Mono'] text-[10px] mt-0.5 font-medium">Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
};
