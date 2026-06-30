import { Schema, model, Types } from "mongoose";
type Priority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export interface TaskDocument {
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: Types.ObjectId;
  reporterId: Types.ObjectId;
  dueDate?: Date;
  labels: string[];
  subtasks: Array<{ title: string; completed: boolean }>;
}

const taskSchema = new Schema<TaskDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    status: { type: String, enum: ["backlog", "todo", "in_progress", "review", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: Date,
    labels: [{ type: String, trim: true }],
    subtasks: [{ title: { type: String, required: true }, completed: { type: Boolean, default: false } }]
  },
  { timestamps: true }
);

export const Task = model<TaskDocument>("Task", taskSchema);


