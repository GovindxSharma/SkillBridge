import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export async function getUserFromRequest(req: NextRequest, allowedRoles: string[] = []) {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
  
    if (!token) throw new Error("Unauthorized: No token");
  
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error("Unauthorized: Invalid token");
    }
  
    const user = await User.findById(decoded._id || decoded.id);
  
    if (!user) {
      throw new Error("Unauthorized: User not found");
    }
  
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }
  
    return user;
  }
  