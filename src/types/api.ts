// Base API Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
  timestamp: string
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  isVerified: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  website?: string
  location?: string
  birthDate?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
  }
}

export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

// Post Types
export interface Post {
  id: string
  content: string
  authorId: string
  author: User
  images?: MediaFile[]
  videos?: MediaFile[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
  visibility: 'public' | 'private' | 'friends'
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  content: string
  images?: string[]
  videos?: string[]
  tags?: string[]
  visibility?: 'public' | 'private' | 'friends'
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string
}

// Comment Types
export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  parentId?: string
  replies?: Comment[]
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  content: string
  postId: string
  parentId?: string
}

// Media Types
export interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video' | 'document'
  filename: string
  size: number
  mimeType: string
  alt?: string
  createdAt: string
}

export interface UploadResponse {
  file: MediaFile
  uploadUrl?: string
}

// Portfolio Types
export interface Portfolio {
  id: string
  title: string
  description: string
  userId: string
  user: User
  sections: PortfolioSection[]
  theme: string
  customCSS?: string
  isPublic: boolean
  slug: string
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioSection {
  id: string
  type: 'hero' | 'about' | 'projects' | 'skills' | 'contact' | 'custom'
  title: string
  content: any
  order: number
  isVisible: boolean
}

export interface CreatePortfolioRequest {
  title: string
  description: string
  theme?: string
  isPublic?: boolean
  slug?: string
}

// Shop/Marketplace Types
export interface Product {
  id: string
  title: string
  description: string
  price: number
  currency: string
  images: MediaFile[]
  category: string
  tags: string[]
  sellerId: string
  seller: User
  inventory: number
  status: 'active' | 'inactive' | 'sold_out'
  rating: number
  reviewsCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  category: string
  tags?: string[]
  inventory: number
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  user: User
  items: CartItem[]
  totalAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Follow/Social Types
export interface Follow {
  id: string
  followerId: string
  follower: User
  followingId: string
  following: User
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'order' | 'system'
  title: string
  message: string
  userId: string
  fromUserId?: string
  fromUser?: User
  relatedId?: string
  isRead: boolean
  createdAt: string
}

// Search Types
export interface SearchRequest {
  query: string
  type?: 'users' | 'posts' | 'products' | 'portfolios'
  filters?: Record<string, any>
  page?: number
  limit?: number
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string
  searchTime: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'notification' | 'like' | 'comment' | 'follow' | 'chat' | 'system'
  data: any
  timestamp: string
  userId?: string
}

// Filter and Sort Types
export interface PostFilters {
  authorId?: string
  tags?: string[]
  fromDate?: string
  toDate?: string
  visibility?: 'public' | 'private' | 'friends'
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Analytics Types
export interface AnalyticsData {
  views: number
  likes: number
  comments: number
  shares: number
  followers: number
  period: 'day' | 'week' | 'month' | 'year'
  data: Array<{
    date: string
    value: number
  }>
}