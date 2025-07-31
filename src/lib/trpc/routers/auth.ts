import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { api } from '../../api/client'
import { API_ENDPOINTS } from '../../api/config'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/api'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    ),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const authRouter = router({
  // Login
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await api.post<AuthResponse, LoginRequest>(
          API_ENDPOINTS.AUTH.LOGIN,
          input
        )

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Login failed',
          })
        }

        return {
          user: response.data.user,
          tokens: response.data.tokens,
          message: 'Login successful',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: error.code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'BAD_REQUEST',
          message: error.message || 'Login failed',
        })
      }
    }),

  // Register
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await api.post<AuthResponse, RegisterRequest>(
          API_ENDPOINTS.AUTH.REGISTER,
          input
        )

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Registration failed',
          })
        }

        return {
          user: response.data.user,
          tokens: response.data.tokens,
          message: 'Registration successful',
        }
      } catch (error: any) {
        if (error.code === 'CONFLICT') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email or username already exists',
          })
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Registration failed',
        })
      }
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME)

      if (!response.success || !response.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return response.data
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user data',
      })
    }
  }),

  // Logout
  logout: protectedProcedure.mutation(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
      return { message: 'Logout successful' }
    } catch (error: any) {
      // Even if logout fails on server, we should clear local tokens
      return { message: 'Logout completed' }
    }
  }),

  // Refresh token
  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, input)

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Token refresh failed',
          })
        }

        return response.data
      } catch (error: any) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Token refresh failed',
        })
      }
    }),

  // Forgot password
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await api.post<void, ForgotPasswordRequest>(
          API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
          input
        )

        return {
          message: 'Password reset email sent. Please check your inbox.',
        }
      } catch (error: any) {
        // Don't reveal if email exists or not for security
        return {
          message: 'If the email exists, a password reset link has been sent.',
        }
      }
    }),

  // Reset password
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await api.post<void, ResetPasswordRequest>(
          API_ENDPOINTS.AUTH.RESET_PASSWORD,
          {
            token: input.token,
            password: input.password,
            confirmPassword: input.confirmPassword,
          }
        )

        return {
          message: 'Password reset successful. You can now login with your new password.',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Password reset failed',
        })
      }
    }),

  // Verify email
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await api.post(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`, input)

        return {
          message: 'Email verified successfully',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Email verification failed',
        })
      }
    }),
})