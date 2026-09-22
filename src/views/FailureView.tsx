import React from 'react';
import { BUSINESS_CONFIG } from '../config.js';
import type { BookingRecord } from '../shared/services.js';

interface FailureViewProps {
  errorReason?: string;
  booking: BookingRecord | null;
  onRetryPayment: () => void;
  onNavigateTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
  onSwitchToSuccess: () => void;
}

export const FailureView: React.FC<FailureViewProps> = ({
  errorReason,
  booking,
  onRetryPayment,
  onNavigateTab,
  onSwitchToSuccess,
}) => {
  return (
    <div className="flex flex-col w-full pb-28 md:pb-16 max-w-2xl mx-auto px-4 md:px-8 space-y-4">
      {/* State Switcher Pill */}
      <div className="flex items-center justify-between bg-[#0a0e18] p-1 rounded-full border border-white/5 my-2">
        <button
          type="button"
          onClick={onSwitchToSuccess}
          className="flex-1 py-1.5 px-3 rounded-full font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 text-[#b9cbbd] hover:text-[#dfe2f1] transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Confirmed View</span>
        </button>
        <button
          type="button"
          className="flex-1 py-1.5 px-3 rounded-full font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#93000a] text-white shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          <span>Failure State</span>
        </button>
      </div>

      {/* Failure Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c1f2a] p-6 md:p-8 text-center flex flex-col items-center border border-[#ffb4ab]/20 shadow-xl">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#93000a]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-full bg-[#93000a]/20 flex items-center justify-center mb-3 text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#93000a]/20 text-[#ffb4ab] mb-2 border border-[#ffb4ab]/30">
          <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider font-semibold">
            Payment Incomplete
          </span>
        </div>

        <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#dfe2f1]">
          Payment Not Completed
        </h1>
        <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] mt-2 max-w-md leading-relaxed">
          Your appointment has not been confirmed because the ₹100 booking payment was not
          completed.
        </p>

        {errorReason && (
          <div className="mt-4 p-2.5 rounded-lg bg-[#0f131d] border border-white/5 font-['JetBrains_Mono'] text-xs text-[#ffb4ab]">
            {errorReason}
          </div>
        )}
      </div>

      {/* Diagnostic & Advisory Card */}
      <div className="rounded-2xl bg-[#171b26] p-5 md:p-6 border border-white/5 shadow-md space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <span className="material-symbols-outlined text-[#00f5a0] text-[20px]">info</span>
          <span className="font-['Space_Grotesk'] text-base font-bold text-[#dfe2f1]">
            Security &amp; Deposit Advisory
          </span>
        </div>

        <ul className="space-y-2 text-[#b9cbbd] font-['Geist']">
          <li className="flex items-start gap-2">
            <span className="text-[#00f5a0] font-mono">✓</span>
            <span>No funds have been debited from your bank account or UPI handle.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00f5a0] font-mono">✓</span>
            <span>
              The ₹100 appointment fee is required to verify the booking and prevent fraudulent spam
              reservations.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00f5a0] font-mono">✓</span>
            <span>
              Your session parameters and selected service are temporarily cached and ready for
              instant retry.
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-2">
        <button
          type="button"
          onClick={onRetryPayment}
          className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,245,160,0.3)]"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          <span>Try Payment Again (₹100)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('book')}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#262a35] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            <span>Modify Booking</span>
          </button>

          <a
            href={BUSINESS_CONFIG.telLink}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#262a35] text-[#00f5a0] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
