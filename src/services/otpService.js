import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// OTP validity duration (10 minutes)
const OTP_EXPIRY_MS = 10 * 60 * 1000;

// In-memory store for the current OTP (never exposed to the UI)
let currentOtp = null;
let currentEmail = null;
let expiresAt = null;

/**
 * Generate a cryptographically random 6-digit OTP
 */
const generateOtp = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
};

/**
 * Send an OTP to the given email via EmailJS
 * @param {string} email
 */
export const sendOtp = async (email) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS is not configured. Please set the environment variables.');
  }

  const otp = generateOtp();

  // Send via EmailJS
  // Template variables: {{to_email}}, {{otp_code}}, {{expiry_minutes}}
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: email.trim().toLowerCase(),
      otp_code: otp,
      expiry_minutes: '10',
    },
    PUBLIC_KEY
  );

  // Store OTP in memory (never visible to the user)
  currentOtp = otp;
  currentEmail = email.trim().toLowerCase();
  expiresAt = Date.now() + OTP_EXPIRY_MS;

  return { success: true };
};

/**
 * Verify the OTP the user entered
 * @param {string} email
 * @param {string} otp
 */
export const verifyOtp = (email, otp) => {
  if (!currentOtp || !currentEmail) {
    throw new Error('No OTP has been sent. Please request one first.');
  }

  if (email.trim().toLowerCase() !== currentEmail) {
    throw new Error('Email mismatch. Please request a new OTP.');
  }

  if (Date.now() > expiresAt) {
    // Clear expired OTP
    currentOtp = null;
    currentEmail = null;
    expiresAt = null;
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (otp.trim() !== currentOtp) {
    throw new Error('Invalid OTP. Please check and try again.');
  }

  // OTP is correct — clear it so it can't be reused
  currentOtp = null;
  currentEmail = null;
  expiresAt = null;

  return { success: true };
};
