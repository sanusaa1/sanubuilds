import React, { useState } from 'react';
import { SANU_SERVICES, type ServiceItem } from '../shared/services.js';

interface ServicesViewProps {
  selectedService: ServiceItem | null;
  onSelectService: (service: ServiceItem) => void;
  onBookService: (service: ServiceItem) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  selectedService,
  onSelectService,
  onBookService,
}) => {
  const [filter, setFilter] = useState<'all' | 'mobile' | 'software' | 'web' | 'security'>('all');

  const filteredServices = SANU_SERVICES.filter((service) => {
    if (filter === 'all') return true;
    return service.category === filter;
  });

  return (
    <div className="flex flex-col w-full pb-28 md:pb-16 max-w-7xl mx-auto px-4 md:px-8">
      {/* Header Area */}
      <div className="pt-4 pb-3 flex flex-col gap-3">
        {/* Protocol Badge */}
        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#1c1f2a] text-[#00f5a0] border border-white/5">
          <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse"></span>
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-semibold">
            Engineering Directory
          </span>
          <span className="text-[#b9cbbd] font-['JetBrains_Mono'] text-xs">v2.4</span>
        </div>

        {/* Section Intro */}
        <div className="flex flex-col gap-1">
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl md:text-4xl font-bold text-[#dfe2f1] tracking-tight">
            Architecture &amp; Solutions
          </h1>
          <p className="font-['Geist'] text-sm text-[#b9cbbd] max-w-3xl">
            Production-grade mobile builds, high-integrity PC software, and hardened application
            security infrastructure.
          </p>
        </div>

        {/* Explicit ₹100 Booking Protocol Assurance Banner */}
        <div className="relative overflow-hidden rounded-xl bg-[#171b26] p-4 border border-white/5 shadow-md">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-[#00f5a0]/15 text-[#00f5a0] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-['JetBrains_Mono'] text-sm text-[#00f5a0] font-bold">
                  ₹100 Verification Deposit
                </span>
                <span className="px-2 py-0.5 rounded bg-[#313540] text-[#9aecff] font-['JetBrains_Mono'] text-[10px]">
                  Anti-Spam Token
                </span>
              </div>
              <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] mt-1 leading-snug">
                ₹100 appointment booking fee applies on scheduling. Service charges will be settled
                after project scoping. 100% credited against your initial milestone invoice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="w-full overflow-x-auto py-2 no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                : 'bg-[#1c1f2a] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
            }`}
          >
            All (8)
          </button>

          <button
            type="button"
            onClick={() => setFilter('mobile')}
            className={`px-4 py-2 rounded-full font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filter === 'mobile'
                ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                : 'bg-[#1c1f2a] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
            }`}
          >
            Mobile Apps
          </button>

          <button
            type="button"
            onClick={() => setFilter('software')}
            className={`px-4 py-2 rounded-full font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filter === 'software'
                ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                : 'bg-[#1c1f2a] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
            }`}
          >
            Custom Software
          </button>

          <button
            type="button"
            onClick={() => setFilter('web')}
            className={`px-4 py-2 rounded-full font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filter === 'web'
                ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                : 'bg-[#1c1f2a] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
            }`}
          >
            Web &amp; Tools
          </button>

          <button
            type="button"
            onClick={() => setFilter('security')}
            className={`px-4 py-2 rounded-full font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
              filter === 'security'
                ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                : 'bg-[#1c1f2a] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* Services Grid (All 8 exact services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {filteredServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <article
              key={service.id}
              className={`rounded-2xl p-5 md:p-6 flex flex-col justify-between gap-4 border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#1c1f2a] border-[#00f5a0] shadow-[0_0_24px_rgba(0,245,160,0.2)] ring-1 ring-[#00f5a0]'
                  : 'bg-[#171b26] border-white/5 hover:border-white/10 shadow-md'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#00f5a0] text-[#003921]'
                          : 'bg-[#262a35] text-[#00f5a0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {service.icon}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff] uppercase tracking-wider font-semibold">
                        {service.tagline}
                      </span>
                      <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-[#dfe2f1] leading-tight">
                        {service.name}
                      </h2>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-[#262a35] text-[#00f5a0] font-['JetBrains_Mono'] text-xs font-semibold shrink-0">
                    {service.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] leading-relaxed">
                  {service.description}
                </p>

                {/* Key Technical Features Checklist */}
                <div className="bg-[#0f131d]/60 p-3 rounded-xl border border-white/5 space-y-1 text-xs font-['Geist'] text-[#dfe2f1]">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#00f5a0] text-[10px] font-mono">✓</span>
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-2 border-t border-white/5">
                  <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd] uppercase">
                    PRICE / ESTIMATE:
                  </span>
                  <span className="font-['Space_Grotesk'] text-xl font-bold text-[#00f5a0]">
                    {service.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Select Service & Book Appointment */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#00f5a0] text-[#003921] shadow-md'
                      : 'bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSelected ? 'task_alt' : 'check_circle'}
                  </span>
                  <span>{isSelected ? 'Selected' : 'Select Service'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onBookService(service)}
                  className="py-2.5 px-4 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,160,0.3)] whitespace-nowrap"
                >
                  <span>Book Appointment</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sticky Bottom Tray for Active Service Selection (Mobile / Desktop) */}
      {selectedService && (
        <div className="fixed bottom-[64px] md:bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-[#0a0e18]/95 backdrop-blur-xl border border-[#00f5a0]/50 shadow-2xl pointer-events-auto flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-ping"></span>
                <span className="font-['Space_Grotesk'] text-sm font-bold text-[#dfe2f1] truncate">
                  {selectedService.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] mt-0.5">
                <span className="text-[#00f5a0] font-semibold">{selectedService.price}</span>
                <span className="text-[#b9cbbd]">· ₹100 Booking Fee</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBookService(selectedService)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,245,160,0.4)]"
            >
              <span>Proceed to Booking</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
