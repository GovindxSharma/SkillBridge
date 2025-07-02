import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const COOKIE_EXPIRE_DAYS = parseInt(process.env.COOKIE_EXPIRE || "7");
const COOKIE_EXPIRE_SECONDS = COOKIE_EXPIRE_DAYS * 24 * 60 * 60;

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: "gakusei" | "sensei" | "admin";
  bio?: string;
  experience?: string;
  hourlyRate?: number;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: RegisterBody = await req.json();
  const {
    name,
    email,
    password,
    role,
    bio = "",
    experience = "",
    hourlyRate = 0,
  } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const emailLower = email.toLowerCase();

  const existing = await User.findOne({ email: emailLower });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData: RegisterBody = {
    name,
    email: emailLower,
    password: hashedPassword,
    role,
  };

  if (role === "sensei") {
    userData.bio = bio;
    userData.experience = experience;
    userData.hourlyRate = typeof hourlyRate === "number" ? hourlyRate : 0;
  }

  const user = await User.create(userData);

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );

  const res = NextResponse.json(
    {
      message: "Registered and logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 }
  );

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_EXPIRE_SECONDS,
    sameSite: "lax",
  });

  return res;
}
