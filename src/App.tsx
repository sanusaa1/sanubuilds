import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { MobileNav } from './components/MobileNav.js';
import { HomeView } from './views/HomeView.js';
import { ServicesView } from './views/ServicesView.js';
import { BookingView } from './views/BookingView.js';
import { SuccessView } from './views/SuccessView.js';
import { FailureView } from './views/FailureView.js';
import { AdminView } from './views/AdminView.js';
import { SANU_SERVICES, type ServiceItem, type BookingRecord } from './shared/services.js';
import { BUSINESS_CONFIG } from './config.js';

export function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'services' | 'book' | 'admin' | 'success' | 'failure'
  >('home');

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    return SANU_SERVICES[0];
  });

  const [lastBooking, setLastBooking] = useState<BookingRecord | null>(null);
  const [failureError, setFailureError] = useState<string>('');

  // Scroll to top whenever tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleBookService = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentTab('book');
  };

  const handleBookingSuccess = (booking: BookingRecord) => {
    setLastBooking(booking);
    setCurrentTab('success');
  };

  const handleBookingFailure = (errorReason: string, booking?: BookingRecord) => {
    setFailureError(errorReason);
    if (booking) {
      setLastBooking(booking);
    }
    setCurrentTab('failure');
  };

  return (
    <div className="min-h-screen bg-[#0f131d] text-[#dfe2f1] flex flex-col font-['Geist'] selection:bg-[#00f5a0] selection:text-[#003921]">
      {/* Top Fixed Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        subtitle={
          currentTab === 'admin'
            ? 'Command Console'
            : currentTab === 'book'
            ? 'Appointment Portal'
            : currentTab === 'services'
            ? 'Directory'
            : 'Engineering & Security'
        }
      />

      {/* Main View Container */}
      <main className="flex-1 w-full pt-16 md:pt-20">
        {currentTab === 'home' && (
          <HomeView
            onSelectService={handleSelectService}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView
            selectedService={selectedService}
            onSelectService={handleSelectService}
            onBookService={handleBookService}
          />
        )}

        {currentTab === 'book' && (
          <BookingView
            selectedService={selectedService}
            onSelectService={handleSelectService}
            onNavigateTab={setCurrentTab}
            onBookingSuccess={handleBookingSuccess}
            onBookingFailure={handleBookingFailure}
          />
        )}

        {currentTab === 'success' && (
          <SuccessView
            booking={lastBooking}
            onNavigateTab={setCurrentTab}
            onSwitchToFailure={() => setCurrentTab('failure')}
          />
        )}

        {currentTab === 'failure' && (
          <FailureView
            errorReason={failureError}
            booking={lastBooking}
            onRetryPayment={() => setCurrentTab('book')}
            onNavigateTab={setCurrentTab}
            onSwitchToSuccess={() => setCurrentTab('success')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView onNavigateTab={setCurrentTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0a0e18] border-t border-white/5 py-10 px-4 md:px-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex flex-col space-y-3 max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src={BUSINESS_CONFIG.logoUrl}
                alt="Sanu Builds"
                className="h-7 w-auto object-contain"
              />
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#dfe2f1]">
                {BUSINESS_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-[#b9cbbd] leading-relaxed">
              {BUSINESS_CONFIG.description}
            </p>
            <div className="text-xs font-['JetBrains_Mono'] text-[#00f5a0]">
              Direct Line:{' '}
              <a href={BUSINESS_CONFIG.telLink} className="underline font-bold">
                {BUSINESS_CONFIG.phoneDisplay}
              </a>
            </div>
          </div>

          {/* Service Links */}
          <div className="flex flex-col space-y-2">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#9aecff] font-semibold">
              Core Capabilities
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#b9cbbd]">
              {SANU_SERVICES.slice(0, 6).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleBookService(service)}
                  className="text-left hover:text-[#00f5a0] transition-colors"
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Access */}
          <div className="flex flex-col space-y-2">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#00f5a0] font-semibold">
              Portals
            </span>
            <div className="flex flex-col space-y-1.5 text-xs text-[#b9cbbd]">
              <button
                type="button"
                onClick={() => setCurrentTab('home')}
                className="text-left hover:text-[#dfe2f1] transition-colors"
              >
                Home Overview
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('services')}
                className="text-left hover:text-[#dfe2f1] transition-colors"
              >
                Services &amp; Pricing Directory
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('book')}
                className="text-left text-[#00f5a0] font-semibold hover:underline"
              >
                Book Appointment (₹100 Fee)
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="text-left hover:text-[#dfe2f1] transition-colors"
              >
                Admin Control Center
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#b9cbbd] font-['JetBrains_Mono']">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved.</p>
          <p className="text-[11px] text-[#849588]">
            ₹100 Appointment Fee Protocol · Razorpay Verified Gateway · Telegram Webhook Sync
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation & Call FAB */}
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
