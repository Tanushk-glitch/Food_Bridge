import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donationId, deliveryAgentId } = body;

    if (!donationId) {
      return NextResponse.json(
        { error: "Missing required field: donationId" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: { status: "DELIVERY_ACCEPTED" },
    });

    return NextResponse.json({ donation });
  } catch (error) {
    console.error("Error accepting delivery:", error);
    return NextResponse.json(
      { error: "Failed to accept delivery" },
      { status: 500 }
    );
  }
}
