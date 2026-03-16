import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { acceptDonationForNgo, demoDataEnabled } from "@/lib/demo-data";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  if (demoDataEnabled()) {
    const donation = acceptDonationForNgo(String(payload?.donationId || ""), String(payload?.ngoId || ""));
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, donation }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

