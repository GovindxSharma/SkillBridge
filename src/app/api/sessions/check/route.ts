import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const senseiId = searchParams.get("senseiId");

  if (!userId || !senseiId) {
    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
  }

  try {
    const existingSession = await Session.findOne({
      sensei: senseiId,
      gakusei: userId,
      status: { $in: ["upcoming", "in-progress", "completed"] },
    });

    const confirmed = !!existingSession;

    return NextResponse.json({ confirmed });
  } catch (error) {
    console.error("❌ Error checking session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
