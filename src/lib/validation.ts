import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(40),
  theme: z.string().trim().min(2).max(200),
});
