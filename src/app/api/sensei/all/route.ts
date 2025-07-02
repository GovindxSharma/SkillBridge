// /app/api/sensei/all/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  try {
    const senseis = await User.find({ role: "sensei" }).select("-password");
    return NextResponse.json({ senseis });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch senseis" }, { status: 500 });
  }
}
