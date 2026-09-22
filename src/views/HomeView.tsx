import React from 'react';
import { BUSINESS_CONFIG } from '../config.js';
import { SANU_SERVICES, type ServiceItem } from '../shared/services.js';

interface HomeViewProps {
  onSelectService: (service: ServiceItem) => void;
  onNavigateTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectService, onNavigateTab }) => {
  return (
    <div className="flex flex-col w-full pb-20 md:pb-12 max-w-7xl mx-auto px-4 md:px-8">
      {/* Top Protocol Status Banner */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between gap-2 bg-[#171b26]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5a0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00f5a0]"></span>
            </span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0] uppercase tracking-wider font-semibold">
              Engineers On Duty
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#313540]/80 px-2 py-0.5 rounded text-xs">
            <span className="material-symbols-outlined text-[14px] text-[#00f5a0]">verified</span>
            <span className="font-['JetBrains_Mono'] text-[#dfe2f1] text-[11px] font-medium">
              ₹100 Booking Protocol
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative my-3 bg-[#1c1f2a]/70 backdrop-blur-xl p-5 md:p-10 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#00f5a0]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#00d7f4]/10 blur-3xl pointer-events-none"></div>

        {/* Identity Lockup */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-[#0a0e18] p-1.5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
            <img
              src={BUSINESS_CONFIG.logoUrl}
              alt="Sanu Builds Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#dfe2f1] tracking-tight leading-none">
                {BUSINESS_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] font-['JetBrains_Mono'] text-[10px] font-bold tracking-wider leading-none">
                PRO
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd] mt-1">
              {BUSINESS_CONFIG.tagline}
            </span>
          </div>
        </div>

        {/* Main Heading & Description */}
        <div className="flex flex-col gap-3 relative z-10">
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-4xl md:text-5xl font-bold text-[#dfe2f1] tracking-tight leading-tight max-w-4xl text-balance">
            {BUSINESS_CONFIG.heading}
          </h1>
          <p className="font-['Geist'] text-sm sm:text-base text-[#b9cbbd] leading-relaxed max-w-3xl">
            {BUSINESS_CONFIG.description}
          </p>
        </div>

        {/* Quick Proof Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10 pt-1">
          <div className="bg-[#171b26] p-3 rounded-xl border border-white/5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs text-[#b9cbbd]">
              <span>DELIVERED</span>
              <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">rocket_launch</span>
            </div>
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#dfe2f1]">100+ Apps</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#00f5a0]">Zero-Lag Deploy</span>
          </div>

          <div className="bg-[#171b26] p-3 rounded-xl border border-white/5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs text-[#b9cbbd]">
              <span>ASSURANCE</span>
              <span className="material-symbols-outlined text-[16px] text-[#9aecff]">security</span>
            </div>
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#dfe2f1]">99.9%</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff]">Hardened Audits</span>
          </div>

          <div className="bg-[#171b26] p-3 rounded-xl border border-white/5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs text-[#b9cbbd]">
              <span>BOOKING FEE</span>
              <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">payments</span>
            </div>
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#00f5a0]">₹100</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">100% Credited</span>
          </div>

          <div className="bg-[#171b26] p-3 rounded-xl border border-white/5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs text-[#b9cbbd]">
              <span>SPEED SLA</span>
              <span className="material-symbols-outlined text-[16px] text-[#9aecff]">bolt</span>
            </div>
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#dfe2f1]">&lt; 15 Min</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff]">Fast Architect Call</span>
          </div>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 pt-2">
          {/* 1. Book Appointment */}
          <button
            type="button"
            onClick={() => onNavigateTab('book')}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] font-bold text-base flex items-center justify-between sm:justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(0,245,160,0.3)]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
              <span>Book Appointment</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0a0e18]/80 text-[#00f5a0] px-2 py-0.5 rounded font-['JetBrains_Mono'] text-xs">
              <span>₹100 FEE</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </div>
          </button>

          {/* 2. Explore Services */}
          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#262a35] text-[#dfe2f1] font-['Space_Grotesk'] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#353944] active:scale-[0.98] transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px] text-[#9aecff]">explore</span>
            <span>Explore Services</span>
          </button>

          {/* 3. Call Now */}
          <a
            href={BUSINESS_CONFIG.telLink}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#262a35] text-[#00f5a0] font-['JetBrains_Mono'] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#353944] active:scale-[0.98] transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Now</span>
          </a>
        </div>

        {/* Crucial Pricing Rule / Fee Notice Banner */}
        <div className="bg-[#0a0e18]/90 p-3.5 rounded-xl border border-white/10 flex items-start gap-2.5 relative z-10">
          <span className="material-symbols-outlined text-[20px] text-[#00f5a0] shrink-0 mt-0.5">
            info
          </span>
          <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] leading-relaxed">
            <strong className="text-[#dfe2f1]">
              ₹100 is the appointment booking fee.
            </strong>{' '}
            Final service charges depend on the selected service and technical requirements. The ₹100
            fee guarantees a dedicated 45-minute architectural consultation and is 100% credited
            against your initial project milestone invoice.
          </p>
        </div>
      </section>

      {/* Featured Architecture Showcase Bento Card */}
      <section className="my-4 rounded-2xl overflow-hidden bg-[#171b26] border border-white/5 shadow-md">
        <div
          className="h-48 md:h-64 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url('${BUSINESS_CONFIG.heroBannerUrl}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#171b26] via-[#171b26]/40 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0] uppercase tracking-wider font-semibold">
                Active Architecture
              </span>
              <h2 className="font-['Space_Grotesk'] text-xl md:text-2xl font-bold text-[#dfe2f1]">
                Full-Stack &amp; Mobile Pipeline
              </h2>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#0a0e18]/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#00f5a0]">security</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1]">SECURE</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#171b26]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00f5a0] text-[24px]">bolt</span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-[#dfe2f1]">Sub-48h</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">Turnaround Prototyping</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#9aecff] text-[24px]">shield</span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-[#dfe2f1]">Audit Ready</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">VAPT &amp; Obfuscation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00f5a0] text-[24px]">payments</span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-[#00f5a0]">₹100 Token</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">Anti-Spam Slot Lock</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#9aecff] text-[24px]">send</span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-[#dfe2f1]">Telegram Sync</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">Direct Admin Bot Alert</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Preview Section */}
      <section className="my-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <span className="font-['JetBrains_Mono'] text-xs text-[#9aecff] uppercase tracking-wider font-semibold">
              Capabilities &amp; Tier Pricing
            </span>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#dfe2f1]">
              Featured Services
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className="text-xs font-['JetBrains_Mono'] text-[#00f5a0] hover:underline flex items-center gap-1"
          >
            <span>View All 8 Services</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SANU_SERVICES.slice(0, 6).map((service) => (
            <article
              key={service.id}
              className="bg-[#171b26] p-5 rounded-2xl border border-white/5 shadow-md flex flex-col justify-between gap-4 hover:border-[#00f5a0]/30 transition-all group"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#262a35] text-[#00f5a0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">{service.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff] uppercase tracking-wider">
                        {service.tagline.split('&')[0]}
                      </span>
                      <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#dfe2f1]">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#313540] text-[#00f5a0] font-['JetBrains_Mono'] text-[10px] font-semibold">
                    {service.badge}
                  </span>
                </div>

                <p className="font-['Geist'] text-xs text-[#b9cbbd] line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-baseline gap-2 pt-1 border-t border-white/5">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] uppercase">
                    PRICE:
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#00f5a0]">
                    {service.price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="py-2 px-3 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Select</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectService(service);
                    onNavigateTab('book');
                  }}
                  className="py-2 px-3 rounded-lg bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>Book (₹100)</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Customer Proof & Testimonial */}
      <section className="my-4 bg-[#171b26] p-5 md:p-8 rounded-2xl border border-white/5 shadow-md flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#262a35] border border-white/10">
          <img
            src={BUSINESS_CONFIG.testimonialAvatarUrl}
            alt="Vikram S. - Retail Chain Founder"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 text-[#00f5a0]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold">
              Verified Enterprise Client
            </span>
          </div>
          <p className="font-['Geist'] text-sm md:text-base text-[#dfe2f1] italic leading-relaxed">
            &ldquo;Sanu converted our entire offline billing ecosystem into a synchronized mobile
            network. Paying the initial ₹100 unlocked a 45-minute architectural consultation that saved
            us lakhs in bad third-party tooling.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-['Space_Grotesk'] font-bold text-[#dfe2f1]">Vikram S.</span>
            <span className="text-[#b9cbbd] text-xs">· Founder, Retail Fleet Operations</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="my-6 bg-[#1c1f2a] p-6 md:p-10 rounded-2xl border border-white/5 shadow-lg flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0] uppercase tracking-wider font-semibold">
            Direct Access Channels
          </span>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#dfe2f1]">
            Contact {BUSINESS_CONFIG.name}
          </h2>
          <p className="font-['Geist'] text-sm text-[#b9cbbd] max-w-2xl">
            Have a project in mind or need urgent production deployment? Speak directly with our lead
            software architect or lock in your reserved ₹100 appointment window.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={BUSINESS_CONFIG.telLink}
            className="p-4 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-between hover:bg-[#262a35] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00f5a0]/15 text-[#00f5a0] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">phone_in_talk</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] uppercase">
                  Direct Line / WhatsApp
                </span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-[#dfe2f1] group-hover:text-[#00f5a0] transition-colors">
                  {BUSINESS_CONFIG.phoneDisplay}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">arrow_outward</span>
          </a>

          <a
            href={`mailto:${BUSINESS_CONFIG.email}`}
            className="p-4 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-between hover:bg-[#262a35] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#9aecff]/15 text-[#9aecff] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] uppercase">
                  Architectural Inquiries
                </span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-[#dfe2f1] group-hover:text-[#9aecff] transition-colors">
                  {BUSINESS_CONFIG.email}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#9aecff] text-[22px]">arrow_outward</span>
          </a>
        </div>

        {/* All 8 Services Checklist */}
        <div className="bg-[#171b26] p-5 rounded-xl border border-white/5 flex flex-col gap-3">
          <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd] uppercase tracking-wider">
            All 8 Core Service Offerings:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-['Geist'] text-[#dfe2f1]">
            {SANU_SERVICES.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="text-[#00f5a0] font-mono">✓</span>
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={BUSINESS_CONFIG.telLink}
            className="min-h-[44px] px-6 py-3 rounded-xl bg-[#262a35] text-[#00f5a0] font-['JetBrains_Mono'] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Now</span>
          </a>

          <button
            type="button"
            onClick={() => onNavigateTab('book')}
            className="min-h-[44px] px-6 py-3 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,245,160,0.3)]"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Book Appointment (₹100)</span>
          </button>
        </div>
      </section>
    </div>
  );
};
