import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "accesssecret";

export function getAuthenticatedUserId(request: NextRequest): string | null {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    console.log("Access token cookie is missing");
    return null;
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    if (typeof payload === "object" && typeof payload.id === "string") {
      return payload.id;
    }

    console.log("Invalid JWT payload:", payload);
    return null;
  } catch (error) {
    console.log("JWT verification failed:", error);
    return null;
  }
}
