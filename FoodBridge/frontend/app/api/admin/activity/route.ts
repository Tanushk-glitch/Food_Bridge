import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activity = await adminService.listActivity();
    return NextResponse.json({ activity }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/activity failed:", error);
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}

