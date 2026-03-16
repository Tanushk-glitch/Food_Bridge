import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donationId, ngoId } = body;

    if (!donationId || !ngoId) {
      return NextResponse.json(
        { error: "Missing required fields: donationId, ngoId" },
        { status: 400 }
      );
    }

    // Upsert the NGO user so the foreign key is satisfied
    await prisma.user.upsert({
      where: { email: ngoId },
      update: {},
      create: {
        id: ngoId,
        name: ngoId.split("@")[0],
        email: ngoId,
        role: "NGO",
      },
    });

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "NGO_ACCEPTED",
        ngoId,
      },
    });

    return NextResponse.json({ donation });
  } catch (error) {
    console.error("Error accepting donation:", error);
    return NextResponse.json(
      { error: "Failed to accept donation" },
      { status: 500 }
    );
  }
}
