'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import { queryKeys } from '@/lib/react-query/client'
import { useRealTimeNotifications } from './use-real-time'
import { toast } from 'react-hot-toast'

export function useNotifications(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  // Enable real-time updates
  useRealTimeNotifications()

  return trpc.notification.getAll.useInfiniteQuery(
    { limit: 20 },
    {
      enabled,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNext) return undefined
        return lastPage.pagination.page + 1
      },
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export function useUnreadNotificationsCount() {
  return trpc.notification.getUnreadCount.useQuery(
    undefined,
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    }
  )
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await trpc.notification.markRead.mutate({ id: notificationId })
    },
    onMutate: async (notificationId) => {
      // Optimistically update notification
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((notification: any) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
          })),
        }
      })

      // Update unread count
      queryClient.setQueryData(queryKeys.notifications.unread, (old: any) => {
        if (typeof old === 'number') {
          return Math.max(0, old - 1)
        }
        return old
      })
    },
    onError: (error: any, notificationId) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread })
      toast.error('Failed to mark notification as read')
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await trpc.notification.markAllRead.mutate()
    },
    onMutate: async () => {
      // Optimistically update all notifications
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((notification: any) => ({
              ...notification,
              isRead: true,
            })),
          })),
        }
      })

      // Set unread count to 0
      queryClient.setQueryData(queryKeys.notifications.unread, 0)
    },
    onSuccess: () => {
      toast.success('All notifications marked as read')
    },
    onError: () => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread })
      toast.error('Failed to mark all notifications as read')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await trpc.notification.delete.mutate({ id: notificationId })
    },
    onMutate: async (notificationId) => {
      // Optimistically remove notification
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.filter((notification: any) => notification.id !== notificationId),
          })),
        }
      })
    },
    onSuccess: () => {
      toast.success('Notification deleted')
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      toast.error('Failed to delete notification')
    },
  })
}