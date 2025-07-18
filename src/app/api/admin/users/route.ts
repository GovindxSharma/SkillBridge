import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getUserFromRequest } from "@/utils/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const admin = await getUserFromRequest(req, ["admin"]);
  const users = await User.find();
  return NextResponse.json({ users });
}
