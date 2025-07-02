import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Always return success message for security
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate token and hashed version
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${BASE_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">SkillBridge Password Reset</h2>
        <p>Hello ${user.name || ""},</p>
        <p>You requested a password reset for your SkillBridge account.</p>
        <p>Please click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
        <a href="${resetLink}" 
          style="display: inline-block; margin-top: 16px; padding: 12px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
        <br />
        <p>Thanks,<br />The SkillBridge Team</p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.RESEND_SENDER_EMAIL || "SkillBridge <noreply@skillbridge.com>",
      to: email,
      subject: "Reset Your Password",
      html: emailHTML,
    });

    return NextResponse.json({ message: "Reset link sent to email." });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
