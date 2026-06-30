import type { NextFunction, Request, Response } from "express";
type Role = "owner" | "admin" | "member";
import { Workspace } from "../models/workspace.model.js";
import { AppError } from "./error-handler.js";

const rank: Record<Role, number> = { member: 1, admin: 2, owner: 3 };

export function requireWorkspaceRole(minRole: Role) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId ?? req.body.workspaceId;
    const userId = req.user?.id;
    if (!userId || !workspaceId) throw new AppError("Workspace access required", 403, "WORKSPACE_ACCESS_REQUIRED");

    const workspace = await Workspace.findById(workspaceId);
    const membership = workspace?.members.find((member) => member.userId.toString() === userId);

    if (!membership || rank[membership.role] < rank[minRole]) {
      throw new AppError("Insufficient permissions", 403, "INSUFFICIENT_PERMISSIONS");
    }

    next();
  };
}

