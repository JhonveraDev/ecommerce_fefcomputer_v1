import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().min(7).max(32),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().min(7).max(32),
});
export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().email().max(320) });
export const resetPasswordSchema = z.object({ token: z.string().min(32).max(256), password: z.string().min(10).max(128) });
