import { NextResponse } from "next/server";

import { z } from "zod";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

const assignSchema = z.object({
  ngoId: z.string().min(1),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = assignSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assign payload" }, { status: 400 });
  }

  try {
    const donation = await adminService.assignDonationNgo(context.params.id, parsed.data.ngoId);
    return NextResponse.json({ ok: true, donation }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/donations/:id/assign failed:", error);
    return NextResponse.json({ error: "Failed to assign donation" }, { status: 500 });
  }
}

