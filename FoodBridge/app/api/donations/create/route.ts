import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { foodType, quantity, expiryTime, location, donorId } = body;

    if (!foodType || !quantity || !expiryTime || !location || !donorId) {
      return NextResponse.json(
        { error: "Missing required fields: foodType, quantity, expiryTime, location, donorId" },
        { status: 400 }
      );
    }

    // Upsert the donor user so the foreign key is satisfied
    await prisma.user.upsert({
      where: { email: donorId },
      update: {},
      create: {
        id: donorId,
        name: donorId.split("@")[0],
        email: donorId,
        role: "DONOR",
        location: location,
      },
    });

    const donation = await prisma.donation.create({
      data: {
        foodType,
        quantity,
        expiryTime,
        location,
        status: "POSTED",
        donorId,
      },
    });

    return NextResponse.json({ donation }, { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
