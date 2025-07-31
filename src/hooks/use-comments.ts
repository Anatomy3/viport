'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import { queryKeys } from '@/lib/react-query/client'
import { useRealTimeComments } from './use-real-time'
import { toast } from 'react-hot-toast'
import type { CreateCommentRequest } from '@/types/api'

export function useComments(postId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  // Enable real-time updates
  useRealTimeComments(postId)

  return trpc.post.getComments.useInfiniteQuery(
    { postId, limit: 20 },
    {
      enabled: enabled && !!postId,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const result = await trpc.post.createComment.mutate(data)
      return result
    },
    onSuccess: (data, variables) => {
      // Invalidate comments for the post
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.posts.comments(variables.postId) 
      })
      
      // Update post comment count
      queryClient.setQueryData(
        queryKeys.posts.detail(variables.postId), 
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            commentsCount: oldData.commentsCount + 1,
          }
        }
      )
      
      toast.success('Comment added successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment')
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      await trpc.post.deleteComment.mutate({ id: commentId })
    },
    onSuccess: (_, commentId, context: any) => {
      // Invalidate comments query
      if (context?.postId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.posts.comments(context.postId) 
        })
        
        // Update post comment count
        queryClient.setQueryData(
          queryKeys.posts.detail(context.postId), 
          (oldData: any) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              commentsCount: Math.max(0, oldData.commentsCount - 1),
            }
          }
        )
      }
      
      toast.success('Comment deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete comment')
    },
  })
}