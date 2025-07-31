import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  
  // Server name for identification
  serverName: process.env.SERVER_NAME || 'viport-server',
  
  // Server-specific configuration
  beforeSend(event, hint) {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server Error:', hint.originalException || hint.syntheticException)
    }

    const error = hint.originalException
    if (error instanceof Error) {
      // Filter out expected errors
      if (error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('ETIMEDOUT')) {
        
        // Only log these as warnings, not errors
        if (process.env.NODE_ENV === 'production') {
          console.warn('Network error (not reporting to Sentry):', error.message)
          return null
        }
      }

      // Filter out validation errors (these should be handled gracefully)
      if (error.name === 'ValidationError' ||
          error.message?.includes('Invalid input') ||
          error.message?.includes('Bad Request')) {
        return null
      }

      // Filter out authentication errors (expected behavior)
      if (error.message?.includes('Unauthorized') ||
          error.message?.includes('Token expired') ||
          error.message?.includes('Invalid token')) {
        return null
      }

      // Filter out 404 errors for API routes
      if (error.message?.includes('Not Found') ||
          error.message?.includes('404')) {
        return null
      }
    }

    return event
  },

  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy HTTP logs
    if (breadcrumb.category === 'http' && breadcrumb.data?.method === 'GET') {
      const url = breadcrumb.data?.url
      if (url?.includes('/health') || 
          url?.includes('/ping') ||
          url?.includes('/metrics') ||
          url?.includes('/_next/static')) {
        return null
      }
    }

    // Filter out database query breadcrumbs in production
    if (process.env.NODE_ENV === 'production' && 
        breadcrumb.category === 'query') {
      return null
    }

    return breadcrumb
  },

  // Custom tags for all server events
  initialScope: {
    tags: {
      component: 'server',
      runtime: 'nodejs',
    },
  },

  // Performance monitoring for server
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Additional server context
  beforeSendTransaction(event) {
    // Add server metrics if available
    if (process.memoryUsage) {
      const memory = process.memoryUsage()
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: 'node',
          version: process.version,
        },
        memory: {
          used: memory.heapUsed,
          total: memory.heapTotal,
          external: memory.external,
        },
      }
    }

    return event
  },

  // Ignore certain transactions
  ignoreTransactions: [
    // Health checks
    '/health',
    '/ping',
    '/ready',
    '/live',
    // Static assets
    '/_next/static',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    // Metrics endpoints
    '/metrics',
    '/status',
  ],

  // Custom error handling for uncaught exceptions
  integrations: [
    // Add any server-specific integrations here
  ],
})

// Global error handlers
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  
  Sentry.withScope((scope) => {
    scope.setTag('type', 'unhandledRejection')
    scope.setLevel('fatal')
    Sentry.captureException(reason)
  })
})

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  
  Sentry.withScope((scope) => {
    scope.setTag('type', 'uncaughtException')
    scope.setLevel('fatal')
    Sentry.captureException(error)
  })
  
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})