import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();

  const urlParts = req.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Sensei ID." }, { status: 400 });
  }

  try {
    const sensei = await User.findById(id).select("-password");
    if (!sensei) {
      return NextResponse.json({ error: "Sensei not found." }, { status: 404 });
    }

    return NextResponse.json({ sensei });
  } catch (error) {
    console.error("❌ Error fetching sensei:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
