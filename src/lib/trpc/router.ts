import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from './trpc'
import { authRouter } from './routers/auth'
import { userRouter } from './routers/user'
import { postRouter } from './routers/post'
import { portfolioRouter } from './routers/portfolio'
import { productRouter } from './routers/product'
import { notificationRouter } from './routers/notification'

// Main app router
export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  // Sub-routers
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  portfolio: portfolioRouter,
  product: productRouter,
  notification: notificationRouter,
})

export type AppRouter = typeof appRouter