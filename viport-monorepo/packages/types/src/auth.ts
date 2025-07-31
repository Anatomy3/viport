import { z } from 'zod';

// Base user schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  isVerified: z.boolean().default(false),
  isCreator: z.boolean().default(false),
  verificationLevel: z.enum(['email', 'phone', 'creator']).default('email'),
  accountType: z.enum(['personal', 'creator', 'business']).default('personal'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Authentication schemas
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  accountType: z.enum(['personal', 'creator']).default('personal'),
});

export const googleAuthRequestSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  success: z.boolean().default(false),
});

// API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    success: z.boolean(),
  });

// Type exports
export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type GoogleAuthRequest = z.infer<typeof googleAuthRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};