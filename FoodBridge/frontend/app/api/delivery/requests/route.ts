import { NextResponse } from "next/server";

import { backendUrl } from "@/lib/backend-url";
import { demoDataEnabled, listDeliveryRequests } from "@/lib/demo-data";

export async function GET() {
  if (demoDataEnabled()) {
    return NextResponse.json({ requests: listDeliveryRequests() }, { status: 200 });
  }

  const response = await fetch(`${backendUrl}/api/delivery/requests`);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

