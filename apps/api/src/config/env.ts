import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/velocity_pm"),
  JWT_ACCESS_SECRET: z.string().min(20).default("dev-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(20).default("dev-refresh-secret-change-me"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  OPENAI_API_KEY: z.string().optional()
});

export const env = schema.parse(process.env);
