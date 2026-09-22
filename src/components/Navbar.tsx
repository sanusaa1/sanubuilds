import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '../config.js';

interface NavbarProps {
  currentTab: 'home' | 'services' | 'book' | 'admin' | 'success' | 'failure';
  setCurrentTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, subtitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#0f131d]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
      <div className="h-16 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + Logo & Brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-[#dfe2f1] hover:text-[#00f5a0] transition-colors rounded-lg bg-white/5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src={BUSINESS_CONFIG.logoUrl}
              alt="Sanu Builds Brand Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#dfe2f1] leading-none group-hover:text-[#00f5a0] transition-colors">
                {BUSINESS_CONFIG.name}
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] leading-tight truncate max-w-[140px] mt-0.5">
                {subtitle || 'Engineering & Security'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'home'
                ? 'text-[#00f5a0] font-semibold border-b-2 border-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('services')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'services'
                ? 'text-[#00f5a0] font-semibold border-b-2 border-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">terminal</span>
            <span>Services (8)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('book')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'book'
                ? 'text-[#00f5a0] font-semibold border-b-2 border-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Book Appointment (₹100)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              currentTab === 'admin'
                ? 'text-[#00f5a0] font-semibold border-b-2 border-[#00f5a0]'
                : 'text-[#b9cbbd] hover:text-[#dfe2f1]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Right: Call Now CTA & Admin Shortcut */}
        <div className="flex items-center gap-2">
          <a
            href={BUSINESS_CONFIG.telLink}
            className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#00f5a0] text-[#003921] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,160,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span className="hidden sm:inline">Call Now</span>
            <span className="sm:hidden">Call</span>
          </a>

          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            title="Admin Login & Portal"
            className="w-8 h-8 rounded-full bg-[#1c1f2a] border border-white/10 flex items-center justify-center text-[#dfe2f1] hover:text-[#00f5a0] hover:border-[#00f5a0]/50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171b26]/98 border-b border-white/10 px-4 py-4 flex flex-col gap-2.5 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <button
            type="button"
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors ${
              currentTab === 'home'
                ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                : 'bg-white/5 text-[#dfe2f1] hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Home Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab('services');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors ${
              currentTab === 'services'
                ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                : 'bg-white/5 text-[#dfe2f1] hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <span>All Services (8 Categories)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab('book');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors ${
              currentTab === 'book'
                ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                : 'bg-white/5 text-[#dfe2f1] hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Book Appointment (₹100 Fee)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab('admin');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors ${
              currentTab === 'admin'
                ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                : 'bg-white/5 text-[#dfe2f1] hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            <span>Admin Control Center</span>
          </button>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#b9cbbd]">
            <span>Direct Line:</span>
            <a href={BUSINESS_CONFIG.telLink} className="text-[#00f5a0] font-mono font-semibold">
              {BUSINESS_CONFIG.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
