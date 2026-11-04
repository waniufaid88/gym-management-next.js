import db from "@/db";
import { Member, Membership, Payment } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer"];

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const members = await db.query.Member.findMany({
      where: eq(Member.userId, userId),
      columns: { id: true },
    });

    const memberIds = members.map((member) => member.id);

    if (memberIds.length === 0) {
      return NextResponse.json([]);
    }

    const payments = await db.query.Payment.findMany({
      where: inArray(Payment.memberId, memberIds),
      with: {
        member: {
          columns: {
            id: true,
            name: true,
            phone: true,
          },
        },
        membership: {
          columns: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyFee: true,
          },
        },
      },
      orderBy: (payment, { desc }) => [desc(payment.paymentDate)],
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);

    return NextResponse.json(
      { message: "Could not load payments" },
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

    const { memberId, membershipId, amount, paymentMode, paymentDate } =
      await request.json();

    if (!memberId || !membershipId || !amount || !paymentMode) {
      return NextResponse.json(
        { message: "Please provide all required fields" },
        { status: 400 },
      );
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { message: "Payment amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (!paymentModes.includes(paymentMode)) {
      return NextResponse.json(
        { message: "Invalid payment mode" },
        { status: 400 },
      );
    }

    const member = await db.query.Member.findFirst({
      where: eq(Member.id, memberId),
    });

    if (!member || member.userId !== userId) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    const membership = await db.query.Membership.findFirst({
      where: eq(Membership.id, membershipId),
    });

    if (!membership || membership.memberId !== memberId) {
      return NextResponse.json(
        { message: "Membership does not belong to this member" },
        { status: 400 },
      );
    }

    const parsedPaymentDate = paymentDate
      ? new Date(`${paymentDate}T12:00:00`)
      : new Date();

    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid payment date" },
        { status: 400 },
      );
    }

    const [newPayment] = await db
      .insert(Payment)
      .values({
        memberId,
        membershipId,
        amount: paymentAmount.toFixed(2),
        paymentMode,
        paymentDate: parsedPaymentDate,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        payment: newPayment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);

    return NextResponse.json(
      { message: "Could not record payment" },
      { status: 500 },
    );
  }
}
