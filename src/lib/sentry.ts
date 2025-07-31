import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment configuration
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay for debugging
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',
    
    // Release information
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    
    // Server name for better organization
    serverName: process.env.NEXT_PUBLIC_SERVER_NAME || 'viport-app',
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Error:', hint.originalException || hint.syntheticException)
      }
      
      // Filter out specific errors
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip network errors that are user-related
        if (error.message.includes('Network Error') || 
            error.message.includes('Failed to fetch')) {
          return null
        }
        
        // Skip known third-party errors
        if (error.stack?.includes('extension://') ||
            error.stack?.includes('moz-extension://')) {
          return null
        }
        
        // Skip hydration errors in development
        if (process.env.NODE_ENV === 'development' && 
            error.message.includes('Hydration')) {
          return null
        }
      }
      
      return event
    },
    
    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null
      }
      
      // Filter out fetch breadcrumbs for health checks
      if (breadcrumb.category === 'fetch' && 
          breadcrumb.data?.url?.includes('/health')) {
        return null
      }
      
      return breadcrumb
    },
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'frontend',
        framework: 'nextjs',
      },
    },
    
    // Integration configuration
    integrations: [
      new Sentry.Replay({
        maskAllText: process.env.NODE_ENV === 'production',
        blockAllMedia: process.env.NODE_ENV === 'production',
      }),
    ],
  })
}

// Custom error reporting functions
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value))
      })
    }
    Sentry.captureException(error)
  })
}

export const reportMessage = (
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level)
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value))
      })
    }
    Sentry.captureMessage(message)
  })
}

// User context management
export const setUserContext = (user: {
  id: string
  email?: string
  username?: string
  [key: string]: any
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    ...user,
  })
}

export const clearUserContext = () => {
  Sentry.setUser(null)
}

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op })
}

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb)
}

// API error reporting
export const reportApiError = (
  endpoint: string,
  method: string,
  status: number,
  error: any,
  requestData?: any
) => {
  Sentry.withScope((scope) => {
    scope.setTag('api.endpoint', endpoint)
    scope.setTag('api.method', method)
    scope.setTag('api.status', status.toString())
    
    if (requestData) {
      scope.setContext('request', requestData)
    }
    
    scope.setLevel('error')
    Sentry.captureException(new Error(`API Error: ${method} ${endpoint} - ${status}`))
  })
}

// React error boundary integration
export const ErrorBoundary = Sentry.ErrorBoundary

// HOC for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || (({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We've been notified of this error and will fix it soon.
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    )),
    beforeCapture: (scope, error, info) => {
      scope.setTag('errorBoundary', true)
      scope.setContext('componentStack', { componentStack: info.componentStack })
    },
  })
}

// Custom hooks for error handling
export const useSentryError = () => {
  const reportError = (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, String(value))
        })
      }
      Sentry.captureException(error)
    })
  }

  const reportMessage = (
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
  ) => {
    Sentry.withScope((scope) => {
      scope.setLevel(level)
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, String(value))
        })
      }
      Sentry.captureMessage(message)
    })
  }

  return { reportError, reportMessage }
}

// Initialize Sentry on import
if (typeof window !== 'undefined') {
  initSentry()
}