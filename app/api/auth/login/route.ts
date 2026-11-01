import db from "@/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@/db/schema";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "accesssecret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshsecret";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const [user] = await db.select().from(User).where(eq(User.email, email));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });
    
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
