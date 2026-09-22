export interface ServiceItem {
  id: string;
  name: string;
  shortName: string;
  category: 'mobile' | 'software' | 'web' | 'security';
  price: string;
  priceNote?: string;
  badge: string;
  tagline: string;
  description: string;
  icon: string; // Material symbols icon
  features: string[];
}

export const SANU_SERVICES: ServiceItem[] = [
  {
    id: 'android-app-development',
    name: 'Android App Development',
    shortName: 'Android App Dev',
    category: 'mobile',
    price: '₹10,000 - ₹50,000',
    badge: 'Flagship',
    tagline: 'Native Android SDK & High-Performance Builds',
    description:
      'Professional Android application development based on customer requirements, business needs and required features.',
    icon: 'android',
    features: [
      'Modern Jetpack Compose & Kotlin architecture',
      'Offline-first synchronization & local SQLite caching',
      'REST & GraphQL API integration',
      'Optimized memory footprint & low battery draw',
    ],
  },
  {
    id: 'pc-software-development',
    name: 'PC / Custom Software Development',
    shortName: 'PC / Custom Software Dev',
    category: 'software',
    price: '₹10,000 - ₹50,000',
    badge: 'Bespoke',
    tagline: 'Desktop Architecture for Windows, macOS & Linux',
    description:
      'Custom desktop and PC software development for businesses, shops, organizations and individuals.',
    icon: 'desktop_windows',
    features: [
      'High-speed desktop execution engines',
      'Inventory, billing, and accounting integration',
      'Local database encryption & backup utilities',
      'Multi-user networking & license controls',
    ],
  },
  {
    id: 'website-design-development',
    name: 'Website Design & Development',
    shortName: 'Website Design & Dev',
    category: 'web',
    price: 'Contact for pricing',
    badge: 'Custom Scope',
    tagline: 'Modern, Fast, Scalable Web Applications',
    description:
      'Modern, responsive and user-friendly website design and development for businesses, shops, startups and individuals.',
    icon: 'language',
    features: [
      'Responsive on Android, iPhone, tablet & desktop',
      'Speed-optimized with 95+ Google Lighthouse scores',
      'SEO meta architecture, OpenGraph & schema tags',
      'Content management & lead capture pipelines',
    ],
  },
  {
    id: 'android-app-publishing',
    name: 'Android App Publishing',
    shortName: 'Android App Publishing',
    category: 'mobile',
    price: '₹499',
    badge: 'Fast Track',
    tagline: 'Google Play Store Console Guidance',
    description:
      'Android app publishing/listing assistance including basic app information, listing setup and submission assistance.',
    icon: 'cloud_upload',
    features: [
      'Google Play Console listing creation assistance',
      'Target SDK 34/35 compliance checklist',
      'Privacy policy setup & store graphics requirements',
      '20-tester closed testing guidance',
    ],
  },
  {
    id: 'website-to-app-converter',
    name: 'Website to App Converter',
    shortName: 'Website to App Converter',
    category: 'web',
    price: '₹499',
    badge: 'Turnkey',
    tagline: 'Instant Android APK / AAB from Any URL',
    description:
      'Convert an existing website into an Android application with a suitable mobile app interface.',
    icon: 'transform',
    features: [
      'Full-screen mobile app shell with splash screen',
      'Pull-to-refresh & offline network fallback',
      'Push notification bridge ready',
      'Signed APK ready for distribution within 24 hours',
    ],
  },
  {
    id: 'billing-software-development',
    name: 'Billing Software Development',
    shortName: 'Billing Software Dev',
    category: 'software',
    price: '₹10,000 - ₹50,000',
    badge: 'Retail & POS',
    tagline: 'Point-of-Sale, GST Billing & Invoicing',
    description:
      'Billing and business management software designed according to customer requirements.',
    icon: 'point_of_sale',
    features: [
      'GST invoice generation & thermal printer support',
      'Barcode scanner and cash drawer integration',
      'Daily sales reports & stock tracking',
      'WhatsApp invoice sharing capability',
    ],
  },
  {
    id: 'application-security-service',
    name: 'Application Security Service',
    shortName: 'Application Security',
    category: 'security',
    price: '₹1,000 - ₹5,000',
    badge: 'Audit & VAPT',
    tagline: 'Android APK Hardening & Vulnerability Remediation',
    description:
      'Application security service focused on improving Android application security, identifying common security weaknesses and applying suitable security improvements.',
    icon: 'shield',
    features: [
      'Decompilation resistance & ProGuard/R8 obfuscation',
      'SSL pinning & insecure network transmission audit',
      'Root detection & emulator anti-tamper measures',
      'Detailed vulnerability remediation report',
    ],
  },
  {
    id: 'custom-software-installation',
    name: 'Custom Software Installation',
    shortName: 'Custom Software Install',
    category: 'software',
    price: '₹10,000 - ₹25,000',
    badge: 'On-Prem/Cloud',
    tagline: 'DevOps, Environment Setup & Deployment',
    description:
      'Custom software installation and setup service according to customer requirements and software environment.',
    icon: 'dns',
    features: [
      'Server configuration & database initialization',
      'Domain mapping, SSL certificates & firewall setup',
      'Automated backup cron schedules',
      'Post-installation verification & staff walkthrough',
    ],
  },
];

export const AVAILABLE_TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
];

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type BookingStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type TelegramStatus = 'NOT_SENT' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export interface BookingRecord {
  id: string;
  booking_id: string;
  customer_name: string;
  mobile: string;
  email?: string;
  service_name: string;
  service_price: string;
  appointment_date: string;
  appointment_time: string;
  customer_requirement?: string;
  appointment_fee: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  telegram_status: TelegramStatus;
  telegram_sent_at?: string;
  telegram_error?: string;
  created_at: string;
  updated_at: string;
}
