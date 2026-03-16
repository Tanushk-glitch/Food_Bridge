import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

export async function PATCH(_: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const donation = await adminService.cancelDonation(context.params.id);
    return NextResponse.json({ ok: true, donation }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/donations/:id/cancel failed:", error);
    return NextResponse.json({ error: "Failed to cancel donation" }, { status: 500 });
  }
}

