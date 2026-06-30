import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error-handler.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

export const taskRouter = Router();
taskRouter.use(requireAuth);

taskRouter.get("/project/:projectId", async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  const tasks = await Task.find({ projectId: project.id }).sort({ createdAt: -1 });
  res.json({ data: tasks.map(toTaskDTO) });
});

taskRouter.post("/", async (req, res) => {
  const body = z
    .object({
      projectId: z.string(),
      title: z.string().min(2),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      assigneeId: z.string().optional(),
      dueDate: z.string().datetime().optional(),
      labels: z.array(z.string()).default([])
    })
    .parse(req.body);

  const project = await Project.findById(body.projectId);
  if (!project) throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");

  const task = await Task.create({
    ...body,
    workspaceId: project.workspaceId,
    reporterId: req.user?.id,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined
  });
  req.app.get("io")?.to(`project:${project.id}`).emit("task:created", toTaskDTO(task));
  res.status(201).json({ data: toTaskDTO(task) });
});

taskRouter.patch("/:taskId", async (req, res) => {
  const body = z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      status: z.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assigneeId: z.string().nullable().optional(),
      dueDate: z.string().datetime().nullable().optional(),
      labels: z.array(z.string()).optional()
    })
    .parse(req.body);
  const task = await Task.findByIdAndUpdate(req.params.taskId, body, { new: true });
  if (!task) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  req.app.get("io")?.to(`project:${task.projectId}`).emit("task:updated", toTaskDTO(task));
  res.json({ data: toTaskDTO(task) });
});

function toTaskDTO(task: any) {
  return {
    id: task.id,
    projectId: task.projectId.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId?.toString(),
    dueDate: task.dueDate?.toISOString(),
    labels: task.labels,
    subtasks: task.subtasks.map((subtask: any) => ({ id: subtask.id, title: subtask.title, completed: subtask.completed }))
  };
}
