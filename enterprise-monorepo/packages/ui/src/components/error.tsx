import * as React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { cn } from '../utils/cn'
import { Button } from './button'

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
}

const ErrorFallback = React.forwardRef<HTMLDivElement, ErrorFallbackProps>(
  ({ error, onRetry, title, description, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          className
        )}
        {...props}
      >
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">
          {title || 'Something went wrong'}
        </h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          {description || 'An unexpected error occurred. Please try again.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer font-medium text-sm">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto max-w-lg">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    )
  }
)
ErrorFallback.displayName = 'ErrorFallback'

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

export interface ApiErrorProps {
  error: string | Error
  onRetry?: () => void
  className?: string
}

const ApiError = React.forwardRef<HTMLDivElement, ApiErrorProps>(
  ({ error, onRetry, className, ...props }, ref) => {
    const message = typeof error === 'string' ? error : error.message

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80 mt-1">{message}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-2 h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
)
ApiError.displayName = 'ApiError'

export { ErrorFallback, ApiError }