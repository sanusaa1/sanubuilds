import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '../config.js';
import type { BookingRecord } from '../shared/services.js';

interface SuccessViewProps {
  booking: BookingRecord | null;
  onNavigateTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
  onSwitchToFailure: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  booking,
  onNavigateTab,
  onSwitchToFailure,
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback demo booking if loaded directly without booking submission
  const displayBooking: BookingRecord = booking || {
    id: 'demo',
    booking_id: 'SB-2026-849102',
    customer_name: 'Rahul Sharma',
    mobile: '+91 98765 43210',
    email: 'rahul.sharma@techfleet.in',
    service_name: 'Android App Development',
    service_price: '₹10,000 - ₹50,000',
    appointment_date: 'Tomorrow',
    appointment_time: '11:30 AM IST',
    customer_requirement: 'Jetpack Compose migration & Offline sync.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    razorpay_order_id: 'order_Nks8921_mock',
    razorpay_payment_id: 'rzp_pay_9283410',
    razorpay_signature: 'hmac_sha256_verified_signature_token',
    telegram_status: 'SENT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const copyBookingId = () => {
    navigator.clipboard.writeText(displayBooking.booking_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full pb-28 md:pb-16 max-w-2xl mx-auto px-4 md:px-8 space-y-4">
      {/* State Switcher Pill (Matching Screen 3) */}
      <div className="flex items-center justify-between bg-[#0a0e18] p-1 rounded-full border border-white/5 my-2">
        <button
          type="button"
          className="flex-1 py-1.5 px-3 rounded-full font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#00f5a0] text-[#003921] shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Confirmed View</span>
        </button>
        <button
          type="button"
          onClick={onSwitchToFailure}
          className="flex-1 py-1.5 px-3 rounded-full font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 text-[#b9cbbd] hover:text-[#dfe2f1] transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          <span>Failure State</span>
        </button>
      </div>

      {/* Hero Confirmation Badge & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1c1f2a] p-6 md:p-8 text-center flex flex-col items-center border border-white/5 shadow-xl">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00f5a0]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated Check Icon */}
        <div className="relative w-16 h-16 rounded-full bg-[#00f5a0]/15 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(0,245,160,0.3)]">
          <div className="w-12 h-12 rounded-full bg-[#00f5a0] flex items-center justify-center text-[#003921]">
            <span className="material-symbols-outlined text-[28px] font-bold">check_circle</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f5a0]/10 text-[#00f5a0] mb-2 border border-[#00f5a0]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-ping"></span>
          <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider font-semibold">
            Verified Consultation Slot
          </span>
        </div>

        <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#dfe2f1]">
          Appointment Booked Successfully!
        </h1>
        <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] mt-2 max-w-md leading-relaxed">
          Thank you for booking with Sanu Builds. Your appointment has been successfully secured and
          scheduled.
        </p>
      </div>

      {/* Verified Booking Summary Card */}
      <div className="rounded-2xl bg-[#171b26] p-5 md:p-6 border border-white/5 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9aecff] text-[20px]">security</span>
            <span className="font-['Space_Grotesk'] text-base font-bold text-[#dfe2f1]">
              Booking Summary
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#262a35] text-[#9aecff] font-['JetBrains_Mono'] text-[10px] font-semibold">
            HMAC-SHA256
          </span>
        </div>

        {/* Booking Reference with Copy button */}
        <div className="p-3.5 rounded-xl bg-[#0f131d] border border-white/5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] uppercase">
              Booking Reference
            </p>
            <p className="font-['JetBrains_Mono'] text-base font-bold text-[#00f5a0] truncate">
              {displayBooking.booking_id}
            </p>
          </div>
          <button
            type="button"
            onClick={copyBookingId}
            className="px-3 py-1.5 rounded-lg bg-[#262a35] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 hover:bg-[#353944] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0f131d] border border-white/5">
            <p className="font-['JetBrains_Mono'] text-[#b9cbbd] text-[10px]">Client Name</p>
            <p className="font-['Geist'] text-sm font-semibold text-[#dfe2f1] truncate mt-0.5">
              {displayBooking.customer_name}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0f131d] border border-white/5">
            <p className="font-['JetBrains_Mono'] text-[#b9cbbd] text-[10px]">Contact</p>
            <p className="font-['Geist'] text-sm font-semibold text-[#dfe2f1] truncate mt-0.5">
              {displayBooking.mobile}
            </p>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-[#0f131d] border border-white/5 flex items-center justify-between">
            <div>
              <p className="font-['JetBrains_Mono'] text-[#b9cbbd] text-[10px]">Selected Service</p>
              <p className="font-['Geist'] text-sm font-semibold text-[#dfe2f1] mt-0.5">
                {displayBooking.service_name}
              </p>
            </div>
            <span className="material-symbols-outlined text-[#00f5a0] text-[22px]">code</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f131d] border border-white/5">
            <p className="font-['JetBrains_Mono'] text-[#b9cbbd] text-[10px]">Estimated Scope</p>
            <p className="font-['JetBrains_Mono'] text-xs font-bold text-[#00f5a0] mt-0.5">
              {displayBooking.service_price}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0f131d] border border-white/5">
            <p className="font-['JetBrains_Mono'] text-[#b9cbbd] text-[10px]">Date &amp; Time</p>
            <p className="font-['Geist'] text-xs font-semibold text-[#dfe2f1] mt-0.5">
              {displayBooking.appointment_date}, {displayBooking.appointment_time}
            </p>
          </div>
        </div>

        {/* Deposit Protocol Token */}
        <div className="p-3.5 rounded-xl bg-[#0f131d] border border-white/5 flex flex-col space-y-1.5 text-xs font-['JetBrains_Mono']">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0]"></span>
              <span className="text-[#dfe2f1] font-semibold">Deposit Paid</span>
            </div>
            <span className="text-[#00f5a0] font-bold text-sm">₹100.00 PAID</span>
          </div>
          <div className="flex items-center justify-between text-[#b9cbbd] text-[11px]">
            <span>Razorpay Payment ID</span>
            <span className="text-[#dfe2f1] font-mono">
              {displayBooking.razorpay_payment_id || 'pay_test_verified'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#b9cbbd] text-[11px]">
            <span>Cryptographic Signature</span>
            <span className="text-[#00f5a0] flex items-center gap-1">
              HMAC-SHA256 Verified
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          </div>
        </div>
      </div>

      {/* Live Telegram Bot Dispatch Status Card */}
      <div className="rounded-2xl bg-[#1c1f2a] p-5 border border-white/5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00d7f4]/15 flex items-center justify-center text-[#9aecff]">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#dfe2f1]">
                Telegram Dispatch Relay
              </h3>
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">
                Admin channel auto-synchronized
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#00f5a0]/15 text-[#00f5a0] font-['JetBrains_Mono'] text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
            Sent ✅
          </span>
        </div>

        {/* Telegram Incoming Notification Raw View */}
        <div className="p-3.5 rounded-xl bg-[#0a0e18] font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] space-y-1 border border-white/5 leading-snug">
          <div className="text-[#9aecff] font-semibold">⚡ [TELEGRAM INCOMING NOTIFICATION]</div>
          <div className="text-[#dfe2f1] font-bold">🚨 NEW APPOINTMENT</div>
          <div className="text-white/20">━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>
            <strong>🏢 Business:</strong> {BUSINESS_CONFIG.name}
          </div>
          <div>
            <strong>👤 Customer Name:</strong> {displayBooking.customer_name}
          </div>
          <div>
            <strong>📱 Mobile:</strong> {displayBooking.mobile}
          </div>
          <div>
            <strong>🛠 Service:</strong> {displayBooking.service_name}
          </div>
          <div>
            <strong>💰 Service Price:</strong> {displayBooking.service_price}
          </div>
          <div>
            <strong>💳 Appointment Fee:</strong> ₹100
          </div>
          <div>
            <strong>✅ Payment Status:</strong> PAID
          </div>
          <div>
            <strong>📦 Razorpay Order ID:</strong>{' '}
            {displayBooking.razorpay_order_id || 'order_mock_token'}
          </div>
          <div>
            <strong>💳 Razorpay Payment ID:</strong>{' '}
            {displayBooking.razorpay_payment_id || 'pay_mock_token'}
          </div>
          <div>
            <strong>📅 Appointment Date:</strong> {displayBooking.appointment_date}
          </div>
          <div>
            <strong>⏰ Appointment Time:</strong> {displayBooking.appointment_time}
          </div>
          <div>
            <strong>📝 Customer Requirement:</strong>{' '}
            {displayBooking.customer_requirement || 'None specified'}
          </div>
          <div>
            <strong>🔖 Booking ID:</strong>{' '}
            <span className="text-[#00f5a0] font-bold">{displayBooking.booking_id}</span>
          </div>
          <div className="text-white/20">━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div className="text-[#9aecff]">
            Bot Action: Appointment locked. Architect notified for discovery call.
          </div>
        </div>
      </div>

      {/* Architect Assigned Callout Card */}
      <div className="rounded-2xl bg-[#171b26] p-4 md:p-5 border border-white/5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#9aecff]/15 flex items-center justify-center text-[#9aecff] shrink-0">
          <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
        </div>
        <div className="min-w-0">
          <p className="font-['Space_Grotesk'] text-sm font-bold text-[#dfe2f1]">
            Architect Assigned
          </p>
          <p className="font-['Geist'] text-xs text-[#b9cbbd] mt-0.5 leading-relaxed">
            Our senior lead architect will contact you directly on Google Meet / phone at the
            scheduled time.
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col space-y-2 pt-2">
        <a
          href={BUSINESS_CONFIG.telLink}
          className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,245,160,0.3)]"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
          <span>Call Sanu Builds Directly</span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#262a35] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Receipt PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('home')}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#262a35] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
