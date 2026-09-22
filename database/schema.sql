-- Sanu Builds Database Schema
-- Compatible with PostgreSQL, SQLite, and MySQL

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  service_name VARCHAR(255) NOT NULL,
  service_price VARCHAR(100) NOT NULL,
  appointment_date VARCHAR(50) NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  customer_requirement TEXT,
  appointment_fee VARCHAR(20) DEFAULT '₹100',
  payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED
  booking_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, CONFIRMED, COMPLETED, CANCELLED
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature TEXT,
  telegram_status VARCHAR(50) DEFAULT 'NOT_SENT', -- NOT_SENT, SENT, FAILED, NOT_CONFIGURED
  telegram_sent_at TIMESTAMP,
  telegram_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_booking_id ON appointments(booking_id);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_status ON appointments(booking_status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
