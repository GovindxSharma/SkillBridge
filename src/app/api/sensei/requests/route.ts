import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["gakusei"]);
  const { senseiId, date, message } = await req.json();

  const reqDoc = await SessionRequest.create({
    gakusei: user._id,
    sensei: senseiId,
    preferredDate: new Date(date),
    message,
    status: "pending",
  });

  return NextResponse.json({ request: reqDoc }, { status: 201 });
}
