import type { ApiError } from '@/types/api'

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    FOLLOW: (id: string) => `/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/users/${id}/unfollow`,
    FOLLOWERS: (id: string) => `/users/${id}/followers`,
    FOLLOWING: (id: string) => `/users/${id}/following`,
    POSTS: (id: string) => `/users/${id}/posts`,
  },
  
  // Posts
  POSTS: {
    LIST: '/posts',
    GET: (id: string) => `/posts/${id}`,
    CREATE: '/posts',
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    UNLIKE: (id: string) => `/posts/${id}/unlike`,
    BOOKMARK: (id: string) => `/posts/${id}/bookmark`,
    UNBOOKMARK: (id: string) => `/posts/${id}/unbookmark`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
  },
  
  // Comments
  COMMENTS: {
    CREATE: '/comments',
    UPDATE: (id: string) => `/comments/${id}`,
    DELETE: (id: string) => `/comments/${id}`,
    LIKE: (id: string) => `/comments/${id}/like`,
    UNLIKE: (id: string) => `/comments/${id}/unlike`,
  },
  
  // Portfolio
  PORTFOLIO: {
    LIST: '/portfolios',
    GET: (id: string) => `/portfolios/${id}`,
    CREATE: '/portfolios',
    UPDATE: (id: string) => `/portfolios/${id}`,
    DELETE: (id: string) => `/portfolios/${id}`,
    PUBLISH: (id: string) => `/portfolios/${id}/publish`,
    UNPUBLISH: (id: string) => `/portfolios/${id}/unpublish`,
  },
  
  // Products/Shop
  PRODUCTS: {
    LIST: '/products',
    GET: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    GET: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  
  // Media/Upload
  MEDIA: {
    UPLOAD: '/media/upload',
    DELETE: (id: string) => `/media/${id}`,
    GET_UPLOAD_URL: '/media/upload-url',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    POSTS: '/search/posts',
    PRODUCTS: '/search/products',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    POSTS: '/analytics/posts',
    PORTFOLIO: '/analytics/portfolio',
    PRODUCTS: '/analytics/products',
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const

// Request Headers
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
})

export const getMultipartHeaders = (token?: string) => ({
  'Accept': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
  // Don't set Content-Type for FormData, let browser set it
})

// Error Handler
export const createApiError = (
  message: string,
  code: string,
  details?: Record<string, any>
): ApiError => ({
  message,
  code,
  details,
  timestamp: new Date().toISOString(),
})

// URL Builder
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

// Cache Keys
export const CACHE_KEYS = {
  USER: 'user',
  POSTS: 'posts',
  POST: (id: string) => `post-${id}`,
  COMMENTS: (postId: string) => `comments-${postId}`,
  PORTFOLIO: 'portfolio',
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product-${id}`,
  NOTIFICATIONS: 'notifications',
  FOLLOWERS: (userId: string) => `followers-${userId}`,
  FOLLOWING: (userId: string) => `following-${userId}`,
} as const

// Query Options
export const QUERY_OPTIONS = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY: 3,
  RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const