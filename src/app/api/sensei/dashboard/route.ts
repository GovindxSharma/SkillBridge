import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";
import ChatRoom from "@/models/ChatRoom";

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req, ["sensei"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    console.log("📥 Sensei Dashboard fetch for:", user._id);

    // ✅ Pending Requests
    const pendingRequests = await SessionRequest.find({
      sensei: user._id,
      status: "pending",
    })
      .populate("gakusei", "name")
      .lean();

    // ❌ Rejected Requests
    const rejectedRequests = await SessionRequest.find({
      sensei: user._id,
      status: "rejected",
    })
      .populate("gakusei", "name")
      .lean();

    // 📅 Upcoming Sessions
    const upcomingSessionsRaw = await Session.find({
      sensei: user._id,
      status: "upcoming",
    })
      .populate("gakusei", "name")
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

    // 📚 Past Sessions
    const pastSessions = await Session.find({
      sensei: user._id,
      status: { $in: ["in-progress", "completed"] },
    })
      .populate("gakusei", "name")
      .lean();

    return NextResponse.json({
      pendingRequests,
      upcomingSessions,
      pastSessions,
      rejectedRequests,
    });
  } catch (error: any) {
    console.error("❌ Sensei Dashboard Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
