import React, { useState } from 'react';
import type { BookingRecord } from '../shared/services.js';
import { BUSINESS_CONFIG } from '../config.js';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord;
  orderId: string;
  razorpayKeyId: string;
  onPaymentSuccess: (paymentData: {
    booking_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onPaymentFailure: (errorReason: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  booking,
  orderId,
  razorpayKeyId,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[RAZORPAY_API] Handshake established with checkout engine.',
    `[PAYLOAD] Amount: 10000 paise (₹100) | Token: ${orderId}`,
    'Ready for cryptographic authorization.',
  ]);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[AUTH] Transmitting token via ${selectedMethod.toUpperCase()} rail...`,
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        '[BANK_NETWORK] 200 OK: ₹100 deposit token authorized.',
        '[SERVER_VERIFY] Generating HMAC-SHA256 signature for server validation...',
      ]);

      setTimeout(() => {
        const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const signature = 'hmac_sha256_mock_sig_' + Math.random().toString(36).substring(2, 12);

        setProcessing(false);
        onPaymentSuccess({
          booking_id: booking.booking_id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
      }, 700);
    }, 700);
  };

  const handleSimulateCancel = () => {
    onPaymentFailure('Customer cancelled payment in checkout drawer.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a0e18] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 md:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f5a0]/15 text-[#00f5a0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] tracking-wider uppercase">
                Razorpay Checkout Gateway
              </span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#dfe2f1] leading-tight">
                {BUSINESS_CONFIG.name} Security
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#b9cbbd] hover:text-[#dfe2f1]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Order Meta Badge */}
        <div className="bg-[#171b26] p-3.5 rounded-xl border border-white/5 flex items-center justify-between font-['JetBrains_Mono'] text-xs">
          <div className="flex flex-col">
            <span className="text-[#b9cbbd] text-[10px]">Booking Reference</span>
            <span className="text-[#00f5a0] font-bold text-sm">{booking.booking_id}</span>
            <span className="text-[#9aecff] text-[10px] mt-0.5">{booking.service_name}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[#b9cbbd] text-[10px]">Consultation Deposit</span>
            <span className="text-[#dfe2f1] font-['Space_Grotesk'] text-xl font-bold">
              ₹100.00
            </span>
            <span className="text-[#b9cbbd] text-[9px]">(10000 Paise)</span>
          </div>
        </div>

        {/* Notice on ₹100 deposit */}
        <div className="bg-[#1c1f2a]/70 p-3 rounded-lg border border-white/5 flex items-start gap-2 text-xs text-[#b9cbbd]">
          <span className="material-symbols-outlined text-[#00f5a0] text-[18px] shrink-0 mt-0.5">
            verified_user
          </span>
          <p className="leading-relaxed">
            <strong className="text-[#dfe2f1]">₹100 appointment booking fee:</strong> Deducted
            against final service charges upon project commissioning.
          </p>
        </div>

        {/* Payment Options Selection */}
        <div className="space-y-2">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] uppercase tracking-wider">
            Select Payment Rail
          </span>

          {/* UPI */}
          <label
            onClick={() => setSelectedMethod('upi')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMethod === 'upi'
                ? 'bg-[#00f5a0]/10 border-[#00f5a0] shadow-sm'
                : 'bg-[#171b26] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentRail"
                checked={selectedMethod === 'upi'}
                onChange={() => setSelectedMethod('upi')}
                className="accent-[#00f5a0] w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#dfe2f1] flex items-center gap-1.5">
                  UPI Instant Pay
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00d7f4]/15 text-[#9aecff]">
                    Zero Failure Rate
                  </span>
                </span>
                <span className="text-[11px] text-[#b9cbbd]">Google Pay, PhonePe, Paytm, CRED</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[22px] text-[#9aecff]">qr_code_scanner</span>
          </label>

          {/* Card */}
          <label
            onClick={() => setSelectedMethod('card')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMethod === 'card'
                ? 'bg-[#00f5a0]/10 border-[#00f5a0] shadow-sm'
                : 'bg-[#171b26] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentRail"
                checked={selectedMethod === 'card'}
                onChange={() => setSelectedMethod('card')}
                className="accent-[#00f5a0] w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#dfe2f1]">
                  Corporate / Debit / Credit Cards
                </span>
                <span className="text-[11px] text-[#b9cbbd]">Visa, Mastercard, RuPay</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[22px] text-[#b9cbbd]">credit_card</span>
          </label>

          {/* Netbanking */}
          <label
            onClick={() => setSelectedMethod('netbanking')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMethod === 'netbanking'
                ? 'bg-[#00f5a0]/10 border-[#00f5a0] shadow-sm'
                : 'bg-[#171b26] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentRail"
                checked={selectedMethod === 'netbanking'}
                onChange={() => setSelectedMethod('netbanking')}
                className="accent-[#00f5a0] w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#dfe2f1]">
                  Net Banking
                </span>
                <span className="text-[11px] text-[#b9cbbd]">HDFC, ICICI, SBI, Axis &amp; all banks</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[22px] text-[#b9cbbd]">account_balance</span>
          </label>
        </div>

        {/* Live Simulation Console Terminal */}
        <div className="rounded-xl bg-[#0f131d] p-3 font-['JetBrains_Mono'] text-[11px] space-y-1 border border-white/5">
          <div className="flex items-center justify-between text-[#b9cbbd] border-b border-white/5 pb-1">
            <span>[SECURITY_ENGINE] Razorpay Verified</span>
            <span className="text-[#00f5a0]">ONLINE</span>
          </div>
          <div className="max-h-20 overflow-y-auto space-y-0.5 text-[#b9cbbd]">
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('OK') || log.includes('authorized')
                    ? 'text-[#00f5a0]'
                    : log.includes('AUTH')
                    ? 'text-[#9aecff]'
                    : 'text-[#dfe2f1]'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={processing}
            onClick={handleSimulatePayment}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-base font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_24px_rgba(0,245,160,0.3)] disabled:opacity-50"
          >
            {processing ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>Verifying Signature &amp; Dispatching...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span>Complete ₹100 Payment</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulateCancel}
            className="w-full py-2 text-xs font-['JetBrains_Mono'] text-[#b9cbbd] hover:text-[#ffb4ab] transition-colors"
          >
            Cancel Transaction (Test Failure View)
          </button>
        </div>
      </div>
    </div>
  );
};
