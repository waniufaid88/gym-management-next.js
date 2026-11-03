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
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const [existingAccount] = await db
      .select()
      .from(User)
      .where(eq(User.email, email));

    if (existingAccount) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(User)
      .values({ name, email, phone, password: hashedPassword })
      .returning({
        id: User.id,
        name: User.name,
        email: User.email,
        phone: User.phone,
        created_at: User.created_at,
      });

    const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 },
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 1 * 24 * 60 * 60,
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
