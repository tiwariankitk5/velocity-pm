import { Schema, model, Types } from "mongoose";

export interface SessionDocument {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  expiresAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: String,
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Session = model<SessionDocument>("Session", sessionSchema);
