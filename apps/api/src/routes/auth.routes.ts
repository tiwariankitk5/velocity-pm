import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../middleware/error-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, generateRandomToken } from "../services/token.service.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

async function createSession(userId: string, userAgent?: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await Session.create({
    userId: user._id,
    refreshTokenHash,
    userAgent,
    expiresAt: new Date(Date.now() + COOKIE_OPTIONS.maxAge)
  });

  return { accessToken, refreshToken, user };
}

authRouter.post("/signup", async (req, res) => {
  const body = credentialsSchema.extend({ name: z.string().min(2) }).parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");

  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await bcrypt.hash(body.password, 12)
  });

  const { accessToken, refreshToken } = await createSession(user.id, req.headers["user-agent"]);

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    data: {
      user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified },
      accessToken
    }
  });
});

authRouter.post("/login", async (req, res) => {
  const body = credentialsSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const { accessToken, refreshToken } = await createSession(user.id, req.headers["user-agent"]);

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.json({
    data: {
      user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified },
      accessToken
    }
  });
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Session.deleteOne({ refreshTokenHash });
  }
  res.clearCookie("refreshToken");
  res.json({ data: { success: true } });
});

authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("No refresh token", 401, "NO_TOKEN");

  try {
    const payload = verifyRefreshToken(token);
    const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await Session.findOne({ refreshTokenHash, userId: payload.sub });

    if (!session) {
      throw new AppError("Session invalid", 401, "SESSION_INVALID");
    }

    // Refresh token rotation
    await Session.deleteOne({ _id: session._id });

    const { accessToken, refreshToken, user } = await createSession(payload.sub, req.headers["user-agent"]);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.json({
      data: {
        user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified },
        accessToken
      }
    });
  } catch (err) {
    res.clearCookie("refreshToken");
    throw new AppError("Invalid refresh token", 401, "INVALID_TOKEN");
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user?.id).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  res.json({ data: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, isEmailVerified: user.isEmailVerified } });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.resetPasswordToken = generateRandomToken();
    user.resetPasswordTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    // TODO: Send email
  }
  res.json({ data: { sent: true }, message: "Password reset email pipeline placeholder." });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400, "INVALID_TOKEN");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresAt = undefined;
  await user.save();

  // Invalidate all sessions
  await Session.deleteMany({ userId: user._id });

  res.json({ data: { success: true } });
});

authRouter.post("/verify-email", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user?.id, { isEmailVerified: true });
  res.json({ data: { verified: true } });
});
