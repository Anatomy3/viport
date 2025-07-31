import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ErrorMessageProps {
  title?: string
  message: string
  className?: string
}

export function ErrorMessage({ title = 'Error', message, className }: ErrorMessageProps) {
  return (
    <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <div>
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
      </div>
    </div>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  className?: string
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
  className
}: ErrorBoundaryFallbackProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We encountered an unexpected error. Please try again.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs font-mono">
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ErrorPageProps {
  title?: string
  message?: string
  onRetry?: () => void
  onGoHome?: () => void
  showRetry?: boolean
  showGoHome?: boolean
}

export function ErrorPage({
  title = 'Oops! Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = true,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>
        <div className="mt-8 flex justify-center space-x-4">
          {showRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showGoHome && (
            <Button onClick={onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface NotFoundPageProps {
  title?: string
  message?: string
  onGoHome?: () => void
}

export function NotFoundPage({
  title = '404 - Page Not Found',
  message = 'The page you are looking for does not exist.',
  onGoHome,
}: NotFoundPageProps) {
  return (
    <ErrorPage
      title={title}
      message={message}
      onGoHome={onGoHome}
      showRetry={false}
    />
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorPage
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      showGoHome={false}
    />
  )
}

interface UnauthorizedErrorProps {
  onLogin?: () => void
}

export function UnauthorizedError({ onLogin }: UnauthorizedErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 text-3xl font-bold">Access Denied</h1>
        <p className="mt-4 text-muted-foreground">
          You need to be logged in to access this page.
        </p>
        <div className="mt-8">
          <Button onClick={onLogin} variant="default" size="lg">
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ApiErrorProps {
  error: any
  onRetry?: () => void
  className?: string
}

export function ApiError({ error, onRetry, className }: ApiErrorProps) {
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.data?.message) return error.data.message
    return 'An unexpected error occurred'
  }

  const getErrorTitle = (error: any): string => {
    if (error?.status === 400) return 'Bad Request'
    if (error?.status === 401) return 'Unauthorized'
    if (error?.status === 403) return 'Forbidden'
    if (error?.status === 404) return 'Not Found'
    if (error?.status === 500) return 'Server Error'
    return 'Error'
  }

  return (
    <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-6', className)}>
      <div className="text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-2 font-semibold text-destructive">{getErrorTitle(error)}</h3>
        <p className="mt-1 text-sm text-destructive/80">{getErrorMessage(error)}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

// Additional enhanced error components
interface LoadingErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function LoadingError({
  title = 'Failed to load',
  message = 'Something went wrong while loading this content.',
  onRetry,
  isRetrying = false,
  className
}: LoadingErrorProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <AlertDescription className="mt-1">{message}</AlertDescription>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-3"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Try again
              </>
            )}
          </Button>
        )}
      </div>
    </Alert>
  )
}

// Not found error component
interface NotFoundErrorProps {
  resource?: string
  backLink?: {
    href: string
    label: string
  }
  className?: string
}

export function NotFoundError({
  resource = 'page',
  backLink,
  className
}: NotFoundErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">
        {resource.charAt(0).toUpperCase() + resource.slice(1)} not found
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The {resource} you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {backLink && (
          <Button variant="outline" asChild>
            <Link href={backLink.href}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLink.label}
            </Link>
          </Button>
        )}
        
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Inline error component (for form fields, etc.)
interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn('flex items-center text-sm text-destructive', className)}>
      <AlertTriangle className="mr-1 h-3 w-3" />
      {message}
    </div>
  )
}