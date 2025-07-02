import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: NextRequest) {
  await dbConnect();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, bio, experience, hourlyRate, profileImage } = body;

    // Always update name and profileImage
    if (typeof name === "string" && name.trim() !== "") user.name = name;
    if (profileImage) user.profileImage = profileImage;

    // Update sensei fields only if user.role === 'sensei'
    if (user.role === "sensei") {
      if (typeof bio === "string") user.bio = bio;
      if (typeof experience === "string") user.experience = experience;
      if (typeof hourlyRate === "number") user.hourlyRate = hourlyRate;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ user: userResponse });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
