'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import { queryKeys, optimisticUpdates } from '@/lib/react-query/client'
import { useRealTimeUser } from './use-real-time'
import { toast } from 'react-hot-toast'
import type { User } from '@/types/api'

export function useUser(userId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  // Enable real-time updates
  useRealTimeUser(userId)

  return trpc.user.getById.useQuery(
    { id: userId },
    {
      enabled: enabled && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )
}

export function useUsers(options: { 
  search?: string
  limit?: number
  enabled?: boolean 
} = {}) {
  const { search, limit = 20, enabled = true } = options

  return trpc.user.getAll.useInfiniteQuery(
    { search, limit },
    {
      enabled,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  )
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string } & Partial<User>) => {
      const result = await trpc.user.update.mutate(data)
      return result
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data.user)
      
      // If it's the current user, also update auth data
      queryClient.setQueryData(queryKeys.auth.me, (oldData: any) => {
        if (oldData?.id === variables.id) {
          return { ...oldData, ...data.user }
        }
        return oldData
      })
      
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export function useFollowUser() {
  const queryClient = useQueryClient()

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      await trpc.user.follow.mutate({ id: userId })
    },
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) })

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId))

      // Optimistically update
      optimisticUpdates.followUser(queryClient, userId, true)

      return { previousUser }
    },
    onError: (err, userId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser)
      }
      toast.error('Failed to follow user')
    },
    onSettled: (_, __, userId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.followers(userId) })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      await trpc.user.unfollow.mutate({ id: userId })
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) })

      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId))

      optimisticUpdates.followUser(queryClient, userId, false)

      return { previousUser }
    },
    onError: (err, userId, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser)
      }
      toast.error('Failed to unfollow user')
    },
    onSettled: (_, __, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.followers(userId) })
    },
  })

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing: followMutation.isLoading,
    isUnfollowing: unfollowMutation.isLoading,
  }
}

export function useUserFollowers(userId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return trpc.user.getFollowers.useInfiniteQuery(
    { userId, limit: 20 },
    {
      enabled: enabled && !!userId,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
    }
  )
}

export function useUserFollowing(userId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return trpc.user.getFollowing.useInfiniteQuery(
    { userId, limit: 20 },
    {
      enabled: enabled && !!userId,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
    }
  )
}

export function useSearchUsers(query: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return trpc.user.search.useQuery(
    { query, limit: 20 },
    {
      enabled: enabled && !!query && query.length >= 2,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}