const { config } = require("./config");

const otpStore = new Map();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function isValidRole(role) {
  return role === "donor" || role === "ngo" || role === "delivery" || role === "admin";
}

function createOtp({ email, role, intent, profile }) {
  if (!isValidRole(role)) {
    throw new Error("Invalid role");
  }

  const normalizedEmail = normalizeEmail(email);
  const code = generateOtp();
  const ttlMs = (config.otpTtlMinutes || 10) * 60 * 1000;

  otpStore.set(normalizedEmail, {
    code,
    role,
    intent,
    profile,
    expiresAt: Date.now() + ttlMs,
  });

  return { code, email: normalizedEmail };
}

function verifyOtp({ email, role, intent, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { ok: false, error: "OTP not found. Please request a new code." };
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(normalizedEmail);
    return { ok: false, error: "OTP expired. Please request a new code." };
  }

  if (record.role !== role || record.intent !== intent) {
    return { ok: false, error: "OTP is invalid for this request." };
  }

  if (record.code !== String(otp || "").trim()) {
    return { ok: false, error: "Incorrect OTP. Please try again." };
  }

  otpStore.delete(normalizedEmail);
  return { ok: true, profile: record.profile, role: record.role, intent: record.intent };
}

module.exports = { createOtp, verifyOtp, normalizeEmail, isValidRole };
