// app/api/sensei/dashboard/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/utils/auth";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["sensei"]);

  try {
    const now = new Date();

    const pendingRequests = await SessionRequest.find({
      sensei: user._id,
      status: "pending",
    }).populate("gakusei");

    const upcomingSessions = await Session.find({
      sensei: user._id,
      startTime: { $gte: now },
    }).populate("gakusei");

    const pastSessions = await Session.find({
      sensei: user._id,
      startTime: { $lt: now },
    }).populate("gakusei");

    return NextResponse.json({
      pendingRequests,
      upcomingSessions,
      pastSessions,
    });
  } catch (err) {
    console.error("❌ Sensei Dashboard API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
