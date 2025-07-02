import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "gakusei" | "sensei" | "admin";
  profileImage?: string;
  isVerified: boolean;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  createdAt: Date;

  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["gakusei", "sensei", "admin"],
      default: "gakusei",
    },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    bio: { type: String },
    experience: { type: String },
    hourlyRate: { type: Number },

    // ✅ For password reset
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

export default models.User || mongoose.model<IUser>("User", UserSchema);
