'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  className,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
      setIsLoading(false)
    }
    onError?.()
  }, [imageSrc, fallbackSrc, onError])

  // Generate blur data URL for better loading experience
  const generateBlurDataURL = (w: number, h: number) => {
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="#f3f4f6"/>
        <animate attributeName="fill" values="#f3f4f6;#e5e7eb;#f3f4f6" dur="2s" repeatCount="indefinite"/>
      </svg>`
    ).toString('base64')}`
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        Image unavailable
      </div>
    )
  }

  const imageProps = {
    src: imageSrc,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined),
    onLoad: handleLoad,
    onError: handleError,
    sizes,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      objectFit === 'cover' && 'object-cover',
      objectFit === 'contain' && 'object-contain',
      objectFit === 'fill' && 'object-fill',
      objectFit === 'none' && 'object-none',
      objectFit === 'scale-down' && 'object-scale-down',
      className
    ),
  }

  if (fill) {
    return (
      <div className="relative">
        <Image {...imageProps} fill />
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      <Image {...imageProps} width={width} height={height} />
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Avatar component with optimized loading
interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
  priority?: boolean
}

export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  priority = false,
}: OptimizedAvatarProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  const sizeValue = sizeMap[size]

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted',
        className
      )}
      style={{ width: sizeValue, height: sizeValue }}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={sizeValue}
          height={sizeValue}
          priority={priority}
          quality={90}
          fallbackSrc="/images/default-avatar.jpg"
          className="rounded-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

// Gallery component with optimized loading
interface OptimizedGalleryProps {
  images: Array<{
    src: string
    alt: string
    width?: number
    height?: number
  }>
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

export function OptimizedGallery({
  images,
  className,
  aspectRatio = 'auto',
  columns = 2,
  gap = 'md',
}: OptimizedGalleryProps) {
  const gapMap = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  }

  const aspectRatioMap = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns}`,
        gapMap[gap],
        className
      )}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'relative overflow-hidden rounded-lg',
            aspectRatioMap[aspectRatio]
          )}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            fill={aspectRatio !== 'auto'}
            width={aspectRatio === 'auto' ? image.width : undefined}
            height={aspectRatio === 'auto' ? image.height : undefined}
            priority={index < 4} // Prioritize first 4 images
            quality={index === 0 ? 90 : 85} // Higher quality for first image
            className="rounded-lg"
          />
        </div>
      ))}
    </div>
  )
}