import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { Workspace } from "../models/workspace.model.js";

export const workspaceRouter = Router();
workspaceRouter.use(requireAuth);

workspaceRouter.get("/", async (req, res) => {
  const workspaces = await Workspace.find({ "members.userId": req.user?.id });
  res.json({
    data: workspaces.map((workspace) => {
      const membership = workspace.members.find((member) => member.userId.toString() === req.user?.id);
      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: membership?.role ?? "member",
        memberCount: workspace.members.length
      };
    })
  });
});

workspaceRouter.post("/", async (req, res) => {
  const body = z.object({ name: z.string().min(2) }).parse(req.body);
  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${nanoid(5)}`;
  const workspace = await Workspace.create({
    name: body.name,
    slug,
    ownerId: req.user?.id,
    members: [{ userId: req.user?.id, role: "owner" }]
  });
  res.status(201).json({ data: { id: workspace.id, name: workspace.name, slug: workspace.slug, role: "owner", memberCount: 1 } });
});

workspaceRouter.post("/:workspaceId/invitations", requireWorkspaceRole("admin"), async (req, res) => {
  const body = z.object({ email: z.string().email(), role: z.enum(["admin", "member"]).default("member") }).parse(req.body);
  res.status(201).json({ data: { email: body.email, role: body.role, token: nanoid(32), status: "pending" } });
});
