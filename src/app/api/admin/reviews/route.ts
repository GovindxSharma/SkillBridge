import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name email")
      .populate("reviewee", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { id } = await req.json();

  try {
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
