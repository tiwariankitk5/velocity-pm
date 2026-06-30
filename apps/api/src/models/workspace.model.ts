import { Schema, model, Types } from "mongoose";
type Role = "owner" | "admin" | "member";

export interface WorkspaceDocument {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  members: Array<{ userId: Types.ObjectId; role: Role; joinedAt: Date }>;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Workspace = model<WorkspaceDocument>("Workspace", workspaceSchema);

