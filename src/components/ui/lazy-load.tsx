'use client'

import { lazy, Suspense, ComponentType, useState, useEffect, useRef } from 'react'
import { LoadingSkeleton, LoadingSpinner } from './loading'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from './error'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  LoadingComponent: ComponentType = () => <LoadingSpinner size="lg" />
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }))

  return function LazyLoadedComponent(props: P) {
    return (
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <Suspense fallback={<LoadingComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// Lazy load component with intersection observer
interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
  className?: string
}

export function LazyLoad({
  children,
  fallback = <LoadingSkeleton />,
  rootMargin = '50px',
  threshold = 0.1,
  className,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true)
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [rootMargin, threshold, hasIntersected])

  return (
    <div ref={ref} className={className}>
      {isIntersecting || hasIntersected ? children : fallback}
    </div>
  )
}

// Lazy load images with blur placeholder
interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  blurDataURL,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Lazy load content with smooth reveal animation
interface LazyRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function LazyReveal({ children, delay = 0, className }: LazyRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, hasAnimated])

  return (
    <div
      ref={ref}
      className={cn(
        'transform transition-all duration-700 ease-out',
        isVisible || hasAnimated
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

// Staggered animation for lists
interface StaggeredAnimationProps {
  children: React.ReactNode[]
  className?: string
  delay?: number
  stagger?: number
}

export function StaggeredAnimation({
  children,
  className,
  delay = 0,
  stagger = 100
}: StaggeredAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <LazyReveal key={index} delay={delay + index * stagger}>
          {child}
        </LazyReveal>
      ))}
    </div>
  )
}

// Performance optimized lazy video component
interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
}

export function LazyVideo({
  src,
  poster,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true
}: LazyVideoProps) {
  const [isVisible, setIsVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentContainer = containerRef.current
    if (currentContainer) {
      observer.observe(currentContainer)
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {isVisible ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={cn('w-full h-auto', className)}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="w-full aspect-video bg-muted animate-pulse rounded flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}