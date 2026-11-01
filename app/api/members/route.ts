import db from "@/db";
import { Member, Shift } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "accesssecret";

function getUserId(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    return typeof payload === "object" && typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: "Please log in" }, { status: 401 });

  try {
    const members = await db
      .select({
        id: Member.id,
        name: Member.name,
        address: Member.address,
        phone: Member.phone,
        dob: Member.dob,
        gender: Member.gender,
        shiftId: Member.shiftId,
        shiftStart: Shift.startTime,
        shiftEnd: Shift.endTime,
        created_at: Member.created_at,
      })
      .from(Member)
      .leftJoin(Shift, eq(Member.shiftId, Shift.id))
      .where(eq(Member.userId, userId))
      .orderBy(desc(Member.created_at));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Could not load members:", error);
    return NextResponse.json({ message: "Could not load members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: "Please log in" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, address, phone, dob, gender, shiftId } = body;
    if (!name || !address || !phone || !dob || !gender) {
      return NextResponse.json({ message: "Please complete all required fields" }, { status: 400 });
    }

    if (shiftId) {
      const [shift] = await db.select({ id: Shift.id }).from(Shift).where(eq(Shift.id, shiftId)).limit(1);
      if (!shift) return NextResponse.json({ message: "Please select a valid shift" }, { status: 400 });
    }

    const [member] = await db
      .insert(Member)
      .values({ name, address, phone, dob, gender, shiftId: shiftId || null, userId })
      .returning({ id: Member.id, name: Member.name });

    return NextResponse.json({ message: "Member added successfully", member }, { status: 201 });
  } catch (error) {
    console.error("Could not add member:", error);
    return NextResponse.json({ message: "Could not add member" }, { status: 500 });
  }
}
