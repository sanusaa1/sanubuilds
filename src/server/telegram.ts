import type { BookingRecord } from '../shared/services.js';

export async function sendTelegramBookingNotification(
  booking: BookingRecord
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN' || chatId === 'YOUR_TELEGRAM_CHAT_ID') {
    console.log(
      '[Telegram Relay] Bot credentials not configured in environment variables. Recording status NOT_CONFIGURED.'
    );
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env',
    };
  }

  // Exact message format requested by the user
  const message = `🔔 NEW APPOINTMENT

🏢 Business: Sanu Builds

👤 Customer Name:
${booking.customer_name}

📱 Mobile:
${booking.mobile}

📧 Email:
${booking.email || 'Not provided'}

🛠 Service:
${booking.service_name}

💰 Service Price:
${booking.service_price}

💳 Appointment Fee:
₹100

✅ Payment Status:
PAID

📦 Razorpay Order ID:
${booking.razorpay_order_id || 'N/A'}

💳 Razorpay Payment ID:
${booking.razorpay_payment_id || 'N/A'}

📅 Appointment Date:
${booking.appointment_date}

⏰ Appointment Time:
${booking.appointment_time}

📝 Customer Requirement:
${booking.customer_requirement || 'None specified'}

🔖 Booking ID:
${booking.booking_id}`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = (await response.json()) as { ok: boolean; description?: string };
    if (!response.ok || !data.ok) {
      console.error('[Telegram Relay] Error response from Telegram API:', data);
      return {
        success: false,
        error: data.description || `HTTP ${response.status}`,
      };
    }

    console.log(`[Telegram Relay] Notification dispatched successfully for ${booking.booking_id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Telegram Relay] Network error calling Telegram:', err);
    return {
      success: false,
      error: err?.message || 'Network exception calling Telegram API',
    };
  }
}
