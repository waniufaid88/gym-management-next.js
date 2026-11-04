import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import db from ".";
import { Member, Membership, Payment, Shift } from "./schema";

function getPageValues(currentPage: number, limit?: string) {
  const pageLimit = Number(limit) || 5;

  return {
    pageLimit,
    offset: (currentPage - 1) * pageLimit,
  };
}

export async function getMembers(
  userId: string,
  currentPage: number,
  limit?: string,
  search?: string,
) {
  const { pageLimit, offset } = getPageValues(currentPage, limit);

  const searchValue = search?.trim();

  const memberFilter = searchValue
    ? and(
        eq(Member.userId, userId),
        or(
          ilike(Member.name, `%${searchValue}%`),
          ilike(Member.phone, `%${searchValue}%`),
        ),
      )
    : eq(Member.userId, userId);

  const [members, total] = await Promise.all([
    db.query.Member.findMany({
      where: memberFilter,
      with: {
        shift: true,
      },
      orderBy: desc(Member.created_at),
      limit: pageLimit,
      offset,
    }),

    db.select({ count: count() }).from(Member).where(memberFilter),
  ]);

  return {
    members,
    totalCount: total[0].count,
    totalPages: Math.ceil(total[0].count / pageLimit),
  };
}

export async function getShifts(
  userId: string,
  currentPage: number,
  limit?: string,
) {
  const { pageLimit, offset } = getPageValues(currentPage, limit);

  const [shifts, total] = await Promise.all([
    db.query.Shift.findMany({
      where: (shift, { eq }) => eq(shift.userId, userId),
      with: {
        members: {
          where: (member, { eq }) => eq(member.userId, userId),
          columns: {
            id: true,
          },
        },
      },
      limit: pageLimit,
      offset,
    }),

    db.select({ count: count() }).from(Shift).where(eq(Shift.userId, userId)),
  ]);

  return {
    shifts: shifts.map(({ members, ...shift }) => ({
      ...shift,
      membersCount: members.length,
    })),
    totalCount: total[0].count,
    totalPages: Math.ceil(total[0].count / pageLimit),
  };
}

export async function getMemberships(
  userId: string,
  currentPage: number,
  limit?: string,
  search?: string,
) {
  const { pageLimit, offset } = getPageValues(currentPage, limit);
  const searchValue = search?.trim();

  const memberIds = db
    .select({ id: Member.id })
    .from(Member)
    .where(
      searchValue
        ? and(
            eq(Member.userId, userId),
            or(
              ilike(Member.name, `%${searchValue}%`),
              ilike(Member.phone, `%${searchValue}%`),
            ),
          )
        : eq(Member.userId, userId),
    );

  const [memberships, total] = await Promise.all([
    db.query.Membership.findMany({
      where: (membership, { inArray }) =>
        inArray(membership.memberId, memberIds),
      with: {
        member: {
          columns: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: desc(Membership.created_at),
      limit: pageLimit,
      offset,
    }),

    db
      .select({ count: count() })
      .from(Membership)
      .where(inArray(Membership.memberId, memberIds)),
  ]);

  return {
    memberships,
    totalCount: total[0].count,
    totalPages: Math.ceil(total[0].count / pageLimit),
  };
}

export async function getPayments(
  userId: string,
  currentPage: number,
  limit?: string,
  search?: string,
) {
  const { pageLimit, offset } = getPageValues(currentPage, limit);
  const searchValue = search?.trim();

  const memberIds = db
    .select({ id: Member.id })
    .from(Member)
    .where(
      searchValue
        ? and(
            eq(Member.userId, userId),
            or(
              ilike(Member.name, `%${searchValue}%`),
              ilike(Member.phone, `%${searchValue}%`),
            ),
          )
        : eq(Member.userId, userId),
    );

  const [payments, total] = await Promise.all([
    db.query.Payment.findMany({
      where: (payment, { inArray }) => inArray(payment.memberId, memberIds),
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
      orderBy: desc(Payment.paymentDate),
      limit: pageLimit,
      offset,
    }),

    db
      .select({ count: count() })
      .from(Payment)
      .where(inArray(Payment.memberId, memberIds)),
  ]);

  return {
    payments,
    totalCount: total[0].count,
    totalPages: Math.ceil(total[0].count / pageLimit),
  };
}
