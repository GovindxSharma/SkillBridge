import mongoose, { Schema, Document } from "mongoose";

export interface IChatRoom extends Document {
  session: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    session: { type: Schema.Types.ObjectId, ref: "SessionRequest", required: true, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ChatRoom ||
  mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);
