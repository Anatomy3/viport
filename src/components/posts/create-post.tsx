'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Image as ImageIcon, Video, Tag, Globe, Users, Lock } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { useCreatePost } from '@/hooks/use-posts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/upload/file-upload'
import { LoadingButton } from '@/components/ui/loading'
import { cn } from '@/lib/utils'
import type { MediaFile } from '@/types/api'

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Post content too long'),
  visibility: z.enum(['public', 'private', 'friends']).default('public'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

interface CreatePostProps {
  onClose?: () => void
  onSuccess?: () => void
  className?: string
  placeholder?: string
  compact?: boolean
}

export function CreatePost({
  onClose,
  onSuccess,
  className,
  placeholder = "What's on your mind?",
  compact = false,
}: CreatePostProps) {
  const { user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(!compact)

  const { mutate: createPost, isLoading } = useCreatePost()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      visibility: 'public',
      tags: [],
    },
  })

  const content = watch('content')
  const visibility = watch('visibility')
  const tags = watch('tags')

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      await createPost({
        content: data.content,
        visibility: data.visibility,
        tags: data.tags,
        images: uploadedFiles.filter(f => f.type === 'image').map(f => f.id),
        videos: uploadedFiles.filter(f => f.type === 'video').map(f => f.id),
      })

      // Reset form
      reset()
      setUploadedFiles([])
      setTagInput('')
      setIsExpanded(compact ? false : true)

      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setValue('tags', [...tags, tag])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = (files: MediaFile[]) => {
    setUploadedFiles(files)
  }

  const handleRemoveFile = (file: MediaFile) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
  }

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />
      case 'friends':
        return <Users className="h-4 w-4" />
      case 'private':
        return <Lock className="h-4 w-4" />
    }
  }

  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'public':
        return 'Public'
      case 'friends':
        return 'Friends only'
      case 'private':
        return 'Private'
    }
  }

  if (!user) return null

  return (
    <div className={cn('bg-card rounded-lg border p-4', className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getVisibilityIcon()}
                <span>{getVisibilityLabel()}</span>
              </div>
            </div>
          </div>

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Textarea
            placeholder={placeholder}
            className="min-h-[100px] resize-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
            {...register('content')}
            onClick={() => setIsExpanded(true)}
          />
          
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}

          {/* Character count */}
          <div className="flex justify-end">
            <span className={cn(
              'text-xs',
              content.length > 1800 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {content.length}/2000
            </span>
          </div>
        </div>

        {/* Expanded options */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Tags */}
            <div className="space-y-2">
              <Input
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="text-sm"
              />
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <FileUpload
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
                'video/*': ['.mp4', '.webm'],
              }}
              maxSize={10 * 1024 * 1024} // 10MB
              multiple
              onUpload={handleFileUpload}
              onRemove={handleRemoveFile}
            />

            {/* Visibility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getVisibilityIcon()}
                <span className="text-sm">Visibility:</span>
              </div>
              
              <Select
                value={visibility}
                onValueChange={(value: 'public' | 'private' | 'friends') => 
                  setValue('visibility', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Friends</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        {isExpanded && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {compact && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
              )}
              
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                disabled={!content.trim() || content.length > 2000}
              >
                Post
              </LoadingButton>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}