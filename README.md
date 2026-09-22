# Sanu Builds - Professional Software & App Development Booking Platform

A modern, responsive, full-stack service booking and payment platform built for **Sanu Builds** (Software, Android App, Website, and Application Security Services).

---

## 🎯 Main Goal & Features

- **Services Directory**: Browse 8 official services with exact transparent pricing and feature specifications.
- **Service Selection**: One-click service selection that pre-fills and customizes the appointment booking workflow.
- **₹100 Appointment Booking Protocol**: Customers pay a ₹100 appointment booking fee via Razorpay to confirm their appointment. A clear disclaimer explains that the ₹100 is an appointment booking deposit, not the full service price, and is 100% credited against the initial project milestone.
- **Server-Side Security**: Razorpay orders are generated on the backend (`10000` paise = ₹100). Razorpay payment signatures (`HMAC-SHA256`) are verified server-side before marking any appointment as `PAID`.
- **Automatic Telegram Bot Dispatch**: Immediately upon verified payment, complete booking details are formatted and dispatched to the Sanu Builds Telegram Bot.
- **Admin Control Center**: Secure Superadmin portal with live KPI metrics, search queries, status filters, status lifecycle management (Confirmed, Completed, Cancelled), and Telegram forward/retry capability.
- **Responsive Design**: Built for mobile (Android/iOS), tablets, and desktop computers with safe-area paddings and single-touch call triggers (`tel:+919876543210`).

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Material Symbols Outlined, Google Fonts (Space Grotesk, Geist, JetBrains Mono).
- **Backend**: Node.js, Express, TypeScript (`tsx`).
- **Payment Gateway**: Razorpay Checkout with server-side HMAC-SHA256 signature verification and webhook handlers.
- **Messaging Relay**: Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/sendMessage`).
- **Database**: Persistent ACID file-backed JSON engine (`database/bookings.json`) with an included PostgreSQL / SQLite schema (`database/schema.sql`).

---

## 📋 Official Service Pricing

| Service Name | Price Range / Estimate | Type |
|---|---|---|
| **Android App Development** | ₹10,000 - ₹50,000 | Native Kotlin / Jetpack Compose |
| **PC / Custom Software Development** | ₹10,000 - ₹50,000 | Desktop & POS Solutions |
| **Website Design & Development** | Contact for pricing | Responsive Web Applications |
| **Android App Publishing** | ₹499 | Google Play Console Submission |
| **Website to App Converter** | ₹499 | Web-to-APK / PWA Shell |
| **Billing Software Development** | ₹10,000 - ₹50,000 | GST Billing, Retail POS & WhatsApp |
| **Application Security Service** | ₹1,000 - ₹5,000 | APK Hardening, VAPT & SSL Pinning |
| **Custom Software Installation** | ₹10,000 - ₹25,000 | DevOps & On-Premises Deployment |

*Appointment Booking Fee: ₹100 (credited towards project balance).*

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env` and configure your credentials:

```bash
# Business Contact
BUSINESS_PHONE="+919876543210"
ADMIN_SECRET="sanu_admin_secure_2026"

# Razorpay Payment Gateway (Test or Live)
# Get from: https://dashboard.razorpay.com/#/app/keys
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"

# Telegram Bot Integration
# 1. Create bot with @BotFather to get TOKEN
# 2. Retrieve your numeric ID with @userinfobot to get CHAT_ID
TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
TELEGRAM_CHAT_ID="987654321"

# Database Path
DATABASE_URL="file:./database/appointments.db"
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (version 18+ or 20+ recommended)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000` with the Express API and Vite live frontend mounted together.

---

## 💳 Razorpay Setup Instructions

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings > API Keys**.
3. Click **Generate Test Key** (or Live Key for production).
4. Copy the `Key Id` and `Key Secret`.
5. Add them to your `.env`:
   ```bash
   RAZORPAY_KEY_ID="rzp_test_xxxxxxxxx"
   RAZORPAY_KEY_SECRET="yyyyyyyyyyyyyyyyyy"
   ```
6. **Webhooks Setup (Optional for automatic capture)**:
   - Go to **Settings > Webhooks > Add New Webhook**.
   - Set Webhook URL to: `https://your-domain.com/api/razorpay/webhook`
   - Secret: enter a secret string and put it into `RAZORPAY_WEBHOOK_SECRET`.
   - Select events: `payment.captured`, `order.paid`.

---

## 🤖 Telegram Bot Setup Instructions

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a bot name and username (e.g. `SanuBuildsAlertsBot`).
3. BotFather will provide an HTTP API token (e.g. `7123456789:AAEj-kL0...`). Put this in `TELEGRAM_BOT_TOKEN`.
4. To get your personal chat ID or your channel/group ID:
   - For personal alerts: Search for `@userinfobot` on Telegram and send `/start`. It will return your numeric `Id` (e.g. `612345678`). Put this in `TELEGRAM_CHAT_ID`.
   - For groups: Add the bot to your group and send a message. Then open `https://api.telegram.org/bot<TOKEN>/getUpdates` in your browser to find the `"chat":{"id": -xxxxxxxxx}`.
5. Send `/start` to your new bot once so Telegram allows the bot to message you.

### Telegram Notification Message Format
```
🔔 NEW APPOINTMENT

🏢 Business: Sanu Builds

👤 Customer Name:
{customer_name}

📱 Mobile:
{mobile}

📧 Email:
{email}

🛠 Service:
{service_name}

💰 Service Price:
{service_price}

💳 Appointment Fee:
₹100

✅ Payment Status:
PAID

📦 Razorpay Order ID:
{order_id}

💳 Razorpay Payment ID:
{payment_id}

📅 Appointment Date:
{appointment_date}

⏰ Appointment Time:
{appointment_time}

📝 Customer Requirement:
{customer_requirement}

🔖 Booking ID:
{booking_id}
```

---

## 🗄 Database Setup Instructions

- **Local Embedded Storage**: Out of the box, appointments are saved persistently in `database/bookings.json` with transactional atomic file writing. No additional DB server installation is required.
- **Relational SQL Database (PostgreSQL / MySQL / SQLite)**:
  - Run the SQL DDL statements located in `database/schema.sql`.
  - The schema creates the `appointments` table with indexing on `booking_id`, `payment_status`, and `appointment_date`.

---

## 🔐 Admin Portal Access

- Navigate to the **Admin** tab or access `/api/admin/bookings`.
- Enter the admin secret key: `sanu_admin_secure_2026` (or the custom value configured in `ADMIN_SECRET`).
- The portal gives full control to inspect, confirm, complete, or cancel bookings, as well as manually retry Telegram notifications.

---

## 🚢 Production Deployment

```bash
# Build the production frontend assets
npm run build

# Start the full-stack server
npm run start
```
The server will bind to `0.0.0.0:3000` or the port specified in `process.env.PORT`.
