import { Schema, model } from "mongoose";

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);
