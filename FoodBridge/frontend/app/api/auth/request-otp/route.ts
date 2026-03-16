import { NextResponse } from "next/server";

function normalizeBackendUrl(value: string | undefined) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://localhost:4000";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

const backendUrl = normalizeBackendUrl(process.env.BACKEND_URL);

export async function POST(request: Request) {
  const payload = await request.json();

  const response = await fetch(`${backendUrl}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, { status: response.status });
}
