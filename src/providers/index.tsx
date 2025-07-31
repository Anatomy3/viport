'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { trpc } from '@/lib/trpc/client'
import { httpBatchLink } from '@trpc/client'
import { createQueryClient } from '@/lib/react-query/client'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
import { WebSocketProvider } from './websocket-provider'
import { Toaster } from 'react-hot-toast'
import { API_CONFIG } from '@/lib/api/config'
import { getTokens } from '@/lib/api/client'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create query client instance
  const [queryClient] = useState(() => createQueryClient())

  // Create tRPC client instance
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
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
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WebSocketProvider>
              {children}
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                  success: {
                    iconTheme: {
                      primary: 'hsl(var(--primary))',
                      secondary: 'hsl(var(--primary-foreground))',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'hsl(var(--destructive))',
                      secondary: 'hsl(var(--destructive-foreground))',
                    },
                  },
                }}
              />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* React Query DevTools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  )
}