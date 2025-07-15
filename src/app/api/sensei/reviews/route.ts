import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "sensei") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviews = await Review.find({ reviewee: user._id })
    .populate("reviewer", "name email");

  return NextResponse.json({ reviews });
}
