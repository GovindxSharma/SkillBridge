import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  const { roomId, content, type = "text", fileUrl, fileName } = await req.json();

  if (!roomId || (!content && !fileUrl)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const message = await Message.create({
    chatRoom: roomId,
    sender: user._id,
    content,
    type,
    fileUrl,
    fileName,
  });

  return NextResponse.json({ message });
}
