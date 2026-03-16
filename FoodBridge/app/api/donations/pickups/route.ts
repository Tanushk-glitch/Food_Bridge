import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
      include: {
        donor: true,
        ngo: true,
      },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Error fetching pickup requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup requests" },
      { status: 500 }
    );
  }
}
