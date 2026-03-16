import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { demoDataEnabled, listOpenDonations } from "@/lib/demo-data";

export async function GET() {
  if (demoDataEnabled()) {
    return NextResponse.json({ donations: listOpenDonations() }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/open`);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

