import db from "@/db";
import { Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const [updatedMember] = await db
      .update(Member)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(and(eq(Member.id, id), eq(Member.userId, userId)))
      .returning();

    if (!updatedMember) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Could not update member:", error);

    return NextResponse.json(
      { message: "Could not update member" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deletedMember] = await db
      .delete(Member)
      .where(and(eq(Member.id, id), eq(Member.userId, userId)))
      .returning({ id: Member.id });

    if (!deletedMember) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Could not delete member:", error);

    return NextResponse.json(
      { message: "Could not delete member" },
      { status: 500 },
    );
  }
}
