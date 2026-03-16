import "server-only";

import { cookies } from "next/headers";
import crypto from "node:crypto";

import { getDashboardPath, getRoleLabel, isUserRole, publicRoles, roleContent, type UserRole } from "@/lib/roles";
import type { DemoSession } from "@/lib/session-types";
export const SESSION_COOKIE = "foodbridge_session";

const AUTH_SECRET = process.env.AUTH_SECRET || "foodbridge-dev-secret-change-me";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");
}

function timingSafeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function encodeSession(session: DemoSession) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = { ...session, iat: issuedAt, exp: issuedAt + SESSION_TTL_SECONDS };
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

function decodeSession(value: string) {
  try {
    const parts = String(value || "").split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [body, sig] = parts;
    const expected = sign(body);

    if (!timingSafeEqualString(expected, sig)) {
      return null;
    }

    const parsed = JSON.parse(base64UrlDecode(body)) as DemoSession & { exp?: number };

    if (!parsed || !isUserRole(parsed.role)) {
      return null;
    }

    if (typeof parsed.exp === "number" && parsed.exp > 0) {
      const now = Math.floor(Date.now() / 1000);
      if (parsed.exp < now) {
        return null;
      }
    }

    return parsed as DemoSession;
  } catch {
    return null;
  }
}

export function getSession() {
  const value = cookies().get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const session = decodeSession(value);

  if (!session || !isUserRole(session.role)) {
    return null;
  }

  return session;
}

export function setSession(session: DemoSession) {
  cookies().set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export function createSessionToken(session: DemoSession) {
  return encodeSession(session);
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
export { getDashboardPath, getRoleLabel, isUserRole, publicRoles, roleContent, type DemoSession, type UserRole };
