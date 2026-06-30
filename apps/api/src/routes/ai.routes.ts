import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Task } from "../models/task.model.js";
import { generateTaskDescription, summarizeProject } from "../services/ai.service.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post("/task-description", async (req, res) => {
  const body = z.object({ title: z.string().min(2), context: z.string().optional() }).parse(req.body);
  res.json({ data: { description: await generateTaskDescription(body.title, body.context) } });
});

aiRouter.post("/project-summary", async (req, res) => {
  const body = z.object({ projectId: z.string() }).parse(req.body);
  const tasks = await Task.find({ projectId: body.projectId }).select("title status priority");
  res.json({ data: { summary: await summarizeProject(tasks) } });
});
