import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SessionRequest from "@/models/SessionRequest";
import { getUserFromRequest } from "@/utils/auth";

// 📌 POST: Create session request
export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["gakusei"]);
  const { senseiId, date, message } = await req.json();

  // Check if already requested
  const latestRequest = await SessionRequest.findOne({
    gakusei: user._id,
    sensei: senseiId,
  }).sort({ createdAt: -1 });

  if (latestRequest) {
    const { status, createdAt } = latestRequest;

    if (status === "pending") {
      return NextResponse.json(
        { error: "You already have a pending request with this mentor." },
        { status: 400 }
      );
    }

    if (status === "accepted") {
      return NextResponse.json(
        { error: "You already have an accepted session with this mentor." },
        { status: 400 }
      );
    }

    if (status === "rejected") {
      const hoursSinceRejection =
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

      if (hoursSinceRejection < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceRejection);
        return NextResponse.json(
          {
            error: `You can request again with this mentor after ${hoursLeft} hour(s).`,
          },
          { status: 400 }
        );
      }
    }
  }

  // Create request
  const reqDoc = await SessionRequest.create({
    gakusei: user._id,
    sensei: senseiId,
    preferredDate: new Date(date),
    message,
    status: "pending",
  });

  return NextResponse.json({ request: reqDoc }, { status: 201 });
}

// ✅ GET: Just check latest request status
export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromRequest(req, ["gakusei"]);
  const senseiId = req.nextUrl.searchParams.get("senseiId");

  if (!senseiId) {
    return NextResponse.json({ error: "Missing senseiId" }, { status: 400 });
  }

  const latestRequest = await SessionRequest.findOne({
    gakusei: user._id,
    sensei: senseiId,
  }).sort({ createdAt: -1 });

  if (!latestRequest) {
    return NextResponse.json({ status: "none" });
  }

  const hoursSince = (Date.now() - new Date(latestRequest.createdAt).getTime()) / (1000 * 60 * 60);

  return NextResponse.json({
    status: latestRequest.status,
    createdAt: latestRequest.createdAt,
    hoursSince,
  });
}
