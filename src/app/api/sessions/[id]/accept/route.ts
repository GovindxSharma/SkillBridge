// app/api/sessions/[id]/accept/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import Session from "@/models/Session";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["sensei"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionRequest = await SessionRequest.findById(params.id);
  if (!sessionRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (sessionRequest.status !== "pending") return NextResponse.json({ error: "Already handled" }, { status: 400 });

  // Mark the request as accepted
  sessionRequest.status = "accepted";
  await sessionRequest.save();

  // Create a session
  const session = await Session.create({
    sensei: sessionRequest.sensei,
    gakusei: sessionRequest.gakusei,
    startTime: sessionRequest.preferredDate,
    sessionRequestId: sessionRequest._id,
    status: "upcoming",
    bothMarkedComplete: { sensei: false, gakusei: false },
  });

  return NextResponse.json({ message: "Accepted", session });
}
