// app/api/sessions/[id]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/utils/auth";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["sensei"]);

  const sessionRequest = await SessionRequest.findById(params.id);
  if (!sessionRequest || sessionRequest.sensei.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Unauthorized or request not found" }, { status: 403 });
  }

  sessionRequest.status = "accepted";
  await sessionRequest.save();

  // 🟢 Create actual session
  const newSession = await Session.create({
    sensei: sessionRequest.sensei,
    gakusei: sessionRequest.gakusei,
    date: sessionRequest.date,
  });

  return NextResponse.json({ success: true, session: newSession });
}
