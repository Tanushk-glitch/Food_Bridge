import { NextResponse } from "next/server";

import { adminService } from "@/lib/services/adminService";
import { requireAdminSession } from "@/lib/services/requireAdmin";
import { deleteUser, demoDataEnabled } from "@/lib/demo-data";

export async function DELETE(_: Request, context: { params: { id: string } }) {
  if (!requireAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (demoDataEnabled()) {
      const deleted = deleteUser(context.params.id);
      if (!deleted) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const deleted = await adminService.deleteUser(context.params.id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/users/:id failed:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
