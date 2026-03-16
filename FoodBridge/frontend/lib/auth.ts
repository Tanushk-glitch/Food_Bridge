import "server-only";

import { cookies } from "next/headers";

import { getDashboardPath, getRoleLabel, isUserRole, publicRoles, roleContent, type UserRole } from "@/lib/roles";
import type { DemoSession } from "@/lib/session-types";
export const SESSION_COOKIE = "foodbridge_demo_session";

function encodeSession(session: DemoSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as DemoSession;
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
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
export { getDashboardPath, getRoleLabel, isUserRole, publicRoles, roleContent, type DemoSession, type UserRole };
