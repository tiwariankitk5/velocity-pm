import { Schema, model, Types } from "mongoose";

export interface CommentDocument {
  taskId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
}

const commentSchema = new Schema<CommentDocument>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const Comment = model<CommentDocument>("Comment", commentSchema);
