import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const COOKIE_EXPIRE_DAYS = parseInt(process.env.COOKIE_EXPIRE || "7");
const COOKIE_EXPIRE_SECONDS = COOKIE_EXPIRE_DAYS * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );

  const response = NextResponse.json(
    {
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_EXPIRE_SECONDS,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
