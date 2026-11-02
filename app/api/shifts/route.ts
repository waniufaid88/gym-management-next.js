import db from "@/db";
import { Shift } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shifts = await db.select().from(Shift);
    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Could not load shifts:", error);
    return NextResponse.json(
      { message: "Could not load shifts" },
      { status: 500 },
    );
  }
}
