import db from "@/db";
import { Shift, Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const shifts = await db.query.Shift.findMany({
      where: eq(Shift.userId, userId),
      with: {
        members: {
          where: eq(Member.userId, userId),
        },
      },
    });

    const result = shifts.map((shift) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      membersCount: shift.members.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET SHIFTS ERROR:", error);

    return NextResponse.json(
      { message: "Could not load shifts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { startTime, endTime } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { message: "Start time and end time are required" },
        { status: 400 },
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 },
      );
    }

    const [newShift] = await db
      .insert(Shift)
      .values({
        startTime,
        endTime,
        userId,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Shift created successfully",
        shift: newShift,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE SHIFT ERROR:", error);

    return NextResponse.json(
      { message: "Could not create shift" },
      { status: 500 },
    );
  }
}
