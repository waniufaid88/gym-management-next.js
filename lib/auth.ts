import "server-only";

import jwt from "jsonwebtoken";
import { connection, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import db from "@/db";
import { User } from "@/db/schema";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

export function getAuthenticatedUserId(request: NextRequest): string | null {
  const token = request.cookies.get("accessToken")?.value;

  if (!token || !ACCESS_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    if (typeof payload === "string" || typeof payload.id !== "string") {
      return null;
    }

    return payload.id;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token || !ACCESS_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    if (typeof payload === "string" || typeof payload.id !== "string") {
      return null;
    }

    const [user] = await db
      .select({
        id: User.id,
        name: User.name,
        email: User.email,
      })
      .from(User)
      .where(eq(User.id, payload.id))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}
