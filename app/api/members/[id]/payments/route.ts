import db from "@/db";
import { Member, Payment } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const { memberId } = await params;

    const member = await db.query.Member.findFirst({
      where: and(eq(Member.id, memberId), eq(Member.userId, userId)),
      columns: {
        id: true,
      },
      with: {
        payments: {
          columns: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMode: true,
          },
          orderBy: [desc(Payment.paymentDate)],
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(member.payments);
  } catch (error) {
    console.error("Could not fetch payment history:", error);

    return NextResponse.json(
      { message: "Could not fetch payment history" },
      { status: 500 },
    );
  }
}
