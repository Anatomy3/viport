import { z } from 'zod'
import { Timestamps, SoftDelete, FileUpload, Location } from './common'
import { User } from './users'

// Post types
export interface Post {
  id: string
  userId: string
  user?: User
  content: string
  images?: string[]
  videos?: string[]
  type: PostType
  visibility: PostVisibility
  location?: Location
  tags?: string[]
  mentions?: string[]
  stats: PostStats
  isLiked?: boolean
  isSaved?: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  POLL = 'poll',
  STORY = 'story'
}

export enum PostVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS_ONLY = 'followers_only',
  FRIENDS_ONLY = 'friends_only'
}

export interface PostStats {
  likesCount: number
  commentsCount: number
  sharesCount: number
  savesCount: number
  viewsCount: number
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user?: User
  parentId?: string
  content: string
  imageUrl?: string
  likesCount: number
  repliesCount: number
  isLiked?: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  replies?: Comment[]
}

export interface PostLike {
  id: string
  postId: string
  userId: string
  user?: User
  createdAt: string
}

export interface PostSave {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface PostShare {
  id: string
  postId: string
  userId: string
  sharedTo: ShareTarget
  message?: string
  createdAt: string
}

export enum ShareTarget {
  FEED = 'feed',
  STORY = 'story',
  MESSAGE = 'message',
  EXTERNAL = 'external'
}

export interface Poll {
  id: string
  postId: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  expiresAt?: string
  totalVotes: number
  userVote?: string[]
  createdAt: string
}

export interface PollOption {
  id: string
  text: string
  votesCount: number
  percentage: number
}

// Post request/response types
export interface CreatePostRequest {
  content: string
  images?: string[]
  videos?: string[]
  type: PostType
  visibility?: PostVisibility
  location?: Location
  tags?: string[]
  poll?: CreatePollRequest
}

export interface CreatePollRequest {
  question: string
  options: string[]
  allowMultiple?: boolean
  expiresAt?: string
}

export interface UpdatePostRequest {
  content?: string
  visibility?: PostVisibility
  location?: Location
  tags?: string[]
  isPinned?: boolean
}

export interface GetPostsRequest {
  userId?: string
  type?: PostType
  visibility?: PostVisibility
  tags?: string[]
  sortBy?: 'created' | 'updated' | 'likes' | 'comments'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchPostsRequest {
  query?: string
  userId?: string
  type?: PostType
  tags?: string[]
  location?: {
    latitude: number
    longitude: number
    radius: number
  }
  dateFrom?: string
  dateTo?: string
  sortBy?: 'relevance' | 'created' | 'likes' | 'comments'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCommentRequest {
  postId: string
  parentId?: string
  content: string
  imageUrl?: string
}

export interface UpdateCommentRequest {
  content?: string
  imageUrl?: string
}

export interface GetCommentsRequest {
  postId: string
  parentId?: string
  sortBy?: 'created' | 'likes'
  sortOrder?: 'asc' | 'desc'
}

export interface LikePostRequest {
  postId: string
}

export interface UnlikePostRequest {
  postId: string
}

export interface SavePostRequest {
  postId: string
}

export interface UnsavePostRequest {
  postId: string
}

export interface SharePostRequest {
  postId: string
  sharedTo: ShareTarget
  message?: string
}

export interface VotePollRequest {
  pollId: string
  optionIds: string[]
}

export interface ReportPostRequest {
  postId: string
  reason: PostReportReason
  description?: string
}

export enum PostReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  VIOLENCE = 'violence',
  SELF_HARM = 'self_harm',
  FALSE_INFORMATION = 'false_information',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

// Post validation schemas
export const CreatePostSchema = z.object({
  content: z.string().min(1).max(2200),
  images: z.array(z.string().url()).max(10).optional(),
  videos: z.array(z.string().url()).max(1).optional(),
  type: z.nativeEnum(PostType),
  visibility: z.nativeEnum(PostVisibility).default(PostVisibility.PUBLIC),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  tags: z.array(z.string().min(1).max(50)).max(30).optional(),
  poll: z.object({
    question: z.string().min(1).max(500),
    options: z.array(z.string().min(1).max(100)).min(2).max(10),
    allowMultiple: z.boolean().default(false),
    expiresAt: z.string().datetime().optional(),
  }).optional(),
})

export const UpdatePostSchema = z.object({
  content: z.string().min(1).max(2200).optional(),
  visibility: z.nativeEnum(PostVisibility).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  tags: z.array(z.string().min(1).max(50)).max(30).optional(),
  isPinned: z.boolean().optional(),
})

export const GetPostsSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.nativeEnum(PostType).optional(),
  visibility: z.nativeEnum(PostVisibility).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['created', 'updated', 'likes', 'comments']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const SearchPostsSchema = z.object({
  query: z.string().min(1).optional(),
  userId: z.string().uuid().optional(),
  type: z.nativeEnum(PostType).optional(),
  tags: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(1000),
  }).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['relevance', 'created', 'likes', 'comments']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
})

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(1000).optional(),
  imageUrl: z.string().url().optional(),
})

export const GetCommentsSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  sortBy: z.enum(['created', 'likes']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export const LikePostSchema = z.object({
  postId: z.string().uuid(),
})

export const SavePostSchema = z.object({
  postId: z.string().uuid(),
})

export const SharePostSchema = z.object({
  postId: z.string().uuid(),
  sharedTo: z.nativeEnum(ShareTarget),
  message: z.string().max(500).optional(),
})

export const VotePollSchema = z.object({
  pollId: z.string().uuid(),
  optionIds: z.array(z.string().uuid()).min(1),
})

export const ReportPostSchema = z.object({
  postId: z.string().uuid(),
  reason: z.nativeEnum(PostReportReason),
  description: z.string().max(1000).optional(),
})

// Type guards
export const isPost = (post: any): post is Post => {
  return (
    typeof post === 'object' &&
    post !== null &&
    typeof post.id === 'string' &&
    typeof post.userId === 'string' &&
    typeof post.content === 'string' &&
    Object.values(PostType).includes(post.type) &&
    Object.values(PostVisibility).includes(post.visibility)
  )
}

export const isComment = (comment: any): comment is Comment => {
  return (
    typeof comment === 'object' &&
    comment !== null &&
    typeof comment.id === 'string' &&
    typeof comment.postId === 'string' &&
    typeof comment.userId === 'string' &&
    typeof comment.content === 'string'
  )
}