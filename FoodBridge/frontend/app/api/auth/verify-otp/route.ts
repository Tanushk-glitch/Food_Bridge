import { NextResponse } from "next/server";

import { z } from "zod";

import { createSessionToken, setSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

function normalizeBackendUrl(value: string | undefined) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://localhost:4000";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

const backendUrl = normalizeBackendUrl(process.env.BACKEND_URL);

const verifyOtpSchema = z.object({
  email: z.string().email(),
  role: z.enum(["donor", "ngo", "delivery", "admin"]),
  otp: z.string().min(1),
  intent: z.enum(["login", "signup"]).optional(),
});

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
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
  const parsed = verifyOtpSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid OTP payload" }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok && data?.session) {
    const email = normalizeEmail(data.session.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User record not found after OTP verification." }, { status: 500 });
    }

    const dbRole = String(user.role || "").toUpperCase();

    if (dbRole === "ADMIN" && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Admin access is restricted to the fixed admin account." }, { status: 403 });
    }

    const session = {
      userId: user.id,
      dbRole: dbRole as "ADMIN" | "DONOR" | "NGO" | "DELIVERY",
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
    data.token = token;
    data.role = dbRole;
  }

  return NextResponse.json(data, { status: response.status });
}
