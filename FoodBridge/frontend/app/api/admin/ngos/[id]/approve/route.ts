import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";
import { approveNgo, demoDataEnabled } from "@/lib/demo-data";

export async function PATCH(_: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (demoDataEnabled()) {
      const user = approveNgo(context.params.id);
      if (!user) {
        return NextResponse.json({ error: "NGO not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, user }, { status: 200 });
    }

    const user = await adminService.approveNgo(context.params.id);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/ngos/:id/approve failed:", error);
    return NextResponse.json({ error: "Failed to approve NGO" }, { status: 500 });
  }
}
