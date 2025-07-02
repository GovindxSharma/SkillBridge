// models/SessionRequest.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ISessionRequest extends Document {
  sensei: mongoose.Schema.Types.ObjectId;
  gakusei: mongoose.Schema.Types.ObjectId;
  message: string;
  preferredDate: Date;
  status: "pending" | "accepted" | "rejected";
}

const sessionRequestSchema = new Schema<ISessionRequest>(
  {
    sensei: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gakusei: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SessionRequest ||
  mongoose.model<ISessionRequest>("SessionRequest", sessionRequestSchema);
