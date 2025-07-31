import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server';
import { 
  loginRequestSchema, 
  registerRequestSchema, 
  googleAuthRequestSchema,
  authResponseSchema 
} from '@viport/types/auth';

export const authRouter = createTRPCRouter({
  // Get current user session
  me: protectedProcedure.query(async ({ ctx }) => {
    // Return user from session
    return ctx.session.user;
  }),

  // Login with email/password
  login: publicProcedure
    .input(loginRequestSchema)
    .output(z.object({
      data: authResponseSchema,
      message: z.string(),
      success: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Forward to Go backend
        const response = await fetch(`${process.env.GO_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Viport-NextJS/1.0',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: response.status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
            message: data.message || data.error || 'Login failed',
          });
        }

        // Ensure the response matches our expected format
        const validatedData = authResponseSchema.parse(data.data || data);
        
        return {
          data: validatedData,
          message: data.message || 'Login successful',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unable to connect to authentication service. Please try again later.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during login.',
        });
      }
    }),

  // Register new user
  register: publicProcedure
    .input(registerRequestSchema)
    .output(z.object({
      data: authResponseSchema,
      message: z.string(),
      success: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.GO_BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Viport-NextJS/1.0',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: response.status === 409 ? 'CONFLICT' : 'BAD_REQUEST',
            message: data.message || data.error || 'Registration failed',
          });
        }

        const validatedData = authResponseSchema.parse(data.data || data);
        
        return {
          data: validatedData,
          message: data.message || 'Account created successfully',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unable to connect to authentication service. Please try again later.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during registration.',
        });
      }
    }),

  // Google OAuth login
  googleAuth: publicProcedure
    .input(googleAuthRequestSchema)
    .output(z.object({
      data: authResponseSchema,
      message: z.string(),
      success: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.GO_BACKEND_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Viport-NextJS/1.0',
          },
          body: JSON.stringify({
            code: input.code,
            redirect_uri: input.redirectUri,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: data.error || data.message || 'Google authentication failed',
          });
        }

        const validatedData = authResponseSchema.parse(data.data || data);
        
        return {
          data: validatedData,
          message: data.message || 'Google authentication successful',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unable to connect to Google authentication service.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during Google authentication.',
        });
      }
    }),

  // Refresh JWT token
  refreshToken: publicProcedure
    .input(z.object({
      refreshToken: z.string(),
    }))
    .output(z.object({
      data: authResponseSchema,
      message: z.string(),
      success: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.GO_BACKEND_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Viport-NextJS/1.0',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Token refresh failed',
          });
        }

        const validatedData = authResponseSchema.parse(data.data || data);
        
        return {
          data: validatedData,
          message: data.message || 'Token refreshed successfully',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Token refresh request failed',
        });
      }
    }),

  // Logout (clear session)
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Handle logout logic
      // This might involve invalidating tokens, clearing sessions, etc.
      
      return {
        message: 'Logged out successfully',
        success: true,
      };
    }),

  // Validate current session
  validateSession: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(`${process.env.GO_BACKEND_URL}/api/auth/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${input.token}`,
            'User-Agent': 'Viport-NextJS/1.0',
          },
        });

        if (!response.ok) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid session',
          });
        }

        const data = await response.json();
        return {
          valid: true,
          user: data.data || data.user,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        return {
          valid: false,
          user: null,
        };
      }
    }),
});