import { z } from 'zod'

// API-specific types and interfaces
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  requiresAuth: boolean
  rateLimit?: {
    requests: number
    window: number // in seconds
  }
}

export interface APIError {
  code: string
  message: string
  details?: any
  statusCode: number
  timestamp: string
  path: string
  requestId: string
}

export interface APISuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    timestamp: string
    version: string
    requestId: string
    pagination?: PaginationMeta
  }
}

export interface APIErrorResponse {
  success: false
  error: APIError
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// HTTP Status Codes
export enum HTTPStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  
  // Client Error
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // Server Error
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// API Configuration
export interface APIConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  headers: Record<string, string>
}

// Request/Response interceptors
export interface RequestInterceptor {
  onRequest?: (config: any) => any | Promise<any>
  onRequestError?: (error: any) => any | Promise<any>
}

export interface ResponseInterceptor {
  onResponse?: (response: any) => any | Promise<any>
  onResponseError?: (error: any) => any | Promise<any>
}

// WebSocket types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  id: string
}

export interface WebSocketEvent {
  event: string
  data: any
  userId?: string
  roomId?: string
}

export enum WebSocketEventType {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // User events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_TYPING = 'user_typing',
  
  // Post events
  POST_CREATED = 'post_created',
  POST_LIKED = 'post_liked',
  POST_COMMENTED = 'post_commented',
  
  // Notification events
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_READ = 'notification_read',
  
  // Real-time updates
  FEED_UPDATE = 'feed_update',
  STATS_UPDATE = 'stats_update',
}

// File upload types
export interface UploadRequest {
  files: File[]
  folder?: string
  maxSize?: number
  allowedTypes?: string[]
  generateThumbnails?: boolean
}

export interface UploadResponse {
  files: UploadedFile[]
  totalSize: number
  uploadTime: number
}

export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  metadata?: Record<string, any>
}

export interface UploadProgress {
  fileId: string
  progress: number
  speed: number
  eta: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
}

// Batch operations
export interface BatchRequest<T> {
  operations: BatchOperation<T>[]
  stopOnError?: boolean
}

export interface BatchOperation<T> {
  method: 'CREATE' | 'UPDATE' | 'DELETE'
  id?: string
  data: T
}

export interface BatchResponse<T> {
  results: BatchResult<T>[]
  summary: {
    total: number
    successful: number
    failed: number
    errors: string[]
  }
}

export interface BatchResult<T> {
  success: boolean
  data?: T
  error?: string
  operation: BatchOperation<T>
}

// Search types
export interface SearchRequest {
  query: string
  filters?: SearchFilters
  facets?: string[]
  highlighting?: boolean
  suggestions?: boolean
}

export interface SearchFilters {
  [key: string]: string | number | boolean | string[] | number[]
}

export interface SearchResponse<T> {
  results: SearchResult<T>[]
  total: number
  facets?: SearchFacet[]
  suggestions?: string[]
  query: string
  searchTime: number
}

export interface SearchResult<T> {
  item: T
  score: number
  highlights?: Record<string, string[]>
}

export interface SearchFacet {
  field: string
  values: SearchFacetValue[]
}

export interface SearchFacetValue {
  value: string
  count: number
  selected: boolean
}

// Analytics types
export interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId: string
  properties: Record<string, any>
  timestamp: string
}

export interface AnalyticsConfig {
  trackPageViews: boolean
  trackClicks: boolean
  trackFormSubmissions: boolean
  trackErrors: boolean
  samplingRate: number
}

// Rate limiting
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

// Health check
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  checks: HealthCheck[]
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  responseTime?: number
  message?: string
  details?: Record<string, any>
}

// Monitoring and metrics
export interface Metrics {
  requests: RequestMetrics
  responses: ResponseMetrics
  errors: ErrorMetrics
  performance: PerformanceMetrics
}

export interface RequestMetrics {
  total: number
  perSecond: number
  perMinute: number
  byMethod: Record<string, number>
  byPath: Record<string, number>
}

export interface ResponseMetrics {
  byStatus: Record<number, number>
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
}

export interface ErrorMetrics {
  total: number
  rate: number
  byType: Record<string, number>
  recent: APIError[]
}

export interface PerformanceMetrics {
  cpu: number
  memory: number
  heap: number
  activeConnections: number
  dbConnections: number
}

// Validation schemas
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    statusCode: z.number(),
    timestamp: z.string(),
    path: z.string(),
    requestId: z.string(),
  }).optional(),
  meta: z.object({
    timestamp: z.string(),
    version: z.string(),
    requestId: z.string(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
  }).optional(),
})

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.any()).optional(),
  facets: z.array(z.string()).optional(),
  highlighting: z.boolean().default(false),
  suggestions: z.boolean().default(false),
})

// Type guards
export const isAPISuccessResponse = <T>(response: any): response is APISuccessResponse<T> => {
  return response && response.success === true && 'data' in response
}

export const isAPIErrorResponse = (response: any): response is APIErrorResponse => {
  return response && response.success === false && 'error' in response
}

export const isValidAPIResponse = (response: any): response is APIResponse => {
  return isAPISuccessResponse(response) || isAPIErrorResponse(response)
}