import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { BUSINESS_CONFIG } from './src/config.js';
import { SANU_SERVICES, type BookingStatus, type PaymentStatus } from './src/shared/services.js';
import { db } from './src/server/db.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  isRazorpayConfigured,
} from './src/server/razorpay.js';
import { sendTelegramBookingNotification } from './src/server/telegram.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Admin token signing secret
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sanu_admin_secure_2026';
const ADMIN_EMAIL = 'admin@sanubuilds.com';

app.use(express.json());

// Simple Auth Middleware for Admin Routes
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) {
      res.status(401).json({ error: 'Unauthorized: Malformed token' });
      return;
    }

    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadBase64)
      .digest('hex');

    if (signature !== expectedSig) {
      res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
      return;
    }

    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    if (decoded.role !== 'SUPERADMIN' || (decoded.exp && Date.now() > decoded.exp)) {
      res.status(401).json({ error: 'Unauthorized: Token expired or insufficient privileges' });
      return;
    }

    (req as any).adminUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token validation' });
  }
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// 1. App Configuration & Health
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    businessName: BUSINESS_CONFIG.name,
    phone: BUSINESS_CONFIG.phone,
    phoneDisplay: BUSINESS_CONFIG.phoneDisplay,
    email: BUSINESS_CONFIG.email,
    appointmentFee: BUSINESS_CONFIG.appointmentFeeRupees,
    appointmentFeePaise: BUSINESS_CONFIG.appointmentFeePaise,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_mode',
    isRazorpayLive: isRazorpayConfigured(),
    isTelegramConfigured: Boolean(
      process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_CHAT_ID &&
      !process.env.TELEGRAM_BOT_TOKEN.includes('YOUR_')
    ),
  });
});

// 2. Services List
app.get('/api/services', (_req: Request, res: Response) => {
  res.json({ services: SANU_SERVICES });
});

// 3. Create Razorpay Order & Initiate Booking
app.post('/api/razorpay/create-order', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      mobile,
      email,
      service_name,
      appointment_date,
      appointment_time,
      customer_requirement,
    } = req.body;

    // Strict Validation
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Full customer name is required (min 2 characters).' });
    }

    const cleanedMobile = String(mobile || '').replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    }

    if (!service_name) {
      return res.status(400).json({ error: 'Service selection is required.' });
    }

    // Match service for official price
    const matchedService = SANU_SERVICES.find(
      (s) =>
        s.name.toLowerCase() === service_name.toLowerCase() ||
        s.id.toLowerCase() === service_name.toLowerCase() ||
        s.shortName.toLowerCase() === service_name.toLowerCase()
    );
    const servicePrice = matchedService ? matchedService.price : 'Custom Quote';

    if (!appointment_date) {
      return res.status(400).json({ error: 'Appointment date is required.' });
    }

    // Date must not be in past
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointment_date < todayStr) {
      return res.status(400).json({ error: 'Appointment date cannot be in the past.' });
    }

    if (!appointment_time) {
      return res.status(400).json({ error: 'Appointment time slot is required.' });
    }

    // Generate unique booking reference: SB-2026-XXXXXX
    const bookingId = db.generateBookingId();

    // Create Razorpay Order (10000 paise = ₹100)
    const razorpayOrder = await createRazorpayOrder(bookingId);

    // Save initial PENDING booking record into database
    const booking = db.create({
      booking_id: bookingId,
      customer_name: customer_name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : undefined,
      service_name: matchedService ? matchedService.name : service_name,
      service_price: servicePrice,
      appointment_date,
      appointment_time,
      customer_requirement: customer_requirement ? customer_requirement.trim() : '',
      appointment_fee: '₹100',
      payment_status: 'PENDING',
      booking_status: 'PENDING',
      razorpay_order_id: razorpayOrder.id,
      telegram_status: 'NOT_SENT',
    });

    console.log(`[Order Created] ${bookingId} for ₹100, Razorpay Order ID: ${razorpayOrder.id}`);

    res.json({
      success: true,
      booking,
      order: razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_mode',
      amountPaise: 10000,
    });
  } catch (err: any) {
    console.error('Error in /api/razorpay/create-order:', err);
    res.status(500).json({ error: 'Failed to create appointment order. Please try again.' });
  }
});

// 4. Verify Razorpay Payment & Dispatch to Telegram
app.post('/api/razorpay/verify-payment', async (req: Request, res: Response) => {
  try {
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    const booking = db.getById(booking_id);
    if (!booking) {
      return res.status(404).json({ error: `Booking ${booking_id} not found.` });
    }

    // Idempotency: If already paid, return existing success state
    if (booking.payment_status === 'PAID') {
      return res.json({
        success: true,
        booking,
        message: 'Booking was already verified and confirmed.',
        telegram_status: booking.telegram_status,
      });
    }

    // Verify cryptographic signature on the backend
    const verification = verifyPaymentSignature(
      razorpay_order_id || booking.razorpay_order_id || '',
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verification.isValid) {
      console.warn(`[Payment Verification Failed] ${booking_id}: ${verification.reason}`);
      db.update(booking_id, {
        payment_status: 'FAILED',
        razorpay_payment_id,
        razorpay_signature,
      });
      return res.status(400).json({
        success: false,
        error: 'Razorpay payment signature verification failed.',
        reason: verification.reason,
      });
    }

    // Mark as PAID and CONFIRMED
    const updatedBooking = db.update(booking_id, {
      payment_status: 'PAID',
      booking_status: 'CONFIRMED',
      razorpay_order_id: razorpay_order_id || booking.razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!updatedBooking) {
      return res.status(500).json({ error: 'Database update failed.' });
    }

    console.log(`[Payment Verified] ${booking_id} marked as PAID. Dispatching to Telegram Bot...`);

    // Dispatch to Telegram Bot
    const telegramResult = await sendTelegramBookingNotification(updatedBooking);
    const finalBooking = db.update(booking_id, {
      telegram_status: telegramResult.success
        ? 'SENT'
        : process.env.TELEGRAM_BOT_TOKEN
        ? 'FAILED'
        : 'NOT_CONFIGURED',
      telegram_sent_at: telegramResult.success ? new Date().toISOString() : undefined,
      telegram_error: telegramResult.error,
    });

    res.json({
      success: true,
      booking: finalBooking || updatedBooking,
      telegram_status: finalBooking?.telegram_status,
      telegram_sent: telegramResult.success,
    });
  } catch (err: any) {
    console.error('Error in /api/razorpay/verify-payment:', err);
    res.status(500).json({ error: 'Internal error during payment verification.' });
  }
});

// 5. Razorpay Webhook Handler
app.post('/api/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature(bodyStr, signature)) {
      console.warn('[Razorpay Webhook] Invalid signature rejected');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payload = req.body.payload;
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId) {
        const bookings = db.getAll();
        const target = bookings.find((b) => b.razorpay_order_id === orderId);
        if (target && target.payment_status !== 'PAID') {
          db.update(target.booking_id, {
            payment_status: 'PAID',
            booking_status: 'CONFIRMED',
            razorpay_payment_id: paymentId,
          });
          const updated = db.getById(target.booking_id);
          if (updated) {
            await sendTelegramBookingNotification(updated);
          }
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// 6. Get Single Booking Record by ID
app.get('/api/bookings/:id', (req: Request, res: Response) => {
  const booking = db.getById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  res.json({ booking });
});

// -------------------------------------------------------------
// SECURE ADMIN ENDPOINTS
// -------------------------------------------------------------

// 7. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const validPassword = ADMIN_SECRET;
  const isEmailMatch = !email || email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (isEmailMatch && password === validPassword) {
    // Generate secure HMAC-signed JWT token
    const payload = {
      email: ADMIN_EMAIL,
      role: 'SUPERADMIN',
      iat: Date.now(),
      exp: Date.now() + 86400000 * 7, // 7 days
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadBase64)
      .digest('hex');

    const token = `${payloadBase64}.${signature}`;

    return res.json({
      success: true,
      token,
      admin: {
        email: ADMIN_EMAIL,
        role: 'SUPERADMIN',
        authStatus: 'Active',
      },
    });
  }

  res.status(401).json({ error: 'Invalid admin credentials' });
});

// 8. Admin Get Bookings with Search & Filters
app.get('/api/admin/bookings', requireAdminAuth, (req: Request, res: Response) => {
  try {
    let list = db.getAll();
    const stats = db.getStats();

    const { search, status, service, payment, date } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(q) ||
          b.booking_id.toLowerCase().includes(q) ||
          b.mobile.toLowerCase().includes(q) ||
          (b.email && b.email.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'ALL') {
      list = list.filter((b) => b.booking_status === status);
    }

    if (payment && payment !== 'ALL') {
      list = list.filter((b) => b.payment_status === payment);
    }

    if (service && service !== 'ALL') {
      list = list.filter((b) =>
        b.service_name.toLowerCase().includes(String(service).toLowerCase())
      );
    }

    if (date && typeof date === 'string') {
      list = list.filter((b) => b.appointment_date === date);
    }

    res.json({
      bookings: list,
      stats,
    });
  } catch (err) {
    console.error('Error fetching admin bookings:', err);
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// 9. Admin Update Booking Status
app.patch('/api/admin/bookings/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { booking_status, payment_status } = req.body;

  const validStatuses: BookingStatus[] = ['PENDING', 'PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const validPaymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED'];

  const updates: Partial<{ booking_status: BookingStatus; payment_status: PaymentStatus }> = {};

  if (booking_status && validStatuses.includes(booking_status)) {
    updates.booking_status = booking_status;
  }
  if (payment_status && validPaymentStatuses.includes(payment_status)) {
    updates.payment_status = payment_status;
  }

  const updated = db.update(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Booking record not found' });
  }

  res.json({ success: true, booking: updated });
});

// 10. Admin Resend / Forward to Telegram
app.post('/api/admin/bookings/:id/resend-telegram', requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = db.getById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking record not found' });
  }

  const result = await sendTelegramBookingNotification(booking);
  const updated = db.update(booking.booking_id, {
    telegram_status: result.success ? 'SENT' : 'FAILED',
    telegram_sent_at: result.success ? new Date().toISOString() : booking.telegram_sent_at,
    telegram_error: result.error,
  });

  res.json({
    success: result.success,
    telegram_status: updated?.telegram_status,
    error: result.error,
    booking: updated,
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sanu Builds Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
