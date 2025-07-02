import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Session from "@/models/Session";
import { getUserFromRequest } from "@/utils/auth";

export async function POST(req: NextRequest, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["gakusei"]);
  const { sessionId } = params;
  const { rating, comment } = await req.json();

  const session = await Session.findById(sessionId);
  if (!session || session.gakusei.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const review = await Review.create({
    session: sessionId,
    gakusei: user._id,
    sensei: session.sensei,
    rating,
    comment,
  });

  return NextResponse.json({ review }, { status: 201 });
}
