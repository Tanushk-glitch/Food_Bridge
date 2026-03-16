import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: "POSTED" },
      orderBy: { createdAt: "desc" },
      include: { donor: true },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Error fetching open donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch open donations" },
      { status: 500 }
    );
  }
}
