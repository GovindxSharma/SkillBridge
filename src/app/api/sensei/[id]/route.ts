import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User"; // Update with your actual model path
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = params;

  // Check for valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Sensei ID." }, { status: 400 });
  }

  try {
    const sensei = await User.findById(id);

    if (!sensei) {
      return NextResponse.json({ error: "Sensei not found." }, { status: 404 });
    }

    return NextResponse.json({ sensei });
  } catch (error) {
    console.error("❌ Error fetching sensei:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
