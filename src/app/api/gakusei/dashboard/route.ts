import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import SessionRequestModel from "@/models/SessionRequest";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user || user.role !== "gakusei") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    console.log("🕒 Current Time:", now.toISOString());

    // 🔍 All requests (for stats)
    const allRequests = await SessionRequestModel.find({ gakusei: user._id });

    // ✅ Upcoming sessions
    const upcomingSessions = await SessionRequestModel.find({
      gakusei: user._id,
      status: "accepted",
      // startTime: { $gte: now },
    }).populate("sensei", "name email profileImage");

    // ✅ History: completed or rejected
    const pastSessions = await SessionRequestModel.find({
      gakusei: user._id,
      status: { $in: ["completed", "rejected"] },
    }).populate("sensei", "name email profileImage");

    // ✅ Requests: pending only
    const sessionRequests = await SessionRequestModel.find({
      gakusei: user._id,
      status: "pending",
    }).populate("sensei", "name email profileImage");

    return NextResponse.json({
      upcomingSessions,
      pastSessions,
      sessionRequests,
      stats: {
        totalRequests: allRequests.length,
        upcoming: upcomingSessions.length,
        history: pastSessions.length,
      },
    });
  } catch (err: any) {
    console.error("❌ Dashboard API Error:", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
