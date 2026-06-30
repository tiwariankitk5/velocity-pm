import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { Project } from "../models/project.model.js";

export const projectRouter = Router();
projectRouter.use(requireAuth);

projectRouter.get("/workspace/:workspaceId", requireWorkspaceRole("member"), async (req, res) => {
  const projects = await Project.find({ workspaceId: req.params.workspaceId }).sort({ createdAt: -1 });
  res.json({ data: projects.map((project) => ({ id: project.id, workspaceId: project.workspaceId, name: project.name, key: project.key, description: project.description, status: project.status, deadline: project.deadline?.toISOString() })) });
});

projectRouter.post("/", requireWorkspaceRole("admin"), async (req, res) => {
  const body = z
    .object({
      workspaceId: z.string(),
      name: z.string().min(2),
      key: z.string().min(2).max(8),
      description: z.string().optional(),
      deadline: z.string().datetime().optional()
    })
    .parse(req.body);

  const project = await Project.create({ ...body, key: body.key.toUpperCase(), deadline: body.deadline ? new Date(body.deadline) : undefined });
  res.status(201).json({ data: { id: project.id, workspaceId: project.workspaceId, name: project.name, key: project.key, description: project.description, status: project.status, deadline: project.deadline?.toISOString() } });
});
