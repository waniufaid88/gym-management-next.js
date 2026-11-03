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
    const { status } = await request.json();

    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Invalid member status" },
        { status: 400 },
      );
    }

    const [updatedMember] = await db
      .update(Member)
      .set({
        status,
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
      message: `Member ${status === "active" ? "activated" : "deactivated"} successfully`,
      member: updatedMember,
    });
  } catch (error) {
    console.error("Could not update member status:", error);

    return NextResponse.json(
      { message: "Could not update member status" },
      { status: 500 },
    );
  }
}
