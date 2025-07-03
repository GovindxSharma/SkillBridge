import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  const pending = await User.find({ role: "sensei", isVerified: false });
  return NextResponse.json({ pending });
}

export async function PUT(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action"); // "approve" or "reject"

  if (!id || !["approve", "reject"].includes(action!)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (action === "approve") {
    await User.findByIdAndUpdate(id, { isVerified: true });
  } else {
    await User.findByIdAndDelete(id);
  }

  return NextResponse.json({ success: true });
}
