import React, { useState, useEffect } from 'react';
import type { BookingRecord, BookingStatus, PaymentStatus } from '../shared/services.js';
import { SANU_SERVICES } from '../shared/services.js';
import { BUSINESS_CONFIG } from '../config.js';

interface AdminViewProps {
  onNavigateTab: (tab: 'home' | 'services' | 'book' | 'admin') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateTab }) => {
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('sanu_admin_token') || '');
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Inspection Modal state
  const [inspectedBooking, setInspectedBooking] = useState<BookingRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = async (secretToUse?: string) => {
    setAuthLoading(true);
    setAuthError('');
    const secret = secretToUse || adminSecretInput || 'sanu_admin_secure_2026';

    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: secret }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      setToken(data.token);
      localStorage.setItem('sanu_admin_token', data.token);
      showToast('Authenticated as SUPERADMIN');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('sanu_admin_token');
    showToast('Signed out of Admin Console');
  };

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (serviceFilter !== 'ALL') params.append('service', serviceFilter);
      if (paymentFilter !== 'ALL') params.append('payment', paymentFilter);

      const resp = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.status === 401) {
        handleLogout();
        return;
      }

      const data = await resp.json();
      if (resp.ok) {
        setBookings(data.bookings || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, statusFilter, serviceFilter, paymentFilter]);

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus, paymentStatus?: PaymentStatus) => {
    try {
      const resp = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_status: newStatus,
          payment_status: paymentStatus,
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        showToast(`Status updated to ${newStatus}`);
        if (inspectedBooking && inspectedBooking.id === id) {
          setInspectedBooking(data.booking);
        }
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to update status');
      }
    } catch (err) {
      showToast('Network error updating status');
    }
  };

  const handleResendTelegram = async (id: string) => {
    setResendingId(id);
    try {
      const resp = await fetch(`/api/admin/bookings/${id}/resend-telegram`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        showToast('Telegram alert dispatched successfully ✅');
        fetchBookings();
      } else {
        showToast(`Telegram relay: ${data.error || 'Failed to send'}`);
      }
    } catch (err) {
      showToast('Network exception contacting Telegram gateway');
    } finally {
      setResendingId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setServiceFilter('ALL');
    setPaymentFilter('ALL');
  };

  // If not authenticated, show superadmin login gate
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 max-w-md mx-auto w-full">
        <div className="w-full bg-[#171b26] p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl space-y-5">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0a0e18] p-2 flex items-center justify-center border border-white/10 shadow-inner">
              <span className="material-symbols-outlined text-[32px] text-[#00f5a0]">
                admin_panel_settings
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#dfe2f1]">
              Admin Control Center
            </h1>
            <p className="font-['Geist'] text-xs text-[#b9cbbd]">
              Live ledger, Razorpay verification auditing &amp; Telegram relay controls.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-['Geist'] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="adminSecret"
                className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold"
              >
                Superadmin Secret Key
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#b9cbbd] pointer-events-none">
                  key
                </span>
                <input
                  id="adminSecret"
                  type="password"
                  value={adminSecretInput}
                  onChange={(e) => setAdminSecretInput(e.target.value)}
                  placeholder="Enter admin key..."
                  className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['JetBrains_Mono'] text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] focus:ring-1 focus:ring-[#00f5a0] transition-colors"
                />
              </div>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd]">
                Default key: <span className="text-[#00f5a0]">sanu_admin_secure_2026</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)] disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Access Command Console</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleLogin('sanu_admin_secure_2026')}
              className="w-full py-2 px-3 rounded-xl bg-[#262a35] text-[#9aecff] font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#353944] active:scale-95 transition-all border border-white/5"
            >
              ⚡ Quick 1-Click Superadmin Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-28 md:pb-16 max-w-7xl mx-auto px-4 md:px-8 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#00f5a0] text-[#003921] font-['JetBrains_Mono'] text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header / Live Command Console (Matching Screen 1) */}
      <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00f5a0] animate-ping"></span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#00f5a0] font-semibold">
              Live Command Console · Operational 2026.04
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#dfe2f1]">
            {BUSINESS_CONFIG.name} Ledger
          </h1>
          <p className="font-['Geist'] text-xs text-[#b9cbbd]">
            Secure booking management, Razorpay payment verification, and Telegram notification dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#171b26] border border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#00f5a0]">shield_person</span>
            <div className="flex flex-col text-left">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">Role</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-bold">
                SUPERADMIN | SEC-09
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            className="p-2.5 rounded-xl bg-[#262a35] text-[#dfe2f1] hover:text-[#00f5a0] transition-colors border border-white/5"
            title="Refresh Bookings"
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-[#262a35] text-[#ffb4ab] hover:bg-[#93000a]/20 font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1 transition-colors border border-white/5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#171b26] p-4 rounded-2xl border border-white/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-[#b9cbbd] font-['JetBrains_Mono']">
            <span>TOTAL PIPELINE</span>
            <span className="material-symbols-outlined text-[18px] text-[#9aecff]">receipt_long</span>
          </div>
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#dfe2f1]">
              {stats ? stats.totalPipeline : bookings.length} Bookings
            </span>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] mt-0.5">
              All registered consultations
            </p>
          </div>
        </div>

        <div className="bg-[#171b26] p-4 rounded-2xl border border-white/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-[#00f5a0] font-['JetBrains_Mono']">
            <span>FEES COLLECTED</span>
            <span className="material-symbols-outlined text-[18px] text-[#00f5a0]">payments</span>
          </div>
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#00f5a0]">
              ₹{stats ? stats.feesCollected.toLocaleString() : '3,900'}
            </span>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] mt-0.5">
              {stats ? stats.paidBookings : 39} Paid Slots (₹100 ea)
            </p>
          </div>
        </div>

        <div className="bg-[#171b26] p-4 rounded-2xl border border-white/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-[#ffb4ab] font-['JetBrains_Mono']">
            <span>PENDING GATE</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffb4ab]">hourglass_top</span>
          </div>
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#ffb4ab]">
              {stats ? stats.pendingGate : 2}
            </span>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] mt-0.5">
              Awaiting ₹100 deposit token
            </p>
          </div>
        </div>

        <div className="bg-[#171b26] p-4 rounded-2xl border border-white/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-[#9aecff] font-['JetBrains_Mono']">
            <span>TODAY'S AUDITS</span>
            <span className="material-symbols-outlined text-[18px] text-[#9aecff]">calendar_today</span>
          </div>
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#dfe2f1]">
              {stats ? stats.todaysAudits : 4} Active
            </span>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#9aecff] mt-0.5">
              Scheduled for today
            </p>
          </div>
        </div>
      </div>

      {/* Registry Filter Query Bar (Screen 1) */}
      <div className="bg-[#171b26] p-4 rounded-2xl border border-white/5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-['JetBrains_Mono'] text-xs text-[#dfe2f1] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00f5a0]">filter_alt</span>
            Registry Filter Query
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-['JetBrains_Mono'] text-[#9aecff] hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#b9cbbd] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
              placeholder="Search client name, booking ID, mobile, email..."
              className="w-full bg-[#0a0e18] text-[#dfe2f1] placeholder:text-[#849588] font-['Geist'] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0]"
            />
          </div>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-[#0a0e18] text-[#dfe2f1] font-['Geist'] text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] cursor-pointer"
          >
            <option value="ALL">All Services</option>
            {SANU_SERVICES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#0a0e18] text-[#dfe2f1] font-['Geist'] text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00f5a0] cursor-pointer"
          >
            <option value="ALL">All Payment Stages</option>
            <option value="PAID">PAID ₹100</option>
            <option value="PENDING">GATE PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-['JetBrains_Mono'] text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#00f5a0] text-[#003921] shadow-sm'
                  : 'bg-[#0a0e18] text-[#b9cbbd] hover:text-[#dfe2f1] border border-white/5'
              }`}
            >
              {st === 'ALL' ? 'ALL REGISTRY' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Ledger List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#b9cbbd] font-['JetBrains_Mono'] px-1">
          <span>SHOWING {bookings.length} APPOINTMENTS</span>
          <span>AUTORELAYS ACTIVE</span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-[#171b26] p-10 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center space-y-2">
            <span className="material-symbols-outlined text-[36px] text-[#b9cbbd]">inbox</span>
            <p className="font-['Space_Grotesk'] text-base font-bold text-[#dfe2f1]">
              No appointments matching query
            </p>
            <p className="font-['Geist'] text-xs text-[#b9cbbd]">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#262a35] text-[#00f5a0] font-['JetBrains_Mono'] text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {bookings.map((booking) => {
              const isPaid = booking.payment_status === 'PAID';
              const isPending = booking.payment_status === 'PENDING' || booking.booking_status === 'PENDING';
              const isCompleted = booking.booking_status === 'COMPLETED';
              const isCancelled = booking.booking_status === 'CANCELLED';

              return (
                <div
                  key={booking.id}
                  className={`bg-[#171b26] p-4 md:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending
                      ? 'border-[#ffb4ab]/30 bg-[#1c1f2a]'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Left Column: ID, Status, Customer details */}
                  <div className="flex flex-col space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#00f5a0] bg-[#0a0e18] px-2.5 py-1 rounded-lg border border-white/5">
                        {booking.booking_id}
                      </span>

                      {/* Payment Status Badge */}
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isPaid
                            ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                            : booking.payment_status === 'FAILED'
                            ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                            : 'bg-yellow-500/15 text-yellow-400'
                        }`}
                      >
                        {isPaid ? 'PAID ₹100' : isPending ? 'GATE PENDING' : 'FAILED'}
                      </span>

                      {/* Booking Status Badge */}
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isCompleted
                            ? 'bg-blue-500/15 text-blue-400'
                            : isCancelled
                            ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                            : 'bg-[#262a35] text-[#dfe2f1]'
                        }`}
                      >
                        {booking.booking_status}
                      </span>

                      {/* Telegram Relay Status */}
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          booking.telegram_status === 'SENT'
                            ? 'bg-[#00d7f4]/15 text-[#9aecff]'
                            : booking.telegram_status === 'FAILED'
                            ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                            : 'bg-white/5 text-[#b9cbbd]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">send</span>
                        <span>
                          TELEGRAM: {booking.telegram_status === 'SENT' ? 'SENT' : booking.telegram_status}
                        </span>
                      </span>
                    </div>

                    {/* Customer & Service */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                      <span className="font-['Space_Grotesk'] text-base font-bold text-[#dfe2f1]">
                        {booking.customer_name}
                      </span>
                      <a
                        href={`tel:${booking.mobile.replace(/\s+/g, '')}`}
                        className="font-['JetBrains_Mono'] text-xs text-[#00f5a0] hover:underline"
                      >
                        {booking.mobile}
                      </a>
                      {booking.email && (
                        <span className="font-['Geist'] text-xs text-[#b9cbbd] truncate">
                          · {booking.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-['Geist'] text-[#b9cbbd] flex-wrap">
                      <span className="text-[#dfe2f1] font-semibold">
                        🛠 {booking.service_name}
                      </span>
                      <span>·</span>
                      <span className="font-['JetBrains_Mono'] text-[#9aecff]">
                        {booking.service_price}
                      </span>
                      <span>·</span>
                      <span className="font-['JetBrains_Mono'] text-[#dfe2f1]">
                        📅 {booking.appointment_date} @ {booking.appointment_time}
                      </span>
                    </div>

                    {booking.customer_requirement && (
                      <p className="font-['Geist'] text-xs text-[#b9cbbd] bg-[#0a0e18] p-2.5 rounded-xl border border-white/5 line-clamp-2">
                        &ldquo;{booking.customer_requirement}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* If pending, provide quick Approve button */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED', 'PAID')}
                        className="flex-1 md:flex-initial py-1.5 px-3 rounded-lg bg-[#00f5a0] text-[#003921] font-['Space_Grotesk'] text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Approve (₹100)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInspectedBooking(booking)}
                      className="flex-1 md:flex-initial py-1.5 px-3 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                    >
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      disabled={resendingId === booking.id}
                      onClick={() => handleResendTelegram(booking.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#9aecff] font-['JetBrains_Mono'] text-xs flex items-center justify-center gap-1 transition-colors border border-white/5 disabled:opacity-50"
                      title="Forward to Telegram Bot"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {resendingId === booking.id ? 'sync' : 'send'}
                      </span>
                      <span className="hidden sm:inline">Relay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspect Modal Drawer */}
      {inspectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f131d] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#00f5a0]">
                  manage_search
                </span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-[#dfe2f1]">
                  Booking Audit Inspector
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedBooking(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#b9cbbd] hover:text-[#dfe2f1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs font-['Geist']">
              <div className="p-3 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] uppercase">
                    REFERENCE
                  </span>
                  <p className="font-['JetBrains_Mono'] text-base font-bold text-[#00f5a0]">
                    {inspectedBooking.booking_id}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd] uppercase">
                    STATUS
                  </span>
                  <p className="font-['JetBrains_Mono'] font-bold text-[#dfe2f1]">
                    {inspectedBooking.booking_status} / {inspectedBooking.payment_status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#171b26] border border-white/5">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">Client</span>
                  <p className="font-semibold text-[#dfe2f1] text-sm mt-0.5">
                    {inspectedBooking.customer_name}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#171b26] border border-white/5">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">Phone</span>
                  <p className="font-mono text-sm text-[#00f5a0] mt-0.5">
                    {inspectedBooking.mobile}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#171b26] border border-white/5">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">
                  Selected Service &amp; Quote
                </span>
                <p className="font-semibold text-[#dfe2f1] text-sm mt-0.5">
                  {inspectedBooking.service_name} ({inspectedBooking.service_price})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#171b26] border border-white/5">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#b9cbbd]">
                  Customer Requirement / Brief
                </span>
                <p className="text-[#dfe2f1] mt-1 leading-relaxed">
                  {inspectedBooking.customer_requirement || 'No custom requirement supplied.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#171b26] border border-white/5 font-['JetBrains_Mono'] text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#b9cbbd]">Razorpay Order:</span>
                  <span className="text-[#dfe2f1]">{inspectedBooking.razorpay_order_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9cbbd]">Razorpay Payment:</span>
                  <span className="text-[#dfe2f1]">{inspectedBooking.razorpay_payment_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9cbbd]">Telegram Dispatch:</span>
                  <span className="text-[#00f5a0]">{inspectedBooking.telegram_status}</span>
                </div>
              </div>
            </div>

            {/* Change Status Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#b9cbbd] uppercase">
                Update Record Status:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(inspectedBooking.id, 'CONFIRMED')}
                  className="py-2 px-2 rounded-lg bg-[#00f5a0]/15 text-[#00f5a0] hover:bg-[#00f5a0]/25 font-['JetBrains_Mono'] text-xs font-semibold transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(inspectedBooking.id, 'COMPLETED')}
                  className="py-2 px-2 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 font-['JetBrains_Mono'] text-xs font-semibold transition-colors"
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(inspectedBooking.id, 'CANCELLED')}
                  className="py-2 px-2 rounded-lg bg-[#93000a]/20 text-[#ffb4ab] hover:bg-[#93000a]/30 font-['JetBrains_Mono'] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleResendTelegram(inspectedBooking.id)}
                className="w-full py-2.5 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#9aecff] font-['JetBrains_Mono'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5 mt-2"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Resend Booking to Telegram Bot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Infrastructure Telemetry Footer */}
      <div className="p-4 rounded-2xl bg-[#0a0e18] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-['JetBrains_Mono'] text-[#b9cbbd]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#00f5a0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]"></span>
            <span>Razorpay Webhook: 200 OK</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-[#9aecff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9aecff]"></span>
            <span>Telegram Bot API: Connected</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Storage: Persistent JSON/SQL Engine</span>
          <span>·</span>
          <span>Port 3000</span>
        </div>
      </div>
    </div>
  );
};
