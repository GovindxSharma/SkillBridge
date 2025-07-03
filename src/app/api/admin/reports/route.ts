import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching reports" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, status } = await req.json();

  try {
    const updated = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    return NextResponse.json({ error: "Could not update report status" }, { status: 500 });
  }
}
