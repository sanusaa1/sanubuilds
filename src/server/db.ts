import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BookingRecord, BookingStatus, PaymentStatus } from '../shared/services.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../../database');
const DB_FILE = path.join(DB_DIR, 'bookings.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial seed data matching user mockup screenshots
const INITIAL_SEED_BOOKINGS: BookingRecord[] = [
  {
    id: '1',
    booking_id: 'SB-2026-849102',
    customer_name: 'Rahul Sharma',
    mobile: '+91 98765 43210',
    email: 'rahul.sharma@techfleet.in',
    service_name: 'Android App Development',
    service_price: '₹10,000 - ₹50,000',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:30 AM',
    customer_requirement: 'Jetpack Compose migration & Offline sync with room database for field logistics application.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    razorpay_order_id: 'order_Nks8921_mock',
    razorpay_payment_id: 'pay_Nks8921',
    razorpay_signature: 'hmac_sha256_verified_signature_token_849102',
    telegram_status: 'SENT',
    telegram_sent_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    booking_id: 'SB-2026-849101',
    customer_name: 'Priya Patel',
    mobile: '+91 98111 22334',
    email: 'priya@finshield.co',
    service_name: 'Application Security Service',
    service_price: '₹1,000 - ₹5,000',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '02:00 PM',
    customer_requirement: 'Threat vector analysis, SSL pinning validation & Android APK decompilation review before Play Store submission.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    razorpay_order_id: 'order_Nks8810_mock',
    razorpay_payment_id: 'pay_Nks8810',
    razorpay_signature: 'hmac_sha256_verified_signature_token_849101',
    telegram_status: 'SENT',
    telegram_sent_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    booking_id: 'SB-2026-848995',
    customer_name: 'Amit Verma',
    mobile: '+91 97222 33445',
    email: 'amit.verma@retailbazaar.com',
    service_name: 'Website to App Converter',
    service_price: '₹499',
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    customer_requirement: 'Client requested demo of Progressive Web App packaging to APK with Firebase push notifications.',
    appointment_fee: '₹100',
    payment_status: 'PENDING',
    booking_status: 'PENDING',
    razorpay_order_id: 'order_Nks7762_pending',
    telegram_status: 'NOT_SENT',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '4',
    booking_id: 'SB-2026-848920',
    customer_name: 'Dr. Sunita Rao',
    mobile: '+91 94433 11223',
    email: 'sunita@medicarelab.org',
    service_name: 'PC / Custom Software Development',
    service_price: '₹10,000 - ₹50,000',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '04:30 PM',
    customer_requirement: 'Diagnostic clinic reporting PC application with thermal printer receipt and local backup.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    razorpay_order_id: 'order_Nks6540_mock',
    razorpay_payment_id: 'pay_Nks6540',
    razorpay_signature: 'hmac_sha256_verified_signature_token_848920',
    telegram_status: 'SENT',
    telegram_sent_at: new Date(Date.now() - 18000000).toISOString(),
    created_at: new Date(Date.now() - 18000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: '5',
    booking_id: 'SB-2026-848850',
    customer_name: 'Vikram Sethi',
    mobile: '+91 98450 99887',
    email: 'vikram@hyperstore.in',
    service_name: 'Billing Software Development',
    service_price: '₹10,000 - ₹50,000',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '06:00 PM',
    customer_requirement: 'GST multi-counter retail software with barcode scanners and WhatsApp bills.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    razorpay_order_id: 'order_Nks5421_mock',
    razorpay_payment_id: 'pay_Nks5421',
    razorpay_signature: 'hmac_sha256_verified_signature_token_848850',
    telegram_status: 'SENT',
    telegram_sent_at: new Date(Date.now() - 25000000).toISOString(),
    created_at: new Date(Date.now() - 25000000).toISOString(),
    updated_at: new Date(Date.now() - 25000000).toISOString(),
  },
  {
    id: '6',
    booking_id: 'SB-2026-848710',
    customer_name: 'Karan Mehra',
    mobile: '+91 91234 56789',
    email: 'karan@appventure.co',
    service_name: 'Android App Publishing',
    service_price: '₹499',
    appointment_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    appointment_time: '11:30 AM',
    customer_requirement: 'Google Play Console 14-day closed testing setup and store listing optimization.',
    appointment_fee: '₹100',
    payment_status: 'PAID',
    booking_status: 'COMPLETED',
    razorpay_order_id: 'order_Nks4310_mock',
    razorpay_payment_id: 'pay_Nks4310',
    razorpay_signature: 'hmac_sha256_verified_signature_token_848710',
    telegram_status: 'SENT',
    telegram_sent_at: new Date(Date.now() - 90000000).toISOString(),
    created_at: new Date(Date.now() - 90000000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

class Database {
  private bookings: BookingRecord[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.bookings = JSON.parse(raw);
      } else {
        this.bookings = [...INITIAL_SEED_BOOKINGS];
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file, falling back to seed:', err);
      this.bookings = [...INITIAL_SEED_BOOKINGS];
    }
  }

  private save() {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.bookings, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public getAll(): BookingRecord[] {
    return [...this.bookings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getById(idOrBookingId: string): BookingRecord | undefined {
    return this.bookings.find(
      (b) => b.id === idOrBookingId || b.booking_id.toLowerCase() === idOrBookingId.toLowerCase()
    );
  }

  public create(
    data: Omit<BookingRecord, 'id' | 'created_at' | 'updated_at'>
  ): BookingRecord {
    const id = String(Date.now());
    const now = new Date().toISOString();
    const newRecord: BookingRecord = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    this.bookings.unshift(newRecord);
    this.save();
    return newRecord;
  }

  public update(
    bookingId: string,
    updates: Partial<BookingRecord>
  ): BookingRecord | null {
    const index = this.bookings.findIndex(
      (b) => b.booking_id === bookingId || b.id === bookingId
    );
    if (index === -1) return null;

    this.bookings[index] = {
      ...this.bookings[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.bookings[index];
  }

  public generateBookingId(): string {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `SB-${year}-${randomDigits}`;
  }

  public getStats() {
    const all = this.bookings;
    const totalPipeline = all.length;
    const paidBookings = all.filter((b) => b.payment_status === 'PAID').length;
    const pendingGate = all.filter(
      (b) => b.payment_status === 'PENDING' || b.booking_status === 'PENDING'
    ).length;
    const cancelledBookings = all.filter(
      (b) => b.booking_status === 'CANCELLED' || b.payment_status === 'FAILED'
    ).length;
    const completedBookings = all.filter((b) => b.booking_status === 'COMPLETED').length;
    const confirmedBookings = all.filter((b) => b.booking_status === 'CONFIRMED').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAudits = all.filter(
      (b) => b.appointment_date === todayStr && b.payment_status === 'PAID'
    ).length;

    const feesCollected = paidBookings * 100;

    return {
      totalPipeline,
      paidBookings,
      pendingGate,
      cancelledBookings,
      completedBookings,
      confirmedBookings,
      todaysAudits,
      feesCollected,
    };
  }
}

export const db = new Database();
