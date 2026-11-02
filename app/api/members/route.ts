import db from "@/db";
import { Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all members
export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const members = await db.query.Member.findMany({
      where: eq(Member.userId, userId),
      with: {
        shift: true,
      },
      orderBy: [desc(Member.created_at)],
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Could not fetch members:", error);

    return NextResponse.json(
      { message: "Could not load members" },
      { status: 500 },
    );
  }
}

// POST add member
export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const { name, phone, address, dob, gender, shiftId } = await request.json();

    const [newMember] = await db
      .insert(Member)
      .values({
        name,
        phone,
        address,
        dob,
        gender,
        shiftId: shiftId || null,
        userId,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Member added successfully",
        member: newMember,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not add member:", error);

    return NextResponse.json(
      { message: "Could not add member" },
      { status: 500 },
    );
  }
}
