import mongoose, { Schema, Document } from "mongoose";

export interface ISessionRequest extends Document {
  sensei: mongoose.Types.ObjectId;
  gakusei: mongoose.Types.ObjectId;
  message: string;
  preferredDate: Date;
  status: "pending" | "accepted" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
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
