import { z } from 'zod'
import { Timestamps, SoftDelete, UserPreferences, Location } from './common'
import { UserRole } from './auth'

// User types
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  website?: string
  location?: Location
  isEmailVerified: boolean
  isActive: boolean
  isVerified: boolean // Creator/business verification
  role: UserRole
  preferences: UserPreferences
  stats: UserStats
  socialLinks?: SocialLinks
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface UserProfile extends User {
  // Additional profile-specific fields
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing?: boolean
  isFollowedBy?: boolean
  isBlocked?: boolean
  mutualFollowersCount?: number
}

export interface UserStats {
  postsCount: number
  followersCount: number
  followingCount: number
  likesReceived: number
  productsCount: number
  portfolioViews: number
  profileViews: number
}

export interface SocialLinks {
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  website?: string
  github?: string
  behance?: string
  dribbble?: string
}

// User request/response types
export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  displayName?: string
  bio?: string
  website?: string
  location?: Location
  socialLinks?: SocialLinks
}

export interface UpdateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: {
    email?: boolean
    push?: boolean
    inApp?: boolean
  }
}

export interface UpdateAvatarRequest {
  avatarUrl: string
}

export interface UpdateCoverImageRequest {
  coverImageUrl: string
}

export interface SearchUsersRequest {
  query?: string
  role?: UserRole
  isVerified?: boolean
  location?: {
    latitude: number
    longitude: number
    radius: number // in km
  }
  sortBy?: 'relevance' | 'followers' | 'created' | 'activity'
  sortOrder?: 'asc' | 'desc'
}

export interface GetUsersRequest {
  role?: UserRole
  isVerified?: boolean
  isActive?: boolean
  sortBy?: 'created' | 'updated' | 'followers' | 'posts'
  sortOrder?: 'asc' | 'desc'
}

export interface FollowUserRequest {
  userId: string
}

export interface UnfollowUserRequest {
  userId: string
}

export interface BlockUserRequest {
  userId: string
  reason?: string
}

export interface UnblockUserRequest {
  userId: string
}

export interface ReportUserRequest {
  userId: string
  reason: ReportReason
  description?: string
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  FAKE_ACCOUNT = 'fake_account',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  IMPERSONATION = 'impersonation',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SELF_HARM = 'self_harm',
  OTHER = 'other'
}

// User validation schemas
export const UpdateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    behance: z.string().url().optional().or(z.literal('')),
    dribbble: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export const UpdateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).optional(),
})

export const UpdateAvatarSchema = z.object({
  avatarUrl: z.string().url('Invalid avatar URL'),
})

export const UpdateCoverImageSchema = z.object({
  coverImageUrl: z.string().url('Invalid cover image URL'),
})

export const SearchUsersSchema = z.object({
  query: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isVerified: z.boolean().optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(1000),
  }).optional(),
  sortBy: z.enum(['relevance', 'followers', 'created', 'activity']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const GetUsersSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['created', 'updated', 'followers', 'posts']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const FollowUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const UnfollowUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const BlockUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  reason: z.string().max(500).optional(),
})

export const UnblockUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const ReportUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  reason: z.nativeEnum(ReportReason),
  description: z.string().max(1000).optional(),
})

// Type guards
export const isUser = (user: any): user is User => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.username === 'string' &&
    typeof user.isEmailVerified === 'boolean' &&
    typeof user.isActive === 'boolean' &&
    Object.values(UserRole).includes(user.role)
  )
}

export const isUserProfile = (profile: any): profile is UserProfile => {
  return (
    isUser(profile) &&
    typeof profile.postsCount === 'number' &&
    typeof profile.followersCount === 'number' &&
    typeof profile.followingCount === 'number'
  )
}