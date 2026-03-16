const nodemailer = require("nodemailer");

const { config } = require("./config");

function isSmtpConfigured() {
  const { smtp } = config;
  return Boolean(
    smtp.enabled &&
      smtp.host &&
      smtp.port &&
      smtp.user &&
      smtp.pass &&
      smtp.from
  );
}

let transport = null;

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  return transport;
}

async function sendMail({ to, subject, text }) {
  if (!isSmtpConfigured()) {
    return { skipped: true };
  }

  const transporter = getTransport();

  const message = {
    from: config.smtp.from,
    to,
    subject,
    text,
  };

  if (config.smtp.replyTo) {
    message.replyTo = config.smtp.replyTo;
  }

  await transporter.sendMail(message);
  return { skipped: false };
}

module.exports = { sendMail, isSmtpConfigured };
