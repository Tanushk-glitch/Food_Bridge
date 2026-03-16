import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analytics = await adminService.getAnalytics();
    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/analytics failed:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}

