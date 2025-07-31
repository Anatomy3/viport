'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/providers/websocket-provider'
import { queryKeys, invalidateQueries, optimisticUpdates } from '@/lib/react-query/client'
import { toast } from 'react-hot-toast'

// Hook for real-time post updates
export function useRealTimePosts() {
  const { subscribe } = useWebSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribePostCreate = subscribe('post_created', (data: any) => {
      // Invalidate posts list to show new post
      invalidateQueries.posts(queryClient)
      
      // Show notification if it's not from current user
      if (data.author && data.author.id !== data.currentUserId) {
        toast.success(`${data.author.username} created a new post`)
      }
    })

    const unsubscribePostUpdate = subscribe('post_updated', (data: any) => {
      // Update specific post in cache
      queryClient.setQueryData(queryKeys.posts.detail(data.id), data)
      
      // Invalidate posts list
      invalidateQueries.posts(queryClient)
    })

    const unsubscribePostDelete = subscribe('post_deleted', (data: any) => {
      // Remove post from cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(data.id) })
      
      // Invalidate posts list
      invalidateQueries.posts(queryClient)
    })

    const unsubscribePostLike = subscribe('post_liked', (data: any) => {
      // Optimistically update post like status
      optimisticUpdates.likePost(queryClient, data.postId, true)
    })

    const unsubscribePostUnlike = subscribe('post_unliked', (data: any) => {
      // Optimistically update post like status
      optimisticUpdates.likePost(queryClient, data.postId, false)
    })

    return () => {
      unsubscribePostCreate()
      unsubscribePostUpdate()
      unsubscribePostDelete()
      unsubscribePostLike()
      unsubscribePostUnlike()
    }
  }, [subscribe, queryClient])
}

// Hook for real-time comment updates
export function useRealTimeComments(postId: string) {
  const { subscribe } = useWebSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribeCommentCreate = subscribe('comment_created', (data: any) => {
      if (data.postId === postId) {
        // Invalidate comments for this post
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
        
        // Update post comment count
        queryClient.setQueryData(queryKeys.posts.detail(postId), (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            commentsCount: oldData.commentsCount + 1,
          }
        })
      }
    })

    const unsubscribeCommentDelete = subscribe('comment_deleted', (data: any) => {
      if (data.postId === postId) {
        // Invalidate comments for this post
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
        
        // Update post comment count
        queryClient.setQueryData(queryKeys.posts.detail(postId), (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            commentsCount: Math.max(0, oldData.commentsCount - 1),
          }
        })
      }
    })

    return () => {
      unsubscribeCommentCreate()
      unsubscribeCommentDelete()
    }
  }, [subscribe, queryClient, postId])
}

// Hook for real-time user updates
export function useRealTimeUser(userId?: string) {
  const { subscribe } = useWebSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribeUserUpdate = subscribe('user_updated', (data: any) => {
      if (!userId || data.id === userId) {
        // Update user data in cache
        queryClient.setQueryData(queryKeys.users.detail(data.id), data)
        
        // If it's the current user, also update auth data
        if (data.isCurrentUser) {
          queryClient.setQueryData(queryKeys.auth.me, data)
        }
      }
    })

    const unsubscribeUserFollow = subscribe('user_followed', (data: any) => {
      if (data.followingId === userId) {
        // Update user follower count
        optimisticUpdates.followUser(queryClient, data.followingId, true)
        
        // Invalidate followers list
        queryClient.invalidateQueries({ queryKey: queryKeys.users.followers(data.followingId) })
      }
    })

    const unsubscribeUserUnfollow = subscribe('user_unfollowed', (data: any) => {
      if (data.followingId === userId) {
        // Update user follower count
        optimisticUpdates.followUser(queryClient, data.followingId, false)
        
        // Invalidate followers list
        queryClient.invalidateQueries({ queryKey: queryKeys.users.followers(data.followingId) })
      }
    })

    return () => {
      unsubscribeUserUpdate()
      unsubscribeUserFollow()
      unsubscribeUserUnfollow()
    }
  }, [subscribe, queryClient, userId])
}

// Hook for real-time notifications
export function useRealTimeNotifications() {
  const { subscribe } = useWebSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribeNotification = subscribe('notification', (data: any) => {
      // Add new notification to cache
      queryClient.setQueryData(queryKeys.notifications.all, (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: [data, ...oldData.data],
        }
      })
      
      // Invalidate unread notifications count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread })
      
      // Show toast notification
      toast(data.message, {
        icon: getNotificationIcon(data.type),
      })
    })

    const unsubscribeNotificationRead = subscribe('notification_read', (data: any) => {
      // Update notification in cache
      queryClient.setQueryData(queryKeys.notifications.all, (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((notification: any) =>
            notification.id === data.id
              ? { ...notification, isRead: true }
              : notification
          ),
        }
      })
      
      // Invalidate unread notifications count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread })
    })

    return () => {
      unsubscribeNotification()
      unsubscribeNotificationRead()
    }
  }, [subscribe, queryClient])
}

// Hook for real-time typing indicators
export function useRealTimeTyping(conversationId?: string) {
  const { subscribe, sendMessage } = useWebSocket()
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const startTyping = useCallback(() => {
    if (conversationId) {
      sendMessage({
        type: 'typing_start',
        conversationId,
      })
    }
  }, [sendMessage, conversationId])

  const stopTyping = useCallback(() => {
    if (conversationId) {
      sendMessage({
        type: 'typing_stop',
        conversationId,
      })
    }
  }, [sendMessage, conversationId])

  useEffect(() => {
    const unsubscribeTypingStart = subscribe('typing_start', (data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => 
          prev.includes(data.userId) ? prev : [...prev, data.userId]
        )
      }
    })

    const unsubscribeTypingStop = subscribe('typing_stop', (data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId))
      }
    })

    return () => {
      unsubscribeTypingStart()
      unsubscribeTypingStop()
    }
  }, [subscribe, conversationId])

  return {
    typingUsers,
    startTyping,
    stopTyping,
  }
}

// Helper function to get notification icon
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'like':
      return '❤️'
    case 'comment':
      return '💬'
    case 'follow':
      return '👤'
    case 'mention':
      return '@'
    case 'order':
      return '🛒'
    case 'system':
      return '🔔'
    default:
      return '📢'
  }
}