import db from "@/db";
import { Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "Please log in" }, { status: 401 });
    }

    const members = await db.query.Member.findMany({
      where: eq(Member.userId, userId),
      with: {
        memberships: true,
        payments: true,
      },
    });

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiringDate = nextWeek.toISOString().split("T")[0];

    const totalMembers = members.length;

    const activeMembers = members.filter(
      (member) => member.status.toLowerCase() === "active",
    );

    const activeMemberships = activeMembers
      .flatMap((member) => member.memberships)
      .filter(
        (membership) =>
          membership.startDate <= todayDate && membership.endDate >= todayDate,
      );

    const expiringSoon = activeMemberships.filter(
      (membership) => membership.endDate <= expiringDate,
    ).length;

    const monthlyRevenue = members
      .flatMap((member) => member.payments)
      .filter((payment) => {
        const paymentDate = new Date(payment.paymentDate);

        return (
          paymentDate.getMonth() === today.getMonth() &&
          paymentDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((total, payment) => total + Number(payment.amount), 0);

    return NextResponse.json({
      totalMembers,
      activeMemberships: activeMemberships.length,
      expiringSoon,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Could not load dashboard statistics" },
      { status: 500 },
    );
  }
}
