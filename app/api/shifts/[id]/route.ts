import db from "@/db";
import { Shift, Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const existingShift = await db.query.Shift.findFirst({
      where: and(eq(Shift.id, id), eq(Shift.userId, userId)),
    });

    if (!existingShift) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    const [updatedShift] = await db
      .update(Shift)
      .set({
        startTime,
        endTime,
      })
      .where(and(eq(Shift.id, id), eq(Shift.userId, userId)))
      .returning();

    return NextResponse.json({
      message: "Shift updated successfully",
      shift: updatedShift,
    });
  } catch (error) {
    console.error("UPDATE SHIFT ERROR:", error);

    return NextResponse.json(
      { message: "Could not update shift" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shift = await db.query.Shift.findFirst({
      where: and(eq(Shift.id, id), eq(Shift.userId, userId)),
      with: {
        members: {
          where: eq(Member.userId, userId),
        },
      },
    });

    if (!shift) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    if (shift.members.length > 0) {
      return NextResponse.json(
        {
          message:
            "This shift is assigned to members. Reassign those members before deleting it.",
        },
        { status: 409 },
      );
    }

    await db
      .delete(Shift)
      .where(and(eq(Shift.id, id), eq(Shift.userId, userId)));

    return NextResponse.json({
      message: "Shift deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SHIFT ERROR:", error);

    return NextResponse.json(
      { message: "Could not delete shift" },
      { status: 500 },
    );
  }
}
