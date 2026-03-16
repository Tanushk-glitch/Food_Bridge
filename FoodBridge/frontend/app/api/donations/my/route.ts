import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { demoDataEnabled, listDonationsForDonor } from "@/lib/demo-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const donorId = String(url.searchParams.get("donorId") || "").trim();

  if (demoDataEnabled()) {
    return NextResponse.json({ donations: listDonationsForDonor(donorId) }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/my?donorId=${encodeURIComponent(donorId)}`);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

