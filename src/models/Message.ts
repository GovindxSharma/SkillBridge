import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chatRoom: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  type: "text" | "file" | "image" | "call" | "whiteboard";
  fileUrl?: string;
  fileName?: string;
  createdAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatRoom: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: String,
    type: { type: String, enum: ["text", "file", "image", "call", "whiteboard"], default: "text" },
    fileUrl: String,
    fileName: String,
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
