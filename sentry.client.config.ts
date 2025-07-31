import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Capture Console
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  
  // Additional client configuration
  beforeSend(event, hint) {
    // Filter out development-only errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Client Error:', hint.originalException || hint.syntheticException)
    }

    const error = hint.originalException
    if (error instanceof Error) {
      // Filter out browser extension errors
      if (error.stack?.includes('extension://') || 
          error.stack?.includes('moz-extension://') ||
          error.stack?.includes('safari-extension://')) {
        return null
      }

      // Filter out ResizeObserver errors (common browser quirk)
      if (error.message?.includes('ResizeObserver loop limit exceeded')) {
        return null
      }

      // Filter out non-actionable network errors
      if (error.message?.includes('Load failed') ||
          error.message?.includes('NetworkError') ||
          error.message?.includes('Failed to fetch')) {
        return null
      }

      // Filter out hydration mismatches in development
      if (process.env.NODE_ENV === 'development' &&
          (error.message?.includes('Hydration') ||
           error.message?.includes('Text content does not match'))) {
        return null
      }
    }

    return event
  },

  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy console logs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null
    }

    // Filter out routine API calls
    if (breadcrumb.category === 'fetch') {
      const url = breadcrumb.data?.url
      if (url?.includes('/health') || 
          url?.includes('/ping') ||
          url?.includes('analytics') ||
          url?.includes('telemetry')) {
        return null
      }
    }

    return breadcrumb
  },

  // Custom tags for all client events
  initialScope: {
    tags: {
      component: 'client',
      runtime: 'browser',
    },
  },

  // Integrations
  integrations: [
    new Sentry.Replay({
      // Mask all text content for privacy
      maskAllText: process.env.NODE_ENV === 'production',
      // Block all media recording for privacy
      blockAllMedia: process.env.NODE_ENV === 'production',
      // Additional privacy settings
      maskAllInputs: true,
      blockClass: 'sentry-block',
      maskClass: 'sentry-mask',
      ignoreClass: 'sentry-ignore',
    }),
  ],

  // Ignore certain URLs
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
    // Safari extensions
    /^safari-extension:\/\//i,
    // Other common false positives
    /localhost/i,
  ],

  // Allowed URLs (whitelist approach for production)
  ...(process.env.NODE_ENV === 'production' && {
    allowUrls: [
      process.env.NEXT_PUBLIC_FRONTEND_URL,
      'viport.com',
    ].filter(Boolean),
  }),
})