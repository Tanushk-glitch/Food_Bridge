import { NextResponse } from "next/server";

import { activeDonations } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    items: activeDonations,
    generatedAt: new Date().toISOString()
  });
}
