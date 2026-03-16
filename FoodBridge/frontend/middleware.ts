import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "foodbridge_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "foodbridge-dev-secret-change-me";

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256Base64Url(message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifySessionToken(token: string) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [body, sig] = parts;
  const expected = await hmacSha256Base64Url(body);
  if (expected !== sig) {
    return null;
  }

  try {
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(payloadJson) as { exp?: number; dbRole?: string };
    if (typeof payload?.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }
    }
    return payload;
  } catch {
    return null;
  }
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/admin");
}

export async function middleware(request: NextRequest) {
  if (!isAdminRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value || "";
  const payload = await verifySessionToken(token);
  const isAdmin = String(payload?.dbRole || "").toUpperCase() === "ADMIN";

  if (isAdmin) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/admin/:path*", "/api/admin/:path*"],
};

