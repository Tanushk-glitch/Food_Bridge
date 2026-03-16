require("./config");

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;
const prisma = globalForPrisma.__foodbridgePrisma || new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__foodbridgePrisma = prisma;
}

module.exports = { prisma };
