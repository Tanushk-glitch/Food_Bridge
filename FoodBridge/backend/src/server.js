require("./config");

const http = require("http");
const { URL } = require("url");

const { config } = require("./config");
const { prisma } = require("./prisma");
const { activeDonations } = require("./demo-data");

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
        quantity,
        expiryTime,
        location,
        status: "POSTED",
        donorId,
      },
    });

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

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "NGO_ACCEPTED",
        ngoId,
      },
    });

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

server.listen(config.port, () => {
  console.log(`FoodBridge backend listening on http://localhost:${config.port}`);
});
