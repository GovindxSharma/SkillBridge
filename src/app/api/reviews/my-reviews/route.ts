// src/app/api/reviews/my-reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ReviewModel from "@/models/Review";
import { getUserFromRequest } from "@/utils/auth"; // assuming correct path

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);

  try {
    const reviews = await ReviewModel.find({ gakusei: user._id }).populate("sensei");

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        _id: r._id,
        comment: r.comment,
        rating: r.rating,
        senseiName: r.sensei?.name || "Unknown",
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
