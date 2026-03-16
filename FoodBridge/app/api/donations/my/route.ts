import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const donorId = searchParams.get("donorId");

    if (!donorId) {
      return NextResponse.json(
        { error: "Missing required query parameter: donorId" },
        { status: 400 }
      );
    }

    const donations = await prisma.donation.findMany({
      where: { donorId },
      orderBy: { createdAt: "desc" },
      include: { ngo: true },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Error fetching donor donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor donations" },
      { status: 500 }
    );
  }
}
