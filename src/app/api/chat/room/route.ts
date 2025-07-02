// src/app/api/chat/room/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChatRoom from "@/models/ChatRoom";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const session = await SessionRequest.findById(sessionId).populate("sensei gakusei", "_id");
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isParticipant = [session.sensei._id.toString(), session.gakusei._id.toString()].includes(
      user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let room = await ChatRoom.findOne({ session: session._id });

    if (!room) {
      room = await ChatRoom.create({
        session: session._id,
        participants: [session.sensei._id, session.gakusei._id],
      });
    }

    return NextResponse.json({ roomId: room._id });
  } catch (error: any) {
    console.error("Chat Room Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
