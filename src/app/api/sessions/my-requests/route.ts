import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const user = await getUserFromRequest(req, ["gakusei"]);
    const requests = await SessionRequest.find({ gakusei: user._id })
      .populate("sensei", "name profileImage email");

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch" }, { status: 500 });
  }
}
