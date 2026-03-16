const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const dbUrl = process.env.DATABASE_URL || "";

if (dbUrl.startsWith("file:")) {
  const filePath = dbUrl.slice("file:".length);
  const isAbsolute = path.isAbsolute(filePath) || /^[a-zA-Z]:[\\/]/.test(filePath);

  if (!isAbsolute) {
    const resolvedPath = path.resolve(__dirname, "..", filePath);
    process.env.DATABASE_URL = `file:${resolvedPath.replace(/\\/g, "/")}`;
  }
}

const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  smtp: {
    enabled: (process.env.SMTP_ENABLED || "").toLowerCase() === "true",
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: (process.env.SMTP_SECURE || "").toLowerCase() === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "",
    replyTo: process.env.SMTP_REPLY_TO || "",
  },
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
};

module.exports = { config };
