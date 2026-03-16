import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { demoDataEnabled, markPickup } from "@/lib/demo-data";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  if (demoDataEnabled()) {
    const donation = markPickup(String(payload?.donationId || ""));
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, donation }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/pickup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

