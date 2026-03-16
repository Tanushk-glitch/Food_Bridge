import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const donations = await adminService.listDonations();
    return NextResponse.json({ donations }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/donations failed:", error);
    return NextResponse.json({ error: "Failed to load donations" }, { status: 500 });
  }
}

