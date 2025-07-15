import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["sensei"]);
  const sessionRequestId = params.id;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionRequest = await SessionRequest.findById(sessionRequestId);
  if (!sessionRequest) {
    return NextResponse.json({ error: "Session request not found" }, { status: 404 });
  }

  if (sessionRequest.sensei.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Not authorized for this request" }, { status: 403 });
  }

  if (sessionRequest.status !== "pending") {
    return NextResponse.json({ error: "Already responded" }, { status: 400 });
  }

  sessionRequest.status = "rejected";
  await sessionRequest.save();

  return NextResponse.json({ message: "Session rejected" }, { status: 200 });
}
