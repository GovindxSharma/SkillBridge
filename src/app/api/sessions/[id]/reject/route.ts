// Reject session request
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["sensei"]);

  const sessionRequest = await SessionRequest.findById(params.id);
  if (!sessionRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (sessionRequest.sensei.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (sessionRequest.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  sessionRequest.status = "rejected";
  await sessionRequest.save();

  return NextResponse.json({ message: "Rejected" });
}
