import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await adminService.getStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}

