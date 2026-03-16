require("./config");

const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");

const { config } = require("./config");
const { prisma } = require("./prisma");
const { activeDonations } = require("./demo-data");
const { sendMail } = require("./mailer");
const { createOtp, verifyOtp, isValidRole, normalizeEmail } = require("./otp-store");

const FIXED_ADMIN_EMAIL = normalizeEmail(config.admin?.email);
const FIXED_ADMIN_PASSWORD = String(config.admin?.password || "");

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": config.frontendUrl,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: "Method not allowed" });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  if (!salt || !hash) {
    return false;
  }
  const derived = crypto.scryptSync(String(password || ""), String(salt), 64);
  return crypto.timingSafeEqual(Buffer.from(String(hash), "hex"), derived);
}

async function ensureFixedAdminAccount() {
  if (!FIXED_ADMIN_EMAIL || !FIXED_ADMIN_PASSWORD) {
    return;
  }

  const { salt, hash } = hashPassword(FIXED_ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { email: FIXED_ADMIN_EMAIL },
    update: {
      name: "Admin",
      role: "ADMIN",
      passwordHash: hash,
      passwordSalt: salt,
    },
    create: {
      id: FIXED_ADMIN_EMAIL,
      name: "Admin",
      email: FIXED_ADMIN_EMAIL,
      role: "ADMIN",
      passwordHash: hash,
      passwordSalt: salt,
    },
  });
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function getDemoDonations(res) {
  sendJson(res, 200, {
    items: activeDonations,
    generatedAt: new Date().toISOString(),
  });
}

async function getOpenDonations(res) {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: "POSTED" },
      orderBy: { createdAt: "desc" },
      include: { donor: true },
    });

    sendJson(res, 200, { donations });
  } catch (error) {
    console.error("Error fetching open donations:", error);
    sendJson(res, 500, { error: "Failed to fetch open donations" });
  }
}

async function getDonorDonations(res, url) {
  try {
    const donorId = url.searchParams.get("donorId");

    if (!donorId) {
      sendJson(res, 400, { error: "Missing required query parameter: donorId" });
      return;
    }

    const donations = await prisma.donation.findMany({
      where: { donorId },
      orderBy: { createdAt: "desc" },
      include: { ngo: true },
    });

    sendJson(res, 200, { donations });
  } catch (error) {
    console.error("Error fetching donor donations:", error);
    sendJson(res, 500, { error: "Failed to fetch donor donations" });
  }
}

async function createDonation(res, body) {
  try {
    const { foodType, quantity, expiryTime, location, donorId } = body;

    if (!foodType || !quantity || !expiryTime || !location || !donorId) {
      sendJson(res, 400, {
        error: "Missing required fields: foodType, quantity, expiryTime, location, donorId",
      });
      return;
    }

    await prisma.user.upsert({
      where: { email: donorId },
      update: {},
      create: {
        id: donorId,
        name: donorId.split("@")[0],
        email: donorId,
        role: "DONOR",
        location,
      },
    });

    const donation = await prisma.donation.create({
      data: {
        foodType,
        foodTitle: foodType,
        quantity,
        expiryTime,
        location,
        status: "POSTED",
        donorId,
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          type: "DONATION_POSTED",
          message: `Donation posted by ${donorId} (${donation.id}).`,
        },
      });
    } catch (error) {
      console.warn("Failed to write activity log (DONATION_POSTED):", error);
    }

    try {
      await sendMail({
        to: donorId,
        subject: "Donation posted on FoodBridge",
        text: `Thanks for posting a donation!\n\nFood: ${foodType}\nQuantity: ${quantity}\nExpiry: ${expiryTime}\nLocation: ${location}\n\nWe will notify you once an NGO accepts it.`,
      });
    } catch (error) {
      console.warn("Failed to send donation confirmation email:", error);
    }

    sendJson(res, 201, { donation });
  } catch (error) {
    console.error("Error creating donation:", error);
    sendJson(res, 500, { error: "Failed to create donation" });
  }
}

async function acceptDonation(res, body) {
  try {
    const { donationId, ngoId } = body;

    if (!donationId || !ngoId) {
      sendJson(res, 400, { error: "Missing required fields: donationId, ngoId" });
      return;
    }

    await prisma.user.upsert({
      where: { email: ngoId },
      update: {},
      create: {
        id: ngoId,
        name: ngoId.split("@")[0],
        email: ngoId,
        role: "NGO",
      },
    });

    const ngoUser = await prisma.user.findUnique({
      where: { email: ngoId },
      select: { verified: true, status: true },
    });

    if (!ngoUser) {
      sendJson(res, 404, { error: "NGO account not found" });
      return;
    }

    if (String(ngoUser.status || "").toLowerCase() === "suspended") {
      sendJson(res, 403, { error: "NGO account is suspended" });
      return;
    }

    if (!ngoUser.verified) {
      sendJson(res, 403, { error: "NGO must be verified by admin before accepting donations." });
      return;
    }

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "NGO_ACCEPTED",
        ngoId,
      },
      select: {
        id: true,
        donorId: true,
        ngoId: true,
        status: true,
      },
    });

    try {
      await sendMail({
        to: donation.donorId,
        subject: "Your donation was accepted",
        text: `Good news! An NGO accepted your donation.\n\nDonation ID: ${donationId}\nNGO: ${ngoId}`,
      });
      await sendMail({
        to: ngoId,
        subject: "Donation accepted",
        text: `You have accepted a donation.\n\nDonation ID: ${donationId}`,
      });
    } catch (error) {
      console.warn("Failed to send acceptance email:", error);
    }

    try {
      await prisma.activityLog.create({
        data: {
          type: "DONATION_CLAIMED",
          message: `Donation ${donationId} claimed by NGO ${ngoId}.`,
        },
      });
    } catch (error) {
      console.warn("Failed to write activity log (DONATION_CLAIMED):", error);
    }

    sendJson(res, 200, { donation });
  } catch (error) {
    console.error("Error accepting donation:", error);
    sendJson(res, 500, { error: "Failed to accept donation" });
  }
}

async function updateStatus(res, body, status, logMessage, responseMessage) {
  try {
    const { donationId } = body;

    if (!donationId) {
      sendJson(res, 400, { error: "Missing required field: donationId" });
      return;
    }

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: { status },
    });

    try {
      const type =
        status === "DELIVERED"
          ? "DONATION_DELIVERED"
          : status === "PICKED_UP"
            ? "DONATION_PICKED_UP"
            : status === "DELIVERY_ACCEPTED"
              ? "DELIVERY_ACCEPTED"
              : "DONATION_STATUS_UPDATED";

      await prisma.activityLog.create({
        data: {
          type,
          message: `Donation ${donationId} updated to ${status}.`,
        },
      });
    } catch (error) {
      console.warn("Failed to write activity log (DONATION_STATUS_UPDATED):", error);
    }

    sendJson(res, 200, { donation });
  } catch (error) {
    console.error(logMessage, error);
    sendJson(res, 500, { error: responseMessage });
  }
}

async function getPickupRequests(res) {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: "NGO_ACCEPTED" },
      orderBy: { createdAt: "desc" },
      include: {
        donor: true,
        ngo: true,
      },
    });

    sendJson(res, 200, { donations });
  } catch (error) {
    console.error("Error fetching pickup requests:", error);
    sendJson(res, 500, { error: "Failed to fetch pickup requests" });
  }
}

async function getDeliveryRequests(res) {
  try {
    const requests = await prisma.donation.findMany({
      where: {
        status: {
          in: ["NGO_ACCEPTED", "DELIVERY_ACCEPTED", "PICKED_UP"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        donor: true,
        ngo: true,
      },
    });

    sendJson(res, 200, { requests });
  } catch (error) {
    console.error("Error fetching delivery requests:", error);
    sendJson(res, 500, { error: "Failed to fetch delivery requests" });
  }
}

async function requestOtp(res, body) {
  const email = normalizeEmail(body.email);
  const role = String(body.role || "");
  const intent = body.intent === "signup" ? "signup" : "login";

  if (!email) {
    sendJson(res, 400, { error: "Email is required" });
    return;
  }

  if (email === FIXED_ADMIN_EMAIL) {
    sendJson(res, 403, { error: "Admin account uses password login only." });
    return;
  }

  if (!isValidRole(role)) {
    sendJson(res, 400, { error: "Invalid role" });
    return;
  }

  if (role === "admin") {
    sendJson(res, 403, { error: "Admin account uses password login only." });
    return;
  }

  const profile =
    intent === "signup"
      ? {
          name: String(body.name || email.split("@")[0]),
          email,
          phone: String(body.phone || ""),
          password: String(body.password || "otp-signup"),
          organizationName: String(body.organizationName || ""),
        }
      : {
          name: email.split("@")[0],
          email,
          phone: "+91 90000 00000",
          password: "otp-login",
          organizationName: "",
        };

  const { code } = await createOtp({ email, role, intent, profile });

  try {
    const mailResult = await sendMail({
      to: email,
      subject: "Your FoodBridge verification code",
      text: `Your FoodBridge verification code is ${code}.\n\nThis code expires in ${config.otpTtlMinutes} minutes.`,
    });

    if (mailResult.skipped) {
      console.warn("OTP email skipped: SMTP not configured.");
      sendJson(res, 200, { ok: true, devMode: true, devCode: code });
      return;
    }
  } catch (error) {
    const message = error && error.message ? error.message : "SMTP error";
    console.error("OTP email failed:", error);
    sendJson(res, 500, { error: `Unable to send OTP: ${message}` });
    return;
  }

  sendJson(res, 200, { ok: true });
}

async function verifyOtpCode(res, body) {
  const email = normalizeEmail(body.email);
  const role = String(body.role || "");
  const intent = body.intent === "signup" ? "signup" : "login";
  const otp = String(body.otp || "");

  if (!email || !otp) {
    sendJson(res, 400, { error: "Email and OTP are required" });
    return;
  }

  if (email === FIXED_ADMIN_EMAIL) {
    sendJson(res, 403, { error: "Admin account uses password login only." });
    return;
  }

  if (!isValidRole(role)) {
    sendJson(res, 400, { error: "Invalid role" });
    return;
  }

  if (role === "admin") {
    sendJson(res, 403, { error: "Admin account uses password login only." });
    return;
  }

  const result = await verifyOtp({ email, role, intent, otp });

  if (!result.ok) {
    sendJson(res, 400, { error: result.error });
    return;
  }

  if (intent === "signup") {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendJson(res, 400, { error: "Account already exists. Please log in." });
      return;
    }

    const profile = result.profile || {};
    const rawPassword = String(profile.password || "");
    if (!rawPassword) {
      sendJson(res, 400, { error: "Password is required to complete signup." });
      return;
    }

    const { salt, hash } = hashPassword(rawPassword);

    await prisma.user.create({
      data: {
        id: email,
        name: String(profile.name || email.split("@")[0]),
        email,
        role: String(role || "").toUpperCase(),
        phone: String(profile.phone || ""),
        organizationName: String(profile.organizationName || ""),
        passwordHash: hash,
        passwordSalt: salt,
      },
    });
  }

  sendJson(res, 200, {
    ok: true,
    session: {
      role,
      name: result.profile?.name || email.split("@")[0],
      email,
      phone: result.profile?.phone || "",
      password: "",
      organizationName: result.profile?.organizationName || "",
      onboardingCompleted: intent === "login",
      profile: {},
    },
  });
}

async function loginWithPassword(res, body) {
  const email = normalizeEmail(body.email);
  const isFixedAdmin = email && email === FIXED_ADMIN_EMAIL;
  const role = isFixedAdmin ? "admin" : String(body.role || "");
  const password = String(body.password || "");

  if (!email || !password) {
    sendJson(res, 400, { error: "Email and password are required" });
    return;
  }

  if (!isFixedAdmin && String(role || "").toLowerCase() === "admin") {
    sendJson(res, 403, { error: "Admin access is restricted to the fixed admin account." });
    return;
  }

  if (!isValidRole(role)) {
    sendJson(res, 400, { error: "Invalid role" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }

  const userRole = String(user.role || "").toLowerCase();
  if (userRole && userRole !== String(role || "").toLowerCase()) {
    sendJson(res, 400, { error: "Role does not match this account" });
    return;
  }

  if (!user.passwordHash || !user.passwordSalt) {
    sendJson(res, 400, { error: "This account was created without a password. Please sign up again." });
    return;
  }

  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    session: {
      role,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      organizationName: user.organizationName || "",
      onboardingCompleted: true,
      profile: {},
    },
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/donations") {
      await getDemoDonations(res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/donations/open") {
      await getOpenDonations(res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/donations/my") {
      await getDonorDonations(res, url);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/donations/pickups") {
      await getPickupRequests(res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/delivery/requests") {
      await getDeliveryRequests(res);
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);

      if (url.pathname === "/api/auth/request-otp") {
        await requestOtp(res, body);
        return;
      }

      if (url.pathname === "/api/auth/verify-otp") {
        await verifyOtpCode(res, body);
        return;
      }

      if (url.pathname === "/api/auth/login") {
        await loginWithPassword(res, body);
        return;
      }

      if (url.pathname === "/api/donations/create") {
        await createDonation(res, body);
        return;
      }

      if (url.pathname === "/api/donations/accept") {
        await acceptDonation(res, body);
        return;
      }

      if (url.pathname === "/api/donations/pickup" || url.pathname === "/api/delivery/pickup") {
        await updateStatus(res, body, "PICKED_UP", "Error marking pickup:", "Failed to mark pickup");
        return;
      }

      if (url.pathname === "/api/donations/deliver" || url.pathname === "/api/delivery/deliver") {
        await updateStatus(res, body, "DELIVERED", "Error marking delivery:", "Failed to mark delivery");
        return;
      }

      if (url.pathname === "/api/delivery/accept") {
        await updateStatus(res, body, "DELIVERY_ACCEPTED", "Error accepting delivery:", "Failed to accept delivery");
        return;
      }

      notFound(res);
      return;
    }

    if ([
      "/api/auth/request-otp",
      "/api/auth/verify-otp",
      "/api/auth/login",
      "/api/donations/create",
      "/api/donations/accept",
      "/api/donations/pickup",
      "/api/donations/deliver",
      "/api/delivery/accept",
      "/api/delivery/pickup",
      "/api/delivery/deliver",
    ].includes(url.pathname)) {
      methodNotAllowed(res);
      return;
    }

    notFound(res);
  } catch (error) {
    console.error("Unhandled server error:", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

async function bootstrap() {
  try {
    await ensureFixedAdminAccount();
  } catch (error) {
    console.error("Failed to ensure fixed admin account:", error);
  }

  server.listen(config.port, () => {
    console.log(`FoodBridge backend listening on http://localhost:${config.port}`);
  });
}

bootstrap();
