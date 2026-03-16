import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.donation.findMany({
      where: {
        status: {
          in: ["NGO_ACCEPTED", "DELIVERY_ACCEPTED", "PICKED_UP"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        donor: true,
        ngo: true,
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching delivery requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery requests" },
      { status: 500 }
    );
  }
}
