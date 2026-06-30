import { Schema, model, Types } from "mongoose";

export interface ProjectDocument {
  workspaceId: Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  status: "active" | "archived";
  deadline?: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, uppercase: true, trim: true },
    description: String,
    status: { type: String, enum: ["active", "archived"], default: "active" },
    deadline: Date
  },
  { timestamps: true }
);

projectSchema.index({ workspaceId: 1, key: 1 }, { unique: true });

export const Project = model<ProjectDocument>("Project", projectSchema);
