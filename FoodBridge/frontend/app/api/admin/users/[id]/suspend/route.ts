import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";
import { demoDataEnabled, suspendUser } from "@/lib/demo-data";

export async function PATCH(_: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (demoDataEnabled()) {
      const user = suspendUser(context.params.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, user }, { status: 200 });
    }

    const user = await adminService.suspendUser(context.params.id);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/users/:id/suspend failed:", error);
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
  }
}
