const { config } = require("./config");
const { prisma } = require("./prisma");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function isValidRole(role) {
  return role === "donor" || role === "ngo" || role === "delivery" || role === "admin";
}

async function createOtp({ email, role, intent, profile }) {
  if (!isValidRole(role)) {
    throw new Error("Invalid role");
  }

  const normalizedEmail = normalizeEmail(email);
  const code = generateOtp();
  const ttlMs = (config.otpTtlMinutes || 10) * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.otpCode.upsert({
    where: {
      email_role_intent: {
        email: normalizedEmail,
        role,
        intent,
      },
    },
    update: {
      code,
      profile: profile || null,
      expiresAt,
      createdAt: new Date(),
    },
    create: {
      email: normalizedEmail,
      role,
      intent,
      code,
      profile: profile || null,
      expiresAt,
    },
  });

  return { code, email: normalizedEmail };
}

async function verifyOtp({ email, role, intent, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const providedOtp = String(otp || "").trim();

  const record = await prisma.otpCode.findUnique({
    where: {
      email_role_intent: {
        email: normalizedEmail,
        role,
        intent,
      },
    },
  });

  if (!record) {
    return { ok: false, error: "OTP not found. Please request a new code." };
  }

  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    await prisma.otpCode.delete({
      where: {
        email_role_intent: {
          email: normalizedEmail,
          role,
          intent,
        },
      },
    });
    return { ok: false, error: "OTP expired. Please request a new code." };
  }

  if (record.code !== providedOtp) {
    return { ok: false, error: "Incorrect OTP. Please try again." };
  }

  await prisma.otpCode.delete({
    where: {
      email_role_intent: {
        email: normalizedEmail,
        role,
        intent,
      },
    },
  });

  return { ok: true, profile: record.profile, role: record.role, intent: record.intent };
}

module.exports = { createOtp, verifyOtp, normalizeEmail, isValidRole };
