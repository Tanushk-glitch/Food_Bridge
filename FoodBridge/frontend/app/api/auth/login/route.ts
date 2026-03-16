import { NextResponse } from "next/server";

import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { createSessionToken, setSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["donor", "ngo", "delivery", "admin"]).optional(),
});

const FIXED_ADMIN_EMAIL = "admin@gmail.com";
const FIXED_ADMIN_PASSWORD = "admin@123";

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function verifyLegacyScryptPassword(password: string, salt: string, hash: string) {
  try {
    const derived = crypto.scryptSync(String(password || ""), String(salt || ""), 64);
    return crypto.timingSafeEqual(Buffer.from(String(hash), "hex"), derived);
  } catch {
    return false;
  }
}

function toUiRole(dbRole: string) {
  const upper = String(dbRole || "").toUpperCase();
  if (upper === "ADMIN") return "admin";
  if (upper === "DONOR") return "donor";
  if (upper === "NGO") return "ngo";
  if (upper === "DELIVERY") return "delivery";
  return "donor";
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  try {
    const email = normalizeEmail(parsed.data.email);
    const password = parsed.data.password;

    const isFixedAdmin = email === normalizeEmail(FIXED_ADMIN_EMAIL);

    if (isFixedAdmin) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        const passwordHashBcrypt = await bcrypt.hash(FIXED_ADMIN_PASSWORD, 10);
        await prisma.user.create({
          data: {
            id: email,
            email,
            name: "Admin",
            role: "ADMIN",
            verified: true,
            status: "active",
            passwordHashBcrypt,
          },
        });
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (String(user.status || "").toLowerCase() === "suspended") {
      return NextResponse.json({ error: "Account suspended. Please contact support." }, { status: 403 });
    }

    if (String(user.role || "").toUpperCase() === "ADMIN" && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Admin access is restricted to the fixed admin account." }, { status: 403 });
    }

    let ok = false;

    if (user.passwordHashBcrypt) {
      ok = await bcrypt.compare(password, user.passwordHashBcrypt);
    } else if (user.passwordHash && user.passwordSalt) {
      ok = verifyLegacyScryptPassword(password, user.passwordSalt, user.passwordHash);
      if (ok) {
        const upgraded = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHashBcrypt: upgraded },
        });
      }
    }

    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const dbRole = String(user.role || "").toUpperCase() as "ADMIN" | "DONOR" | "NGO" | "DELIVERY";
    const session = {
      userId: user.id,
      dbRole,
      role: toUiRole(dbRole),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      organizationName: user.organizationName || "",
      onboardingCompleted: true,
      profile: {},
    } as const;

    const token = createSessionToken(session);
    setSession(session);

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: dbRole,
          city: user.city || "",
          verified: Boolean(user.verified),
          status: String(user.status || "active"),
          createdAt: user.createdAt,
        },
        role: dbRole,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Login failed (server configuration/database error)." }, { status: 500 });
  }
}
