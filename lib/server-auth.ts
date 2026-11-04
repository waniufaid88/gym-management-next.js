import { cookies } from "next/headers";
import { connection } from "next/server";
import jwt from "jsonwebtoken";

export async function getServerUserId(): Promise<string | null> {
  await connection();

  const token = (await cookies()).get("accessToken")?.value;
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!token || !secret) return null;

  try {
    const payload = jwt.verify(token, secret);

    return typeof payload !== "string" && typeof payload.id === "string"
      ? payload.id
      : null;
  } catch {
    return null;
  }
}
