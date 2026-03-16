import path from "path";
import fs from "fs";

import { PrismaClient } from "../../database/generated/client";

function resolveDevDbPathFromCwd() {
  const fromHere = path.resolve(process.cwd(), "database", "prisma", "dev.db");
  if (fs.existsSync(fromHere)) {
    return fromHere;
  }

  const fromFrontend = path.resolve(process.cwd(), "..", "database", "prisma", "dev.db");
  if (fs.existsSync(fromFrontend)) {
    return fromFrontend;
  }

  return fromFrontend;
}

function ensureAbsoluteSqliteUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    const fallback = resolveDevDbPathFromCwd();
    process.env.DATABASE_URL = `file:${fallback.replace(/\\/g, "/")}`;
    return;
  }

  if (!value.startsWith("file:")) {
    return;
  }

  const filePath = value.slice("file:".length);
  const isAbsolute = path.isAbsolute(filePath) || /^[a-zA-Z]:[\\/]/.test(filePath);
  if (isAbsolute) {
    return;
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(resolvedPath)) {
    process.env.DATABASE_URL = `file:${resolvedPath.replace(/\\/g, "/")}`;
    return;
  }

  const fallback = resolveDevDbPathFromCwd();
  process.env.DATABASE_URL = `file:${fallback.replace(/\\/g, "/")}`;
  return;
}

ensureAbsoluteSqliteUrl();

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
