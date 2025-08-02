import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../utils/cn'

const loadingVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loadingVariants({ size, className }))}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {loading ? loadingText || 'Loading...' : children}
      </button>
    )
  }
)
LoadingButton.displayName = 'LoadingButton'

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean
  text?: string
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ loading, text, className, children, ...props }, ref) => {
    if (!loading && !children) return null

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          loading && 'pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" />
              {text && (
                <p className="text-sm text-muted-foreground">{text}</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
LoadingOverlay.displayName = 'LoadingOverlay'

export { LoadingSpinner, LoadingButton, LoadingOverlay, loadingVariants }