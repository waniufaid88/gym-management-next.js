import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { addMonths, format, isValid, parseISO, subDays } from "date-fns";

import { Member, Membership } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import db from "@/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { memberId, startDate, durationMonths, monthlyFee } =
      await request.json();

    if (!memberId || !startDate || !durationMonths || !monthlyFee) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const duration = Number(durationMonths);
    const fee = Number(monthlyFee);
    const parsedStartDate = parseISO(startDate);

    if (![1, 3, 6, 12].includes(duration)) {
      return NextResponse.json(
        { message: "Invalid membership duration" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(fee) || fee <= 0) {
      return NextResponse.json(
        { message: "Monthly fee must be greater than zero" },
        { status: 400 },
      );
    }

    if (!isValid(parsedStartDate)) {
      return NextResponse.json(
        { message: "Invalid start date" },
        { status: 400 },
      );
    }

    const membership = await db.query.Membership.findFirst({
      where: eq(Membership.id, id),
      with: {
        member: true,
      },
    });

    if (!membership || membership.member.userId !== userId) {
      return NextResponse.json(
        { message: "Membership not found" },
        { status: 404 },
      );
    }

    const member = await db.query.Member.findFirst({
      where: and(eq(Member.id, memberId), eq(Member.userId, userId)),
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    const endDate = format(
      subDays(addMonths(parsedStartDate, duration), 1),
      "yyyy-MM-dd",
    );

    const [updatedMembership] = await db
      .update(Membership)
      .set({
        memberId,
        startDate,
        endDate,
        monthlyFee: fee.toFixed(2),
        updated_at: new Date(),
      })
      .where(eq(Membership.id, id))
      .returning();

    return NextResponse.json(
      {
        message: "Membership updated successfully",
        membership: updatedMembership,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update membership error:", error);

    return NextResponse.json(
      { message: "Could not update membership" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const membership = await db.query.Membership.findFirst({
      where: eq(Membership.id, id),
      with: {
        member: true,
      },
    });

    if (!membership || membership.member.userId !== userId) {
      return NextResponse.json(
        { message: "Membership not found" },
        { status: 404 },
      );
    }

    await db.delete(Membership).where(eq(Membership.id, id));

    return NextResponse.json({
      message: "Membership deleted successfully",
    });
  } catch (error) {
    console.error("Delete membership error:", error);

    return NextResponse.json(
      { message: "Could not delete membership" },
      { status: 500 },
    );
  }
}
