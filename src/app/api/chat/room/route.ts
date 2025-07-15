import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import Session from "@/models/Session"; // ✅ changed here
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();
    console.log("📨 Received sessionId from frontend:", sessionId);
    console.log("🔐 Authenticated user:", user._id.toString(), "-", user.role);

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await Session.findById(sessionId)
      .populate("sensei", "_id name")
      .populate("gakusei", "_id name");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isParticipant =
      session.gakusei?._id?.toString() === user._id.toString() ||
      session.sensei?._id?.toString() === user._id.toString();

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create or get existing chat room
    let room = await ChatRoom.findOne({ session: session._id });

    if (!room) {
      room = await ChatRoom.create({
        session: session._id,
        participants: [session.gakusei._id, session.sensei._id],
      });
    }

    return NextResponse.json({ roomId: room._id });
  } catch (err: any) {
    console.error("❌ Chat room creation error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
