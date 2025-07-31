import { createTRPCReact } from '@trpc/react-query'
import { createTRPCNext } from '@trpc/next'
import { httpBatchLink, loggerLink } from '@trpc/client'
import type { AppRouter } from './router'
import { getTokens } from '../api/client'
import { API_CONFIG } from '../api/config'

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>()

// Create tRPC Next.js client
export const trpcNext = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${API_CONFIG.BASE_URL}/trpc`,
          headers() {
            const { accessToken } = getTokens()
            return {
              authorization: accessToken ? `Bearer ${accessToken}` : '',
            }
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false
              }
              return failureCount < 3
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      },
    }
  },
  ssr: false,
})

// Export types
export type { AppRouter } from './router'