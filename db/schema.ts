import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const Shift = pgTable("shifts", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  startTime: t.time("start_time").notNull(),
  endTime: t.time("end_time").notNull(),

  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => User.id),
}));

export const ShiftRelations = relations(Shift, ({ one, many }) => ({
  user: one(User, {
    fields: [Shift.userId],
    references: [User.id],
  }),
  members: many(Member),
}));

export const User = pgTable("users", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  phone: t.varchar({ length: 20 }).notNull(),
  password: t.varchar({ length: 255 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
}));

export const UserRelations = relations(User, ({ many }) => ({
  members: many(Member),
  shifts: many(Shift),
}));

export const Member = pgTable("members", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull(),
  address: t.varchar({ length: 255 }).notNull(),
  phone: t.varchar({ length: 20 }).notNull(),
  dob: t.date().notNull(),
  gender: t.varchar({ length: 20 }).notNull(),
  status: t.varchar({ length: 20 }).default("active").notNull(),

  shiftId: t.uuid("shift_id").references(() => Shift.id),

  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => User.id),

  created_at: t.timestamp().defaultNow().notNull(),
  updated_at: t.timestamp().defaultNow().notNull(),
}));

export const MemberRelations = relations(Member, ({ one, many }) => ({
  user: one(User, {
    fields: [Member.userId],
    references: [User.id],
  }),

  shift: one(Shift, {
    fields: [Member.shiftId],
    references: [Shift.id],
  }),

  payments: many(Payment),
  memberships: many(Membership),
}));

export const Payment = pgTable("payments", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),

  memberId: t
    .uuid("member_id")
    .notNull()
    .references(() => Member.id),

  membershipId: t
    .uuid("membership_id")
    .notNull()
    .references(() => Membership.id),

  amount: t.numeric({ precision: 10, scale: 2 }).notNull(),
  paymentDate: t.timestamp("payment_date").defaultNow().notNull(),
  paymentMode: t.varchar("payment_mode", { length: 50 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
}));

export const PaymentRelations = relations(Payment, ({ one }) => ({
  member: one(Member, {
    fields: [Payment.memberId],
    references: [Member.id],
  }),
  membership: one(Membership, {
    fields: [Payment.membershipId],
    references: [Membership.id],
  }),
}));

export const Membership = pgTable("memberships", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),

  memberId: t
    .uuid("member_id")
    .notNull()
    .references(() => Member.id),

  startDate: t.date("start_date").notNull(),
  endDate: t.date("end_date").notNull(),
  monthlyFee: t.numeric("monthly_fee", { precision: 10, scale: 2 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
  updated_at: t.timestamp().defaultNow().notNull(),
}));

export const MembershipRelations = relations(Membership, ({ one, many }) => ({
  member: one(Member, {
    fields: [Membership.memberId],
    references: [Member.id],
  }),
  payments: many(Payment),
}));
