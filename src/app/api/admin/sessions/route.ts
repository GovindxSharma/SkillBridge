import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getUserFromRequest } from "@/utils/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const admin = await getUserFromRequest(req, ["admin"]);

  const sessions = await Session.find()
    .populate("gakusei")
    .populate("sensei");

  return NextResponse.json({ sessions });
}
