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

const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  throw new Error('ADMIN_SECRET is not configured.');
}

const ADMIN_EMAIL = 'admin@sanubuilds.com';

app.use(express.json());
