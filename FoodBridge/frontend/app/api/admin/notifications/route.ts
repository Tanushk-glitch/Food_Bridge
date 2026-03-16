import { NextResponse } from "next/server";

import { z } from "zod";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";

const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  targetRole: z.enum(["DONOR", "NGO", "DELIVERY", "ALL"]),
});

export async function POST(request: Request) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = notificationSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }

  try {
    const notification = await adminService.createNotification(parsed.data);
    return NextResponse.json({ ok: true, notification }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/notifications failed:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

