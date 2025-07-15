import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";
import ChatRoom from "@/models/ChatRoom";

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user || user.role !== "gakusei") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("📥 Gakusei Dashboard fetch for:", user._id);

    // ✅ All session requests (for stats)
    const allRequests = await SessionRequest.find({ gakusei: user._id });

    // 📅 Upcoming Sessions (actual sessions, not session requests)
    const upcomingSessionsRaw = await Session.find({
      gakusei: user._id,
      status: "upcoming",
    })
      .populate("sensei", "name email profileImage")
      .lean();

    // 🟢 Add chatRoomId to upcomingSessions
    const upcomingSessions = await Promise.all(
      upcomingSessionsRaw.map(async (session) => {
        const chatRoom = await ChatRoom.findOne({
          session: session.requestId || session.sessionRequest || session._id,
        });

        return {
          ...session,
          chatRoomId: chatRoom?._id?.toString() || null,
        };
      })
    );

    // 📚 Past Sessions (actual sessions)
    const pastSessions = await Session.find({
      gakusei: user._id,
      status: { $in: ["in-progress", "completed"] },
    })
      .populate("sensei", "name email profileImage")
      .lean();

    // ⏳ Session Requests (pending)
    const sessionRequests = await SessionRequest.find({
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
    console.error("❌ Gakusei Dashboard Error:", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
