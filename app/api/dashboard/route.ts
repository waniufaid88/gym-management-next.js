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

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const todayDate = formatDate(today);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const expiringDate = formatDate(sevenDaysLater);

    const totalMembers = members.length;

    const activeMembers = members.filter(
      (member) => member.status.toLowerCase() === "active",
    );

    const activeMemberships = activeMembers.reduce((total, member) => {
      const count = member.memberships.filter(
        (membership) =>
          membership.startDate <= todayDate && membership.endDate >= todayDate,
      ).length;

      return total + count;
    }, 0);

    const expiringSoon = activeMembers.reduce((total, member) => {
      const count = member.memberships.filter(
        (membership) =>
          membership.startDate <= todayDate &&
          membership.endDate >= todayDate &&
          membership.endDate <= expiringDate,
      ).length;

      return total + count;
    }, 0);

    const monthlyRevenue = members.reduce((total, member) => {
      const revenue = member.payments
        .filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);

          return (
            paymentDate.getMonth() === today.getMonth() &&
            paymentDate.getFullYear() === today.getFullYear()
          );
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return total + revenue;
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
      { message: "Could not load dashboard statistics" },
      { status: 500 },
    );
  }
}
