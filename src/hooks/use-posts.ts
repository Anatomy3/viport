'use client'

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/client'
import { useRealTimePosts } from './use-real-time'
import { toast } from 'react-hot-toast'
import type { Post, CreatePostRequest, UpdatePostRequest } from '@/types/api'

interface UsePostsOptions {
  authorId?: string
  tags?: string[]
  limit?: number
  enableRealTime?: boolean
}

export function usePosts(options: UsePostsOptions = {}) {
  const { authorId, tags, limit = 20, enableRealTime = true } = options
  const queryClient = useQueryClient()

  // Enable real-time updates
  if (enableRealTime) {
    useRealTimePosts()
  }

  // Infinite query for posts feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.posts.list({ authorId, tags, limit }),
    queryFn: ({ pageParam = 1 }) =>
      trpc.post.getAll.query({
        page: pageParam,
        limit,
        authorId,
        tags,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasNext) return undefined
      return lastPage.pagination.page + 1
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  // Flatten posts from all pages
  const posts = data?.pages.flatMap(page => page.data || []) || []

  return {
    posts,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  }
}

export function usePost(postId: string) {
  return trpc.post.getById.useQuery(
    { id: postId },
    {
      enabled: !!postId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  )
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const result = await trpc.post.create.mutate(data)
      return result
    },
    onSuccess: () => {
      // Invalidate posts list to show new post
      invalidateQueries.posts(queryClient)
      toast.success('Post created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post')
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePostRequest) => {
      const result = await trpc.post.update.mutate(data)
      return result
    },
    onSuccess: (data, variables) => {
      // Update post in cache
      queryClient.setQueryData(queryKeys.posts.detail(variables.id), data.post)
      
      // Invalidate posts list
      invalidateQueries.posts(queryClient)
      
      toast.success('Post updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update post')
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      await trpc.post.delete.mutate({ id: postId })
    },
    onSuccess: (_, postId) => {
      // Remove post from cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) })
      
      // Invalidate posts list
      invalidateQueries.posts(queryClient)
      
      toast.success('Post deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete post')
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await trpc.post.like.mutate({ id: postId })
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) })

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId))

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          isLiked: true,
          likesCount: old.likesCount + 1,
        }
      })

      // Also update in posts list
      queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((post: Post) =>
              post.id === postId
                ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
                : post
            ),
          })),
        }
      })

      return { previousPost }
    },
    onError: (err, postId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost)
      }
      toast.error('Failed to like post')
    },
    onSettled: (_, __, postId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await trpc.post.unlike.mutate({ id: postId })
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) })

      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId))

      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          isLiked: false,
          likesCount: Math.max(0, old.likesCount - 1),
        }
      })

      // Also update in posts list
      queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((post: Post) =>
              post.id === postId
                ? { ...post, isLiked: false, likesCount: Math.max(0, post.likesCount - 1) }
                : post
            ),
          })),
        }
      })

      return { previousPost }
    },
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost)
      }
      toast.error('Failed to unlike post')
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
    },
  })

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLiking: likeMutation.isLoading,
    isUnliking: unlikeMutation.isLoading,
  }
}

export function useBookmarkPost() {
  const queryClient = useQueryClient()

  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      await trpc.post.bookmark.mutate({ id: postId })
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) })

      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId))

      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          isBookmarked: true,
        }
      })

      return { previousPost }
    },
    onSuccess: () => {
      toast.success('Post bookmarked!')
    },
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost)
      }
      toast.error('Failed to bookmark post')
    },
  })

  return {
    bookmark: bookmarkMutation.mutate,
    isBookmarking: bookmarkMutation.isLoading,
  }
}

export function useUserPosts(userId: string) {
  return trpc.post.getUserPosts.useInfiniteQuery(
    { userId, limit: 20 },
    {
      enabled: !!userId,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
    }
  )
}