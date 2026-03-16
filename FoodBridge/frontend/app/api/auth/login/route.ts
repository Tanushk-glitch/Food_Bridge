import { NextResponse } from "next/server";

import { z } from "zod";

import { createSessionToken, setSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/roles";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["donor", "ngo", "delivery", "admin"]).optional(),
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

function toDbRole(uiRole: string) {
  const lower = String(uiRole || "").toLowerCase();
  if (lower === "admin") return "ADMIN";
  if (lower === "ngo") return "NGO";
  if (lower === "delivery") return "DELIVERY";
  return "DONOR";
}

function normalizeBackendUrl(value: string | undefined) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://localhost:4000";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

const backendUrl = normalizeBackendUrl(process.env.BACKEND_URL);

function parseAllowlist(value: string | undefined) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function isTruthy(value: string | undefined) {
  return String(value || "").trim().toLowerCase() === "true";
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  try {
    const email = normalizeEmail(parsed.data.email);
    const password = parsed.data.password;

    const demoLoginEnabled = isTruthy(process.env.DEMO_LOGIN_BYPASS);

    const demoAdminEnabled = isTruthy(process.env.DEMO_ADMIN_BYPASS);
    const demoAdminPassword = String(process.env.DEMO_ADMIN_PASSWORD || "");
    const demoAdminAnyPassword = isTruthy(process.env.DEMO_ADMIN_ANY_PASSWORD);
    const demoAdminAllowlist = parseAllowlist(process.env.DEMO_ADMIN_EMAIL_ALLOWLIST);

    if (demoAdminEnabled) {
      const isAllowed =
        demoAdminAllowlist.length > 0 ? demoAdminAllowlist.includes(email) : email.includes("admin");

      const passwordOk =
        demoAdminAnyPassword ? true : Boolean(demoAdminPassword) && password === demoAdminPassword;

      if (isAllowed && passwordOk) {
        const dbRole = "ADMIN" as const;
        const session = {
          userId: email,
          dbRole,
          role: "admin" as const,
          name: "Admin",
          email,
          phone: "",
          password: "",
          organizationName: "",
          onboardingCompleted: true,
          profile: {},
        } as const;

        const token = createSessionToken(session);
        setSession(session);

        return NextResponse.json(
          {
            ok: true,
            demoBypass: true,
            role: dbRole,
            token,
          },
          { status: 200 }
        );
      }
    }

    if (demoLoginEnabled) {
      const uiRole = email.includes("admin") ? "admin" : String(parsed.data.role || "donor");
      const dbRole = toDbRole(uiRole) as "ADMIN" | "DONOR" | "NGO" | "DELIVERY";

      const session = {
        userId: email,
        dbRole,
        role: toUiRole(dbRole),
        name: email.split("@")[0] || "User",
        email,
        phone: "",
        password: "",
        organizationName: "",
        onboardingCompleted: true,
        profile: {},
      } as const;

      const token = createSessionToken(session);
      setSession(session);

      return NextResponse.json(
        {
          ok: true,
          demoBypass: true,
          role: dbRole,
          token,
        },
        { status: 200 }
      );
    }

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (!data?.session?.email) {
      return NextResponse.json({ error: "Login failed." }, { status: 401 });
    }

    const uiRole = String(data.session.role || parsed.data.role || "donor");
    const dbRole = toDbRole(uiRole) as "ADMIN" | "DONOR" | "NGO" | "DELIVERY";

    if (dbRole === "ADMIN" && !isAdminEmail(email)) {
      return NextResponse.json({ error: "Admin access is restricted to the fixed admin account." }, { status: 403 });
    }

    const session = {
      userId: email,
      dbRole,
      role: toUiRole(dbRole),
      name: String(data.session.name || email.split("@")[0]),
      email,
      phone: String(data.session.phone || ""),
      password: "",
      organizationName: String(data.session.organizationName || ""),
      onboardingCompleted: true,
      profile: {},
    } as const;

    const token = createSessionToken(session);
    setSession(session);
    data.token = token;
    data.role = dbRole;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 401 });
  }
}
