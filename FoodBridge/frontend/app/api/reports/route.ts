import { NextResponse } from "next/server";

import { z } from "zod";

import { getSession } from "@/lib/auth";
import { adminService } from "@/lib/services/adminService";

const createReportSchema = z.object({
  donationId: z.string().min(1),
  description: z.string().min(1),
});

export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.dbRole !== "NGO" && session.dbRole !== "DELIVERY" && session.dbRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createReportSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  try {
    const report = await adminService.createReport({
      donationId: parsed.data.donationId,
      reportedBy: session.userId,
      description: parsed.data.description,
    });
    return NextResponse.json({ ok: true, report }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports failed:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

