import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ngos = await adminService.listPendingNgos();
    return NextResponse.json({ ngos }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/ngos failed:", error);
    return NextResponse.json({ error: "Failed to load NGOs" }, { status: 500 });
  }
}

