import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { User } from "../models/user.model.js";
import { AppError } from "../middleware/error-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { signAccessToken, signRefreshToken } from "../services/token.service.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post("/signup", async (req, res) => {
  const body = credentialsSchema.extend({ name: z.string().min(2) }).parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");

  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await bcrypt.hash(body.password, 12)
  });

  const payload = { sub: user.id, email: user.email };
  res.status(201).json({
    data: {
      user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    }
  });
});

authRouter.post("/login", async (req, res) => {
  const body = credentialsSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const payload = { sub: user.id, email: user.email };
  res.json({
    data: {
      user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user?.id).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  res.json({ data: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, isEmailVerified: user.isEmailVerified } });
});

authRouter.post("/forgot-password", (_req, res) => {
  res.json({ data: { sent: true }, message: "Password reset email pipeline placeholder." });
});

authRouter.post("/verify-email", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user?.id, { isEmailVerified: true });
  res.json({ data: { verified: true } });
});
