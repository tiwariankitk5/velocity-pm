import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/workspace/:workspaceId", requireWorkspaceRole("member"), async (req, res) => {
  const { workspaceId } = req.params;
  
  const totalProjects = await Project.countDocuments({ workspaceId });
  const activeProjects = await Project.countDocuments({ workspaceId, status: "active" });
  
  const tasks = await Task.aggregate([
    { $match: { workspaceId: { $eq: workspaceId } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  
  const tasksByPriority = await Task.aggregate([
    { $match: { workspaceId: { $eq: workspaceId } } },
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);

  const taskDistribution = tasks.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
  const priorityDistribution = tasksByPriority.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

  res.json({
    data: {
      projects: { total: totalProjects, active: activeProjects },
      tasks: { byStatus: taskDistribution, byPriority: priorityDistribution }
    }
  });
});
