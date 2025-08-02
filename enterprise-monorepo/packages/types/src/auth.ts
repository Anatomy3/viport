import { z } from 'zod'
import { UserPreferences } from './common'

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface AuthUser {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  isEmailVerified: boolean
  isActive: boolean
  role: UserRole
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  CREATOR = 'creator',
  BUSINESS = 'business'
}

// Auth request/response types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  firstName?: string
  lastName?: string
  termsAccepted: boolean
}

export interface RegisterResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface GoogleAuthRequest {
  idToken?: string
  accessToken?: string
}

export interface GoogleTokenInfo {
  id: string
  email: string
  emailVerified: boolean
  name: string
  picture: string
  givenName: string
  familyName: string
}

// JWT payload types
export interface JWTPayload {
  sub: string // user ID
  email: string
  username: string
  role: UserRole
  iat: number
  exp: number
  type: 'access' | 'refresh'
}

// Session types
export interface Session {
  id: string
  userId: string
  deviceInfo?: {
    userAgent: string
    ip: string
    platform: string
    browser: string
  }
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional().default(false),
})

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
})

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const GoogleAuthSchema = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
}).refine(
  data => data.idToken || data.accessToken,
  'Either idToken or accessToken is required'
)

// Type guards
export const isAuthUser = (user: any): user is AuthUser => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.username === 'string' &&
    typeof user.isEmailVerified === 'boolean' &&
    typeof user.isActive === 'boolean' &&
    Object.values(UserRole).includes(user.role)
  )
}

export const isJWTPayload = (payload: any): payload is JWTPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.username === 'string' &&
    Object.values(UserRole).includes(payload.role) &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    ['access', 'refresh'].includes(payload.type)
  )
}