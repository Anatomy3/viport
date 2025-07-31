import { createTRPCRouter } from '../server';
import { authRouter } from './auth';
import { userRouter } from './user';
import { postRouter } from './post';
import { portfolioRouter } from './portfolio';
import { productRouter } from './product';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  portfolio: portfolioRouter,
  product: productRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;