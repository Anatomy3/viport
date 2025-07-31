import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@/lib/trpc/router'
import { createTRPCContext } from '@/lib/trpc/trpc'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req } as any),
    onError: ({ error, path }) => {
      console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
    },
  })

export { handler as GET, handler as POST }