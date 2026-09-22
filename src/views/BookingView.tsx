import React, { useState, useEffect } from 'react';
import { BUSINESS_CONFIG } from '../config.js';
import {
  SANU_SERVICES,
  AVAILABLE_TIME_SLOTS,
  type ServiceItem,
  type BookingRecord,
} from '../shared/services.js';
import { RazorpayModal } from '../components/RazorpayModal.js';

interface BookingViewProps {
  selectedService: ServiceItem | null;
  onSelectService: (service: ServiceItem) => void;
  onNavigateTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
  onBookingSuccess: (booking: BookingRecord) => void;
  onBookingFailure: (errorReason: string, booking?: BookingRecord) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  selectedService,
  onSelectService,
  onNavigateTab,
  onBookingSuccess,
  onBookingFailure,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [currentServiceId, setCurrentServiceId] = useState<string>(
    selectedService?.id || SANU_SERVICES[0].id
  );
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('11:30 AM');
  const [customerRequirement, setCustomerRequirement] = useState('');

  // Validation & Loading states
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [dateError, setDateError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Razorpay Checkout Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');

  // Initialize minimum date to today
  const todayFormatted = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!appointmentDate) {
      setAppointmentDate(todayFormatted);
    }
  }, [todayFormatted, appointmentDate]);

  useEffect(() => {
    if (selectedService) {
      setCurrentServiceId(selectedService.id);
    }
  }, [selectedService]);

  const activeService =
    SANU_SERVICES.find((s) => s.id === currentServiceId) || SANU_SERVICES[0];

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = SANU_SERVICES.find((s) => s.id === e.target.value);
    if (found) {
      setCurrentServiceId(found.id);
      onSelectService(found);
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    setNameError('');
    setMobileError('');
    setDateError('');
    setApiError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameError('Full customer name is required (min 2 characters).');
      valid = false;
    }

    const digitsOnly = mobileNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      valid = false;
    }

    if (!appointmentDate) {
      setDateError('Please choose an appointment date.');
      valid = false;
    } else if (appointmentDate < todayFormatted) {
      setDateError('Appointment date cannot be in the past.');
      valid = false;
    }

    return valid;
  };

  const handleInitiateBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: fullName,
          mobile: `+91 ${mobileNumber.replace(/\D/g, '')}`,
          email: emailAddress || undefined,
          service_name: activeService.name,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          customer_requirement: customerRequirement,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize booking order.');
      }

      setActiveBooking(data.booking);
      setActiveOrderId(data.order.id);
      setRazorpayKeyId(data.razorpayKeyId || 'rzp_test_demo');

      // Check if real Razorpay JS SDK is loaded and keys are live
      const isRealRazorpayAvailable =
        typeof (window as any).Razorpay === 'function' &&
        data.razorpayKeyId &&
        !data.razorpayKeyId.includes('demo');

      if (isRealRazorpayAvailable) {
        // Real Razorpay Checkout flow
        const options = {
          key: data.razorpayKeyId,
          amount: data.amountPaise || 10000,
          currency: 'INR',
          name: BUSINESS_CONFIG.name,
          description: `₹100 Appointment Fee - ${activeService.name}`,
          image: BUSINESS_CONFIG.logoUrl,
          order_id: data.order.id,
          prefill: {
            name: fullName,
            contact: mobileNumber.replace(/\D/g, ''),
            email: emailAddress,
          },
          theme: { color: '#00f5a0' },
          handler: async function (paymentResp: any) {
            await handleServerPaymentVerification({
              booking_id: data.booking.booking_id,
              razorpay_order_id: paymentResp.razorpay_order_id || data.order.id,
              razorpay_payment_id: paymentResp.razorpay_payment_id,
              razorpay_signature: paymentResp.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              onBookingFailure('Payment cancelled by customer.', data.booking);
            },
          },
        };

        const rzpInstance = new (window as any).Razorpay(options);
        rzpInstance.on('payment.failed', function (failResp: any) {
          setLoading(false);
          onBookingFailure(failResp.error?.description || 'Payment failed.', data.booking);
        });
        rzpInstance.open();
      } else {
        // Seamless simulated sandbox modal (guarantees 100% interactive flow in all preview environments)
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setApiError(err.message || 'Network exception. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServerPaymentVerification = async (payload: {
    booking_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const verifyData = await response.json();
      if (!response.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Server-side payment verification failed.');
      }

      // Successful verification and automatic Telegram dispatch
      setIsModalOpen(false);
      onBookingSuccess(verifyData.booking);
    } catch (err: any) {
      console.error('Verification error:', err);
      setIsModalOpen(false);
      onBookingFailure(err.message || 'Signature verification failed.', activeBooking || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 md:pb-16 max-w-4xl mx-auto px-4 md:px-8 space-y-4">
      {/* Progress & Pipeline Header */}
      <div className="flex flex-col space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00f5a0] animate-ping"></span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0] tracking-wider uppercase font-semibold">
              Direct Architect Dispatch
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">Step 02 of 02</span>
        </div>
        <div className="w-full h-1 bg-[#262a35] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00d7f4] via-[#00f5a0] to-[#50ffaf] w-3/4 rounded-full"></div>
        </div>
      </div>

      {/* Selected Service Context Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#171b26] p-4 md:p-5 border border-white/5 shadow-md">
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00f5a0]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#262a35] flex items-center justify-center shrink-0 text-[#00f5a0]">
              <span className="material-symbols-outlined text-[24px]">{activeService.icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff] tracking-wider uppercase font-semibold">
                  Core Architecture
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#00f5a0]">
                  {activeService.badge}
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-[#dfe2f1] truncate">
                {activeService.name}
              </h2>
              <p className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd] mt-0.5">
                Est. Project Scale:{' '}
                <span className="text-[#00f5a0] font-semibold">{activeService.price}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#262a35] text-[#9aecff] hover:bg-[#353944] active:scale-95 transition-all flex items-center gap-1 font-['JetBrains_Mono'] text-xs"
          >
            <span>Change</span>
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
          </button>
        </div>
      </div>

      {/* ₹100 Booking Fee Callout Card */}
      <div className="rounded-2xl bg-[#0a0e18] p-4 md:p-5 border border-white/10 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00f5a0]/15 flex items-center justify-center shrink-0 text-[#00f5a0] mt-0.5">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="flex flex-col space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#00f5a0]">₹100</span>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#dfe2f1]">
                  Appointment Booking Fee
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#00f5a0]/10 text-[#00f5a0] font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider font-semibold">
                Spam Guard Protocol
              </span>
            </div>

            <p className="font-['Geist'] text-xs sm:text-sm text-[#b9cbbd] leading-relaxed">
              <strong className="text-[#dfe2f1]">₹100 is the appointment booking fee.</strong> Final
              service charges depend on the selected service and technical requirements discussed
              during the consultation.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-['JetBrains_Mono'] text-[#00f5a0]">
              <span className="material-symbols-outlined text-[16px]">offline_pin</span>
              <span>100% credited against your initial milestone invoice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInitiateBooking();
        }}
        className="rounded-2xl bg-[#171b26] p-5 md:p-8 space-y-5 border border-white/5 shadow-md"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="font-['Space_Grotesk'] text-xl font-bold text-[#dfe2f1]">
            Session Parameters
          </span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#b9cbbd]">* Mandatory inputs</span>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-['Geist'] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* 1. Full Name */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="fullName"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Lead Architect / Contact Name *</span>
            {nameError && (
              <span className="font-['Geist'] text-[11px] text-[#ffb4ab]">{nameError}</span>
            )}
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
              badge
            </span>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sanjeev Roy"
              className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['Geist'] text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors"
              required
            />
          </div>
        </div>

        {/* 2. Mobile Number (+91) */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="mobileNumber"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Direct Contact (+91 WhatsApp Enabled) *</span>
            {mobileError && (
              <span className="font-['Geist'] text-[11px] text-[#ffb4ab]">{mobileError}</span>
            )}
          </label>
          <div className="flex gap-2">
            <div className="w-16 flex items-center justify-center bg-[#262a35] rounded-xl text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-bold border border-white/5">
              +91
            </div>
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
                smartphone
              </span>
              <input
                id="mobileNumber"
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['JetBrains_Mono'] text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* 3. Work Email Address */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="emailAddress"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Work Email Address</span>
            <span className="text-[11px] text-[#b9cbbd]">Optional</span>
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
              mail
            </span>
            <input
              id="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="architect@startup.io"
              className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['Geist'] text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors"
            />
          </div>
        </div>

        {/* 4. Selected Service Dropdown (All 8 Core Services) */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="serviceSelect"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Selected Service Protocol *</span>
            <span className="text-[11px] text-[#00f5a0]">8 Services Available</span>
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
              layers
            </span>
            <select
              id="serviceSelect"
              value={currentServiceId}
              onChange={handleServiceChange}
              className="w-full appearance-none bg-[#0a0e18] text-[#dfe2f1] font-['Geist'] text-sm pl-11 pr-10 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors cursor-pointer"
            >
              {SANU_SERVICES.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0a0e18] text-[#dfe2f1]">
                  {s.name} ({s.price})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 text-[20px] text-[#b9cbbd] pointer-events-none">
              unfold_more
            </span>
          </div>
        </div>

        {/* 5. Appointment Date (Min today) */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="appointmentDate"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Scheduled Date *</span>
            <span className="text-[11px] text-[#9aecff]">IST Operating Hours</span>
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
              event
            </span>
            <input
              id="appointmentDate"
              type="date"
              min={todayFormatted}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-[#0a0e18] text-[#dfe2f1] font-['JetBrains_Mono'] text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors"
              required
            />
          </div>
          {dateError && <span className="text-[11px] text-[#ffb4ab]">{dateError}</span>}
        </div>

        {/* 6. Appointment Time Slot Chips */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold">
              Preferred Architectural Slot *
            </span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0]">
              {appointmentTime} Selected
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVAILABLE_TIME_SLOTS.map((slot) => {
              const isActive = appointmentTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setAppointmentTime(slot)}
                  className={`py-2 px-1 rounded-xl font-['JetBrains_Mono'] text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#00f5a0] text-[#003921] shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                      : 'bg-[#0a0e18] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Scope Requirements / Message */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="customerRequirement"
            className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold flex items-center justify-between"
          >
            <span>Customer Requirement / Project Brief</span>
            <span className="text-[11px] text-[#b9cbbd]">Recommended</span>
          </label>
          <textarea
            id="customerRequirement"
            rows={3}
            value={customerRequirement}
            onChange={(e) => setCustomerRequirement(e.target.value)}
            placeholder="Provide app context, existing website URLs, API requirements, or specific security targets for this session..."
            className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['Geist'] text-sm p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors resize-none"
          ></textarea>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-lg font-bold flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_24px_rgba(0,245,160,0.35)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[22px] animate-spin">sync</span>
                <span>Connecting Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">lock</span>
                <span>Pay ₹100 &amp; Book Appointment</span>
              </>
            )}
          </button>

          {/* Razorpay 256-bit Security Assurance */}
          <div className="flex items-center justify-center gap-2 text-center text-xs font-['JetBrains_Mono'] text-[#b9cbbd]">
            <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">verified</span>
            <p>Secured with Razorpay 256-bit encryption. Server-side payment verification enabled.</p>
          </div>
        </div>
      </form>

      {/* Telemetry & SLA Assurance Banner */}
      <div className="rounded-2xl bg-[#171b26] p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-['JetBrains_Mono'] text-xs text-[#9aecff] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Instant Dispatch Protocol
          </span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#00f5a0]">Sub-60s Routing</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono']">
          <div className="bg-[#0a0e18] p-3 rounded-xl border border-white/5 flex flex-col">
            <span className="text-[#b9cbbd] text-[10px]">Admin Telegram Bot</span>
            <span className="text-[#00f5a0] flex items-center gap-1 font-semibold mt-0.5">
              <span className="material-symbols-outlined text-[14px]">send</span> Auto Dispatch
            </span>
          </div>

          <div className="bg-[#0a0e18] p-3 rounded-xl border border-white/5 flex flex-col">
            <span className="text-[#b9cbbd] text-[10px]">Deposit Integrity</span>
            <span className="text-[#9aecff] flex items-center gap-1 font-semibold mt-0.5">
              <span className="material-symbols-outlined text-[14px]">terminal</span> 10000 Paise
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Modal (for sandbox / simulated checkout) */}
      {activeBooking && (
        <RazorpayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={activeBooking}
          orderId={activeOrderId}
          razorpayKeyId={razorpayKeyId}
          onPaymentSuccess={handleServerPaymentVerification}
          onPaymentFailure={(reason) => {
            setIsModalOpen(false);
            onBookingFailure(reason, activeBooking);
          }}
        />
      )}
    </div>
  );
};
