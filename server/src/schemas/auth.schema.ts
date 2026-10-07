import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email('Invalid email address');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  // Check the existing password as supplied; do not transform password contents.
  password: z.string().min(1, 'Password is required'),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
