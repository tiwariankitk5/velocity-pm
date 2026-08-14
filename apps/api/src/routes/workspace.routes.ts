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
  const workspaceId = req.params.workspaceId;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new AppError("Workspace not found", 404, "NOT_FOUND");
  
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  workspace.invitations.push({
    email: body.email,
    role: body.role,
    token,
    expiresAt,
    status: "pending"
  });
  
  await workspace.save();
  // TODO: Send email
  res.status(201).json({ data: { email: body.email, role: body.role, token, status: "pending" }, message: "Invitation sent" });
});

workspaceRouter.post("/invitations/accept", async (req, res) => {
  const body = z.object({ token: z.string() }).parse(req.body);
  
  const workspace = await Workspace.findOne({
    "invitations.token": body.token,
    "invitations.status": "pending",
    "invitations.expiresAt": { $gt: new Date() }
  });
  
  if (!workspace) throw new AppError("Invalid or expired invitation", 400, "INVALID_INVITATION");
  
  const invitationIndex = workspace.invitations.findIndex(inv => inv.token === body.token);
  const invitation = workspace.invitations[invitationIndex];
  
  if (invitation.email !== req.user?.email) {
    throw new AppError("This invitation is not for your email address", 403, "EMAIL_MISMATCH");
  }
  
  // Check if already a member
  const isMember = workspace.members.some(m => m.userId.toString() === req.user?.id);
  if (isMember) {
    invitation.status = "accepted";
    await workspace.save();
    return res.json({ data: { success: true }, message: "Already a member" });
  }
  
  workspace.members.push({
    userId: req.user!.id as any,
    role: invitation.role,
    joinedAt: new Date()
  });
  
  invitation.status = "accepted";
  await workspace.save();
  
  res.json({ data: { success: true } });
});
