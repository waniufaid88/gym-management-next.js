import { NextRequest, NextResponse } from "next/server";
import { addMonths, format, parseISO, subDays } from "date-fns";
import { desc, eq } from "drizzle-orm";

import db from "@/db";
import { Membership } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const memberships = await db.query.Membership.findMany({
      where: eq(Membership.memberId, Membership.memberId),
      with: {
        member: {
          columns: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: [desc(Membership.created_at)],
    });

    const filteredMemberships = memberships.filter(
      (membership) => membership.member !== null,
    );

    const result = filteredMemberships.filter(
      (membership) => membership.member,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Could not fetch memberships:", error);

    return NextResponse.json(
      { message: "Could not fetch memberships" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { memberId, startDate, durationMonths, monthlyFee } = body;

    if (!memberId || !startDate || !durationMonths || !monthlyFee) {
      return NextResponse.json(
        { message: "Please provide all required fields" },
        { status: 400 },
      );
    }

    const duration = Number(durationMonths);
    const fee = Number(monthlyFee);

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

    const parsedStartDate = parseISO(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid start date" },
        { status: 400 },
      );
    }

    const member = await db.query.Member.findFirst({
      where: (member, { and, eq }) =>
        and(eq(member.id, memberId), eq(member.userId, userId)),
      columns: {
        id: true,
      },
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

    const [newMembership] = await db
      .insert(Membership)
      .values({
        memberId,
        startDate,
        endDate,
        monthlyFee: fee.toFixed(2),
      })
      .returning();

    return NextResponse.json(
      {
        message: "Membership created successfully",
        membership: newMembership,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not create membership:", error);

    return NextResponse.json(
      {
        message: "Could not create membership",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
