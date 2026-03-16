import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { demoDataEnabled, listNgoPickupRequests } from "@/lib/demo-data";

export async function GET() {
  if (demoDataEnabled()) {
    return NextResponse.json({ donations: listNgoPickupRequests() }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/donations/pickups`);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

