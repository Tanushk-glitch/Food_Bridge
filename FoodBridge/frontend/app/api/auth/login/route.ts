import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: Request) {
  const payload = await request.json();

  const response = await fetch(`${backendUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok && data?.session) {
    setSession(data.session);
  }

  return NextResponse.json(data, { status: response.status });
}