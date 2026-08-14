import { Schema, model, Types } from "mongoose";
type Role = "owner" | "admin" | "member";

export interface WorkspaceDocument {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  members: Array<{ userId: Types.ObjectId; role: Role; joinedAt: Date }>;
  invitations: Array<{ email: string; role: Role; token: string; expiresAt: Date; status: "pending" | "accepted" | "revoked" }>;
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
    ],
    invitations: [
      {
        email: { type: String, required: true, lowercase: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending" }
      }
    ]
  },
  { timestamps: true }
);

export const Workspace = model<WorkspaceDocument>("Workspace", workspaceSchema);

