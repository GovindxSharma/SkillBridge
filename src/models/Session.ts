import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  sensei: mongoose.Types.ObjectId;
  gakusei: mongoose.Types.ObjectId;
  sessionRequestId?: mongoose.Types.ObjectId;
  chatRoomId?: mongoose.Types.ObjectId;
  startTime: string;
  status: "upcoming" | "in-progress" | "completed";
  bothMarkedComplete: {
    sensei: boolean;
    gakusei: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sensei: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gakusei: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionRequestId: { type: Schema.Types.ObjectId, ref: "SessionRequest" },
    chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
    startTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "in-progress", "completed"],
      default: "upcoming",
    },
    bothMarkedComplete: {
      sensei: { type: Boolean, default: false },
      gakusei: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
