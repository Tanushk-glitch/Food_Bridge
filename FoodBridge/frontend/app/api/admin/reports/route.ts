import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await adminService.listReports();
    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/reports failed:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}

