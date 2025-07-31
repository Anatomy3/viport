import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getTokens } from '../api/client'
import superjson from 'superjson'

// Context creation
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  // Get user from token if available
  const getUser = async () => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      // Here you would verify the JWT token and get user info
      // For now, we'll mock this
      return { id: 'user-id', email: 'user@example.com' }
    } catch {
      return null
    }
  }

  return {
    req,
    res,
    user: await getUser(),
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

// Base router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // Check if user is admin (you'll need to implement this logic)
  const isAdmin = false // Replace with actual admin check
  
  if (!isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next({ ctx })
})

// Middleware for rate limiting
export const rateLimitMiddleware = t.middleware(async ({ next, ctx }) => {
  // Implement rate limiting logic here
  // For now, just pass through
  return next({ ctx })
})

// Procedure with rate limiting
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware)