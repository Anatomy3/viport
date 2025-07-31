'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useLikePost, useBookmarkPost, useDeletePost } from '@/hooks/use-posts'
import { useRealTimeComments } from '@/hooks/use-real-time'
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Post } from '@/types/api'

interface PostCardProps {
  post: Post
  showActions?: boolean
  compact?: boolean
  className?: string
  onEdit?: (post: Post) => void
  onShare?: (post: Post) => void
}

export function PostCard({
  post,
  showActions = true,
  compact = false,
  className,
  onEdit,
  onShare,
}: PostCardProps) {
  const { user } = useAuth()
  const [showFullContent, setShowFullContent] = useState(false)
  const { like, unlike, isLiking, isUnliking } = useLikePost()
  const { bookmark, isBookmarking } = useBookmarkPost()
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost()

  // Enable real-time comments for this post
  useRealTimeComments(post.id)

  const isOwner = user?.id === post.author.id
  const isLikeLoading = isLiking || isUnliking

  const handleLike = () => {
    if (post.isLiked) {
      unlike(post.id)
    } else {
      like(post.id)
    }
  }

  const handleBookmark = () => {
    bookmark(post.id)
  }

  const handleShare = () => {
    if (onShare) {
      onShare(post)
    } else {
      // Default share behavior
      const url = `${window.location.origin}/posts/${post.id}`
      if (navigator.share) {
        navigator.share({
          title: `Post by ${post.author.username}`,
          text: post.content.slice(0, 100),
          url,
        })
      } else {
        navigator.clipboard.writeText(url)
        // You might want to show a toast here
      }
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post)
    }
  }

  const shouldTruncateContent = post.content.length > 300 && !showFullContent
  const displayContent = shouldTruncateContent
    ? post.content.slice(0, 300) + '...'
    : post.content

  return (
    <article className={cn('bg-card rounded-lg border p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/users/${post.author.username}`} className="flex items-center space-x-3">
          <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
            <AvatarImage src={post.author.avatar} alt={post.author.username} />
            <AvatarFallback>
              {post.author.firstName[0]}{post.author.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-sm">
                {post.author.firstName} {post.author.lastName}
              </p>
              {post.author.isVerified && (
                <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{post.author.username} · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </Link>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share className="mr-2 h-4 w-4" />
                    Share post
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{displayContent}</p>
          {shouldTruncateContent && (
            <button
              onClick={() => setShowFullContent(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Show more
            </button>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={cn(
            'grid gap-2 rounded-lg overflow-hidden',
            {
              'grid-cols-1': post.images.length === 1,
              'grid-cols-2': post.images.length === 2,
              'grid-cols-2': post.images.length >= 3,
            }
          )}>
            {post.images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'relative aspect-square',
                  {
                    'col-span-2': post.images.length >= 3 && index === 0,
                    'aspect-video': post.images.length === 1,
                  }
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'flex items-center space-x-2 text-muted-foreground hover:text-foreground',
                {
                  'text-red-500 hover:text-red-600': post.isLiked,
                }
              )}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart 
                className={cn('h-4 w-4', {
                  'fill-current': post.isLiked,
                })} 
              />
              <span>{formatNumber(post.likesCount)}</span>
            </Button>

            <Link href={`/posts/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(post.commentsCount)}</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
              <span>{formatNumber(post.sharesCount)}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-muted-foreground hover:text-foreground',
              {
                'text-blue-500 hover:text-blue-600': post.isBookmarked,
              }
            )}
            onClick={handleBookmark}
            disabled={isBookmarking}
          >
            <Bookmark 
              className={cn('h-4 w-4', {
                'fill-current': post.isBookmarked,
              })} 
            />
          </Button>
        </div>
      )}
    </article>
  )
}