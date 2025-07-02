// GET upcoming sessions + session requests for Sensei

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/utils/auth";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req, ["sensei"]);

  try {
    const pendingRequests = await SessionRequest.find({
      sensei: user._id,
      status: "pending",
    }).populate("gakusei");

    const acceptedSessions = await Session.find({
      sensei: user._id,
      date: { $gte: new Date() },
    }).populate("gakusei");

    const pastSessions = await Session.find({
      sensei: user._id,
      date: { $lt: new Date() },
    }).populate("gakusei");

    return NextResponse.json({
      pendingRequests,
      upcomingSessions: acceptedSessions,
      pastSessions,
    });
  } catch (err) {
    console.error("❌ Sensei Dashboard API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
