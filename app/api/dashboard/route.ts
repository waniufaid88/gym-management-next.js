import db from "@/db";
import { Member } from "@/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ message: "Please log in" }, { status: 401 });
  }

  try {
    const members = await db.query.Member.findMany({
      where: eq(Member.userId, userId),
      with: {
        memberships: true,
        payments: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const todayDate = today.toISOString().split("T")[0];
    const expiringDate = sevenDaysLater.toISOString().split("T")[0];

    const totalMembers = members.length;

    const activeMemberships = members.reduce((total, member) => {
      const active = member.memberships.filter(
        (membership) =>
          membership.status === "Active" && membership.endDate >= todayDate,
      );

      return total + active.length;
    }, 0);

    const expiringSoon = members.reduce((total, member) => {
      const expiring = member.memberships.filter(
        (membership) =>
          membership.status === "Active" &&
          membership.endDate >= todayDate &&
          membership.endDate <= expiringDate,
      );

      return total + expiring.length;
    }, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyRevenue = members.reduce((total, member) => {
      const memberRevenue = member.payments
        .filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);

          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return total + memberRevenue;
    }, 0);

    return NextResponse.json({
      totalMembers,
      activeMemberships,
      expiringSoon,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        message: "Could not load dashboard statistics",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
