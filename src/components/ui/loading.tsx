import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
            sizeClasses[size]
          )}
        />
        {text && (
          <span className="text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'image'
}

export function LoadingSkeleton({ 
  lines = 3, 
  className,
  variant = 'default' 
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'avatar') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
    )
  }

  if (variant === 'image') {
    return (
      <Skeleton className={cn('aspect-video w-full rounded-lg', className)} />
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-3',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
  showAvatar?: boolean
  showImage?: boolean
}

export function LoadingCard({ 
  className, 
  showAvatar = true, 
  showImage = true 
}: LoadingCardProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardContent className="p-6 space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        )}
        
        {showImage && (
          <Skeleton className="aspect-video w-full rounded-lg" />
        )}
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({
  loading,
  children,
  className,
  size = 'md',
  disabled,
  onClick
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8': size === 'lg'
        },
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}

// Full page loading component
export function FullPageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

// Post loading skeleton
export function PostLoadingSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        
        <Skeleton className="aspect-video w-full rounded-lg" />
        
        <div className="flex items-center space-x-6">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Portfolio loading skeleton
export function PortfolioLoadingSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </CardContent>
    </Card>
  )
}

// Grid loading skeleton
interface GridLoadingSkeletonProps {
  count?: number
  columns?: 1 | 2 | 3 | 4
  variant?: 'post' | 'portfolio' | 'card'
  className?: string
}

export function GridLoadingSkeleton({
  count = 6,
  columns = 3,
  variant = 'card',
  className
}: GridLoadingSkeletonProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[columns]

  const SkeletonComponent = {
    post: PostLoadingSkeleton,
    portfolio: PortfolioLoadingSkeleton,
    card: LoadingCard
  }[variant]

  return (
    <div className={cn(`grid gap-6 ${gridClass}`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}