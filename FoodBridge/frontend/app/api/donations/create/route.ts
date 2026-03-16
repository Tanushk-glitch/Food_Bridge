import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { createDonation, demoDataEnabled } from "@/lib/demo-data";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  if (demoDataEnabled()) {
    const donation = createDonation({
      donorId: String(payload?.donorId || ""),
      foodType: String(payload?.foodType || "Prepared meals"),
      quantity: String(payload?.quantity || "20 meal boxes"),
      expiryTime: String(payload?.expiryTime || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()),
      location: String(payload?.location || "Koramangala, Bengaluru"),
    });

    if (!donation) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, donation }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

