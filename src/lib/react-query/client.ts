import { QueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Query client configuration
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache time - data stays in cache for 10 minutes
        cacheTime: 10 * 60 * 1000,
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Background refetch interval (5 minutes)
        refetchInterval: 5 * 60 * 1000,
        // Only refetch in background if window is focused
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Don't retry mutations by default
        retry: false,
        // Global error handler for mutations
        onError: (error: any) => {
          const message = error?.message || 'An error occurred'
          toast.error(message)
        },
      },
    },
  })
}

// Singleton query client instance
let queryClient: QueryClient | undefined

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}

// Query keys factory
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    posts: (id: string) => ['users', id, 'posts'] as const,
    followers: (id: string) => ['users', id, 'followers'] as const,
    following: (id: string) => ['users', id, 'following'] as const,
  },
  
  // Posts
  posts: {
    all: ['posts'] as const,
    list: (filters: Record<string, any>) => ['posts', 'list', filters] as const,
    detail: (id: string) => ['posts', id] as const,
    comments: (id: string) => ['posts', id, 'comments'] as const,
    userPosts: (userId: string) => ['posts', 'user', userId] as const,
  },
  
  // Portfolio
  portfolio: {
    all: ['portfolio'] as const,
    detail: (id: string) => ['portfolio', id] as const,
    user: (userId: string) => ['portfolio', 'user', userId] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    list: (filters: Record<string, any>) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', id] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  
  // Media
  media: {
    all: ['media'] as const,
  },
  
  // Analytics
  analytics: {
    dashboard: ['analytics', 'dashboard'] as const,
    posts: ['analytics', 'posts'] as const,
    portfolio: ['analytics', 'portfolio'] as const,
    products: ['analytics', 'products'] as const,
  },
} as const

// Cache invalidation helpers
export const invalidateQueries = {
  auth: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
  },
  
  posts: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
  },
  
  post: (queryClient: QueryClient, postId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
  },
  
  userPosts: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.userPosts(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.users.posts(userId) })
  },
  
  user: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
  },
  
  notifications: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread })
  },
}

// Optimistic update helpers
export const optimisticUpdates = {
  likePost: (queryClient: QueryClient, postId: string, isLiked: boolean) => {
    queryClient.setQueryData(queryKeys.posts.detail(postId), (oldData: any) => {
      if (!oldData) return oldData
      
      return {
        ...oldData,
        isLiked,
        likesCount: oldData.likesCount + (isLiked ? 1 : -1),
      }
    })
  },
  
  followUser: (queryClient: QueryClient, userId: string, isFollowing: boolean) => {
    queryClient.setQueryData(queryKeys.users.detail(userId), (oldData: any) => {
      if (!oldData) return oldData
      
      return {
        ...oldData,
        isFollowing,
        followersCount: oldData.followersCount + (isFollowing ? 1 : -1),
      }
    })
  },
}

// Prefetch helpers
export const prefetchQueries = {
  post: async (queryClient: QueryClient, postId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.detail(postId),
      // Add your post fetching function here
    })
  },
  
  user: async (queryClient: QueryClient, userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      // Add your user fetching function here
    })
  },
}