import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

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
