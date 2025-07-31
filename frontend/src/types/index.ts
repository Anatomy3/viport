export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  location?: string
  websiteUrl?: string
  isVerified: boolean
  isCreator: boolean
  verificationLevel: string
  accountType: string
  followerCount?: number
  followingCount?: number
  postCount?: number
  productCount?: number
  createdAt: string
  updatedAt: string
  lastActiveAt?: string
  isFollowing?: boolean
}

export interface MediaFile {
  url: string
  type: string
  thumbnail?: string
  width?: number
  height?: number
  duration?: number
  size?: number
}

export interface Post {
  id: string
  userId: string
  title?: string
  content?: string
  mediaUrls?: MediaFile[]
  mediaType: string
  visibility: string
  isFeatured: boolean
  likeCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  user?: User
  isLiked?: boolean
  isSaved?: boolean
}

export interface Comment {
  id: string
  userId: string
  commentableType: string
  commentableId: string
  content: string
  likeCount: number
  createdAt: string
  updatedAt: string
  user?: User
  isLiked?: boolean
}

export interface CreatePostRequest {
  title?: string
  content?: string
  mediaUrls?: MediaFile[]
  mediaType: string
  visibility: string
  tagNames?: string[]
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}