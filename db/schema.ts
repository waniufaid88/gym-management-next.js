import { pgTable } from "drizzle-orm/pg-core";

export const Shift = pgTable("shifts", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  startTime: t.time().notNull(),
  endTime: t.time().notNull(),
}));

export const User = pgTable("users", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  phone: t.varchar({ length: 20 }).notNull(),
  password: t.varchar({ length: 255 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
}));

export const Member = pgTable("members", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull(),
  address: t.varchar({ length: 255 }).notNull(),
  phone: t.varchar({ length: 20 }).notNull(),
  dob: t.date().notNull(),
  gender: t.varchar({ length: 20 }).notNull(),
  shiftId: t.uuid().references(() => Shift.id),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id),
  created_at: t.timestamp().defaultNow().notNull(),
  updated_at: t.timestamp().defaultNow().notNull(),
}));

export const Payment = pgTable("payments", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  memberId: t
    .uuid()
    .notNull()
    .references(() => Member.id),
  amount: t.numeric({ precision: 10, scale: 2 }).notNull(),
  paymentDate: t.timestamp().defaultNow().notNull(),
  paymentMode: t.varchar({ length: 50 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
}));

export const Membership = pgTable("memberships", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  memberId: t
    .uuid()
    .notNull()
    .references(() => Member.id),
  startDate: t.date().notNull(),
  endDate: t.date().notNull(),
  monthlyFee: t.numeric({ precision: 10, scale: 2 }).notNull(),
  status: t.varchar({ length: 30 }).notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
  updated_at: t.timestamp().defaultNow().notNull(),
}));
