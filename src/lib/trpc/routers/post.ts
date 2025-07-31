import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { api } from '../../api/client'
import { API_ENDPOINTS } from '../../api/config'
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  CreateCommentRequest,
  PaginatedResponse,
} from '@/types/api'

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Post content too long'),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'friends']).default('public'),
})

const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid('Invalid post ID'),
})

const postFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  authorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
  sortBy: z.enum(['createdAt', 'likesCount', 'commentsCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  postId: z.string().uuid('Invalid post ID'),
  parentId: z.string().uuid().optional(),
})

export const postRouter = router({
  // Get posts with pagination and filters
  getAll: publicProcedure
    .input(postFiltersSchema)
    .query(async ({ input }) => {
      try {
        const response = await api.get<PaginatedResponse<Post>>(
          API_ENDPOINTS.POSTS.LIST,
          { params: input }
        )

        if (!response.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: response.error || 'Failed to fetch posts',
          })
        }

        return response
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch posts',
        })
      }
    }),

  // Get single post by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid('Invalid post ID') }))
    .query(async ({ input }) => {
      try {
        const response = await api.get<Post>(API_ENDPOINTS.POSTS.GET(input.id))

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          })
        }

        return response.data
      } catch (error: any) {
        if (error.code === 'NOT_FOUND') {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch post',
        })
      }
    }),

  // Create new post
  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.post<Post, CreatePostRequest>(
          API_ENDPOINTS.POSTS.CREATE,
          input
        )

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to create post',
          })
        }

        return {
          post: response.data,
          message: 'Post created successfully',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create post',
        })
      }
    }),

  // Update post
  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input
        const response = await api.put<Post, Partial<CreatePostRequest>>(
          API_ENDPOINTS.POSTS.UPDATE(id),
          updateData
        )

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to update post',
          })
        }

        return {
          post: response.data,
          message: 'Post updated successfully',
        }
      } catch (error: any) {
        if (error.code === 'NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          })
        }
        if (error.code === 'FORBIDDEN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only edit your own posts',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update post',
        })
      }
    }),

  // Delete post
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid('Invalid post ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.delete(API_ENDPOINTS.POSTS.DELETE(input.id))

        if (!response.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to delete post',
          })
        }

        return {
          message: 'Post deleted successfully',
        }
      } catch (error: any) {
        if (error.code === 'NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          })
        }
        if (error.code === 'FORBIDDEN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own posts',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to delete post',
        })
      }
    }),

  // Like post
  like: protectedProcedure
    .input(z.object({ id: z.string().uuid('Invalid post ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.post(API_ENDPOINTS.POSTS.LIKE(input.id))

        if (!response.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to like post',
          })
        }

        return {
          message: 'Post liked successfully',
        }
      } catch (error: any) {
        if (error.code === 'NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to like post',
        })
      }
    }),

  // Unlike post
  unlike: protectedProcedure
    .input(z.object({ id: z.string().uuid('Invalid post ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.post(API_ENDPOINTS.POSTS.UNLIKE(input.id))

        if (!response.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to unlike post',
          })
        }

        return {
          message: 'Post unliked successfully',
        }
      } catch (error: any) {
        if (error.code === 'NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to unlike post',
        })
      }
    }),

  // Bookmark post
  bookmark: protectedProcedure
    .input(z.object({ id: z.string().uuid('Invalid post ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.post(API_ENDPOINTS.POSTS.BOOKMARK(input.id))

        if (!response.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to bookmark post',
          })
        }

        return {
          message: 'Post bookmarked successfully',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to bookmark post',
        })
      }
    }),

  // Get post comments
  getComments: publicProcedure
    .input(z.object({
      postId: z.string().uuid('Invalid post ID'),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      try {
        const response = await api.get<PaginatedResponse<Comment>>(
          API_ENDPOINTS.POSTS.COMMENTS(input.postId),
          { params: { page: input.page, limit: input.limit } }
        )

        if (!response.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: response.error || 'Failed to fetch comments',
          })
        }

        return response
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch comments',
        })
      }
    }),

  // Create comment
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.post<Comment, CreateCommentRequest>(
          API_ENDPOINTS.COMMENTS.CREATE,
          input
        )

        if (!response.success || !response.data) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to create comment',
          })
        }

        return {
          comment: response.data,
          message: 'Comment created successfully',
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create comment',
        })
      }
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string().uuid('Invalid comment ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await api.delete(API_ENDPOINTS.COMMENTS.DELETE(input.id))

        if (!response.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: response.error || 'Failed to delete comment',
          })
        }

        return {
          message: 'Comment deleted successfully',
        }
      } catch (error: any) {
        if (error.code === 'FORBIDDEN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own comments',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to delete comment',
        })
      }
    }),

  // Get user's posts
  getUserPosts: publicProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID'),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      try {
        const response = await api.get<PaginatedResponse<Post>>(
          API_ENDPOINTS.USERS.POSTS(input.userId),
          { params: { page: input.page, limit: input.limit } }
        )

        if (!response.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: response.error || 'Failed to fetch user posts',
          })
        }

        return response
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user posts',
        })
      }
    }),
})