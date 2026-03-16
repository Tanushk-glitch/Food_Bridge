import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";
import { demoDataEnabled, rejectNgo } from "@/lib/demo-data";

export async function PATCH(_: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (demoDataEnabled()) {
      const user = rejectNgo(context.params.id);
      if (!user) {
        return NextResponse.json({ error: "NGO not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, user }, { status: 200 });
    }

    const user = await adminService.rejectNgo(context.params.id);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/ngos/:id/reject failed:", error);
    return NextResponse.json({ error: "Failed to reject NGO" }, { status: 500 });
  }
}
