import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";
import { demoDataEnabled, listAdminUsers } from "@/lib/demo-data";

export async function GET() {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (demoDataEnabled()) {
      return NextResponse.json({ users: listAdminUsers() }, { status: 200 });
    }

    const users = await adminService.listUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
