import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import { BUSINESS_CONFIG } from './src/config.js';
import {
  SANU_SERVICES,
  type BookingStatus,
  type PaymentStatus,
} from './src/shared/services.js';

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

const PORT = Number(process.env.PORT) || 3000;

const app = express();

// -------------------------------------------------------------
// ADMIN CONFIG
// -------------------------------------------------------------

const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  throw new Error(
    'ADMIN_SECRET is not configured. Add ADMIN_SECRET in Vercel Environment Variables.'
  );
}

const ADMIN_EMAIL = 'admin@sanubuilds.com';

// -------------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------------

app.use(express.json({ limit: '1mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});

// -------------------------------------------------------------
// ADMIN AUTH MIDDLEWARE
// -------------------------------------------------------------

function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid token',
    });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const [payloadBase64, signature] = token.split('.');

    if (!payloadBase64 || !signature) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Malformed token',
      });
      return;
    }

    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadBase64)
      .digest('hex');

    if (signature !== expectedSig) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token signature',
      });
      return;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8')
    );

    if (
      decoded.role !== 'SUPERADMIN' ||
      (decoded.exp && Date.now() > decoded.exp)
    ) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Token expired or insufficient privileges',
      });
      return;
    }

    (req as any).adminUser = decoded;

    next();
  } catch (error) {
    console.error('Admin auth validation error:', error);

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token validation',
    });
  }
}

// -------------------------------------------------------------
// PUBLIC API
// -------------------------------------------------------------

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    businessName: BUSINESS_CONFIG.name,
    phone: BUSINESS_CONFIG.phone,
    phoneDisplay: BUSINESS_CONFIG.phoneDisplay,
    email: BUSINESS_CONFIG.email,
    appointmentFee: BUSINESS_CONFIG.appointmentFeeRupees,
    appointmentFeePaise: BUSINESS_CONFIG.appointmentFeePaise,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    isRazorpayLive: isRazorpayConfigured(),
    isTelegramConfigured: Boolean(
      process.env.TELEGRAM_BOT_TOKEN &&
        process.env.TELEGRAM_CHAT_ID &&
        !process.env.TELEGRAM_BOT_TOKEN.includes('YOUR_')
    ),
  });
});

app.get('/api/services', (_req: Request, res: Response) => {
  res.json({
    success: true,
    services: SANU_SERVICES,
  });
});

// -------------------------------------------------------------
// RAZORPAY CREATE ORDER
// -------------------------------------------------------------

app.post(
  '/api/razorpay/create-order',
  async (req: Request, res: Response) => {
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

      if (
        !customer_name ||
        typeof customer_name !== 'string' ||
        customer_name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          error: 'Full customer name is required (min 2 characters).',
        });
      }

      const cleanedMobile = String(mobile || '').replace(/\D/g, '');

      if (cleanedMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          error: 'Valid 10-digit mobile number is required.',
        });
      }

      if (!service_name || typeof service_name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Service selection is required.',
        });
      }

      const matchedService = SANU_SERVICES.find(
        (service) =>
          service.name.toLowerCase() === service_name.toLowerCase() ||
          service.id.toLowerCase() === service_name.toLowerCase() ||
          service.shortName.toLowerCase() === service_name.toLowerCase()
      );

      const servicePrice = matchedService
        ? matchedService.price
        : 'Custom Quote';

      if (!appointment_date) {
        return res.status(400).json({
          success: false,
          error: 'Appointment date is required.',
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];

      if (appointment_date < todayStr) {
        return res.status(400).json({
          success: false,
          error: 'Appointment date cannot be in the past.',
        });
      }

      if (!appointment_time) {
        return res.status(400).json({
          success: false,
          error: 'Appointment time slot is required.',
        });
      }

      if (!isRazorpayConfigured()) {
        return res.status(503).json({
          success: false,
          error:
            'Razorpay is not configured. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel.',
        });
      }

      const bookingId = db.generateBookingId();

      const razorpayOrder = await createRazorpayOrder(bookingId);

      const booking = db.create({
        booking_id: bookingId,
        customer_name: customer_name.trim(),
        mobile: `+91 ${cleanedMobile}`,
        email:
          typeof email === 'string' && email.trim()
            ? email.trim()
            : undefined,
        service_name: matchedService
          ? matchedService.name
          : service_name.trim(),
        service_price: servicePrice,
        appointment_date,
        appointment_time,
        customer_requirement:
          typeof customer_requirement === 'string'
            ? customer_requirement.trim()
            : '',
        appointment_fee: '₹100',
        payment_status: 'PENDING',
        booking_status: 'PENDING',
        razorpay_order_id: razorpayOrder.id,
        telegram_status: 'NOT_SENT',
      });

      console.log(
        `[Order Created] ${bookingId} | Razorpay Order: ${razorpayOrder.id}`
      );

      return res.json({
        success: true,
        booking,
        order: razorpayOrder,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amountPaise: 10000,
      });
    } catch (error: any) {
      console.error(
        'Error in /api/razorpay/create-order:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          'Failed to create appointment order. Please try again.',
      });
    }
  }
);

// -------------------------------------------------------------
// RAZORPAY VERIFY PAYMENT
// -------------------------------------------------------------

app.post(
  '/api/razorpay/verify-payment',
  async (req: Request, res: Response) => {
    try {
      const {
        booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (!booking_id) {
        return res.status(400).json({
          success: false,
          error: 'booking_id is required',
        });
      }

      const booking = db.getById(booking_id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: `Booking ${booking_id} not found.`,
        });
      }

      if (booking.payment_status === 'PAID') {
        return res.json({
          success: true,
          booking,
          message: 'Booking was already verified and confirmed.',
          telegram_status: booking.telegram_status,
        });
      }

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          error: 'Incomplete Razorpay payment verification data.',
        });
      }

      const verification = verifyPaymentSignature(
        razorpay_order_id || booking.razorpay_order_id || '',
        razorpay_payment_id,
        razorpay_signature
      );

      if (!verification.isValid) {
        console.warn(
          `[Payment Verification Failed] ${booking_id}: ${verification.reason}`
        );

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

      const updatedBooking = db.update(booking_id, {
        payment_status: 'PAID',
        booking_status: 'CONFIRMED',
        razorpay_order_id:
          razorpay_order_id || booking.razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!updatedBooking) {
        return res.status(500).json({
          success: false,
          error: 'Database update failed.',
        });
      }

      console.log(
        `[Payment Verified] ${booking_id} marked as PAID.`
      );

      const telegramResult =
        await sendTelegramBookingNotification(updatedBooking);

      const finalBooking = db.update(booking_id, {
        telegram_status: telegramResult.success
          ? 'SENT'
          : process.env.TELEGRAM_BOT_TOKEN
          ? 'FAILED'
          : 'NOT_CONFIGURED',
        telegram_sent_at: telegramResult.success
          ? new Date().toISOString()
          : undefined,
        telegram_error: telegramResult.error,
      });

      return res.json({
        success: true,
        booking: finalBooking || updatedBooking,
        telegram_status: finalBooking?.telegram_status,
        telegram_sent: telegramResult.success,
      });
    } catch (error) {
      console.error(
        'Error in /api/razorpay/verify-payment:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Internal error during payment verification.',
      });
    }
  }
);

// -------------------------------------------------------------
// RAZORPAY WEBHOOK
// -------------------------------------------------------------

app.post(
  '/api/razorpay/webhook',
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers[
        'x-razorpay-signature'
      ] as string;

      const bodyStr = JSON.stringify(req.body);

      if (
        signature &&
        !verifyWebhookSignature(bodyStr, signature)
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid webhook signature',
        });
      }

      const event = req.body?.event;

      console.log(
        `[Razorpay Webhook Received] Event: ${event}`
      );

      if (
        event === 'payment.captured' ||
        event === 'order.paid'
      ) {
        const payload = req.body?.payload;
        const payment = payload?.payment?.entity;

        const orderId = payment?.order_id;
        const paymentId = payment?.id;

        if (orderId) {
          const bookings = db.getAll();

          const target = bookings.find(
            (booking) =>
              booking.razorpay_order_id === orderId
          );

          if (
            target &&
            target.payment_status !== 'PAID'
          ) {
            db.update(target.booking_id, {
              payment_status: 'PAID',
              booking_status: 'CONFIRMED',
              razorpay_payment_id: paymentId,
            });

            const updated = db.getById(
              target.booking_id
            );

            if (updated) {
              await sendTelegramBookingNotification(
                updated
              );
            }
          }
        }
      }

      return res.json({
        success: true,
        status: 'ok',
      });
    } catch (error) {
      console.error(
        'Error handling webhook:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Webhook processing error',
      });
    }
  }
);

// -------------------------------------------------------------
// GET BOOKING
// -------------------------------------------------------------

app.get(
  '/api/bookings/:id',
  (req: Request, res: Response) => {
    const booking = db.getById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found.',
      });
    }

    return res.json({
      success: true,
      booking,
    });
  }
);

// -------------------------------------------------------------
// ADMIN LOGIN
// -------------------------------------------------------------

app.post(
  '/api/admin/login',
  (req: Request, res: Response) => {
    const { email, password } = req.body;

    const isEmailMatch =
      !email ||
      String(email).trim().toLowerCase() ===
        ADMIN_EMAIL.toLowerCase();

    if (
      isEmailMatch &&
      password === ADMIN_SECRET
    ) {
      const payload = {
        email: ADMIN_EMAIL,
        role: 'SUPERADMIN',
        iat: Date.now(),
        exp: Date.now() + 86400000 * 7,
      };

      const payloadBase64 = Buffer.from(
        JSON.stringify(payload)
      ).toString('base64');

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

    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials',
    });
  }
);

// -------------------------------------------------------------
// ADMIN BOOKINGS
// -------------------------------------------------------------

app.get(
  '/api/admin/bookings',
  requireAdminAuth,
  (req: Request, res: Response) => {
    try {
      let list = db.getAll();

      const stats = db.getStats();

      const {
        search,
        status,
        service,
        payment,
        date,
      } = req.query;

      if (
        search &&
        typeof search === 'string'
      ) {
        const q = search.toLowerCase().trim();

        list = list.filter(
          (booking) =>
            booking.customer_name
              .toLowerCase()
              .includes(q) ||
            booking.booking_id
              .toLowerCase()
              .includes(q) ||
            booking.mobile
              .toLowerCase()
              .includes(q) ||
            Boolean(
              booking.email &&
                booking.email
                  .toLowerCase()
                  .includes(q)
            )
        );
      }

      if (
        status &&
        status !== 'ALL'
      ) {
        list = list.filter(
          (booking) =>
            booking.booking_status === status
        );
      }

      if (
        payment &&
        payment !== 'ALL'
      ) {
        list = list.filter(
          (booking) =>
            booking.payment_status === payment
        );
      }

      if (
        service &&
        service !== 'ALL'
      ) {
        list = list.filter((booking) =>
          booking.service_name
            .toLowerCase()
            .includes(
              String(service).toLowerCase()
            )
        );
      }

      if (
        date &&
        typeof date === 'string'
      ) {
        list = list.filter(
          (booking) =>
            booking.appointment_date === date
        );
      }

      return res.json({
        success: true,
        bookings: list,
        stats,
      });
    } catch (error) {
      console.error(
        'Error fetching admin bookings:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve bookings.',
      });
    }
  }
);

// -------------------------------------------------------------
// ADMIN UPDATE STATUS
// -------------------------------------------------------------

app.patch(
  '/api/admin/bookings/:id/status',
  requireAdminAuth,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      booking_status,
      payment_status,
    } = req.body;

    const validStatuses: BookingStatus[] = [
      'PENDING',
      'PAID',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
    ];

    const validPaymentStatuses: PaymentStatus[] = [
      'PENDING',
      'PAID',
      'FAILED',
    ];

    const updates: Partial<{
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    }> = {};

    if (
      booking_status &&
      validStatuses.includes(booking_status)
    ) {
      updates.booking_status = booking_status;
    }

    if (
      payment_status &&
      validPaymentStatuses.includes(payment_status)
    ) {
      updates.payment_status = payment_status;
    }

    const updated = db.update(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Booking record not found',
      });
    }

    return res.json({
      success: true,
      booking: updated,
    });
  }
);

// -------------------------------------------------------------
// ADMIN RESEND TELEGRAM
// -------------------------------------------------------------

app.post(
  '/api/admin/bookings/:id/resend-telegram',
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const booking = db.getById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking record not found',
        });
      }

      const result =
        await sendTelegramBookingNotification(
          booking
        );

      const updated = db.update(
        booking.booking_id,
        {
          telegram_status: result.success
            ? 'SENT'
            : 'FAILED',
          telegram_sent_at: result.success
            ? new Date().toISOString()
            : booking.telegram_sent_at,
          telegram_error: result.error,
        }
      );

      return res.json({
        success: result.success,
        telegram_status:
          updated?.telegram_status,
        error: result.error,
        booking: updated,
      });
    } catch (error) {
      console.error(
        'Error resending Telegram notification:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to resend Telegram notification.',
      });
    }
  }
);

// -------------------------------------------------------------
// VERCEL EXPORT
// -------------------------------------------------------------

export { app };

// -------------------------------------------------------------
// LOCAL DEVELOPMENT ONLY
// -------------------------------------------------------------

if (!process.env.VERCEL) {
  const startServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } =
        await import('vite');

      const vite = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(
        __dirname,
        'dist'
      );

      app.use(express.static(distPath));

      app.get(
        '*',
        (_req: Request, res: Response) => {
          res.sendFile(
            path.join(distPath, 'index.html')
          );
        }
      );
    }

    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `[Sanu Builds Server] Running on http://localhost:${PORT}`
        );
      }
    );
  };

  startServer().catch((error) => {
    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);
  });
}
