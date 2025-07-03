import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  reportedUser: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: "open" | "reviewed" | "resolved";
  createdAt?: Date;
  updatedAt?: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["open", "reviewed", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report ||
  mongoose.model<IReport>("Report", ReportSchema);
