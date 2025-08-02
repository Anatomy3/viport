import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import {
  APIResponse,
  APISuccessResponse,
  APIErrorResponse,
  isAPISuccessResponse,
  isAPIErrorResponse,
  HTTPStatus,
  RateLimitInfo,
} from '@viport/types'

export interface ViportAPIClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
  enableLogging?: boolean
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => void
  onUnauthorized?: () => void
  headers?: Record<string, string>
}

export interface TokenStorage {
  getTokens(): { accessToken?: string; refreshToken?: string }
  setTokens(tokens: { accessToken: string; refreshToken: string }): void
  clearTokens(): void
}

export class ViportAPIClient {
  private client: AxiosInstance
  private config: ViportAPIClientConfig
  private tokenStorage?: TokenStorage
  private refreshPromise?: Promise<void>

  constructor(config: ViportAPIClientConfig, tokenStorage?: TokenStorage) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      enableLogging: false,
      ...config,
    }
    this.tokenStorage = tokenStorage

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const tokens = this.tokenStorage?.getTokens()
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()

        if (this.config.enableLogging) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          })
        }

        return config
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[API] Request error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log(`[API] ${response.status} ${response.config.url}`, {
            data: response.data,
            headers: response.headers,
          })
        }

        // Extract rate limit info
        this.extractRateLimitInfo(response)

        return response
      },
      async (error: AxiosError) => {
        if (this.config.enableLogging) {
          console.error('[API] Response error:', error.response?.status, error.message)
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === HTTPStatus.UNAUTHORIZED) {
          return this.handleUnauthorizedError(error)
        }

        // Handle 429 Too Many Requests
        if (error.response?.status === HTTPStatus.TOO_MANY_REQUESTS) {
          return this.handleRateLimitError(error)
        }

        // Handle network errors with retry
        if (!error.response && this.shouldRetry(error)) {
          return this.retryRequest(error)
        }

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  private async handleUnauthorizedError(error: AxiosError): Promise<AxiosResponse> {
    const tokens = this.tokenStorage?.getTokens()
    
    if (!tokens?.refreshToken || this.refreshPromise) {
      // No refresh token or already refreshing
      this.config.onUnauthorized?.()
      return Promise.reject(this.normalizeError(error))
    }

    try {
      // Prevent multiple concurrent refresh attempts
      this.refreshPromise = this.refreshTokens(tokens.refreshToken)
      await this.refreshPromise
      this.refreshPromise = undefined

      // Retry the original request
      const originalRequest = error.config!
      return this.client.request(originalRequest)
    } catch (refreshError) {
      this.refreshPromise = undefined
      this.config.onUnauthorized?.()
      return Promise.reject(this.normalizeError(error))
    }
  }

  private async refreshTokens(refreshToken: string): Promise<void> {
    try {
      const response = await this.client.post('/auth/refresh', {
        refreshToken,
      })

      if (isAPISuccessResponse(response.data)) {
        const tokens = response.data.data
        this.tokenStorage?.setTokens(tokens)
        this.config.onTokenRefresh?.(tokens)
      } else {
        throw new Error('Failed to refresh tokens')
      }
    } catch (error) {
      this.tokenStorage?.clearTokens()
      throw error
    }
  }

  private async handleRateLimitError(error: AxiosError): Promise<AxiosResponse> {
    const retryAfter = error.response?.headers['retry-after']
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retryDelay!

    await this.delay(delay)
    return this.client.request(error.config!)
  }

  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response && // Network error
      error.code !== 'ECONNABORTED' && // Not a timeout
      (error.config as any)?._retryCount < this.config.retries!
    )
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as any
    config._retryCount = (config._retryCount || 0) + 1

    const delay = this.config.retryDelay! * Math.pow(2, config._retryCount - 1)
    await this.delay(delay)

    return this.client.request(config)
  }

  private normalizeError(error: AxiosError): Error {
    if (error.response?.data && isAPIErrorResponse(error.response.data)) {
      const apiError = error.response.data.error
      const normalizedError = new Error(apiError.message)
      ;(normalizedError as any).code = apiError.code
      ;(normalizedError as any).statusCode = apiError.statusCode
      ;(normalizedError as any).details = apiError.details
      return normalizedError
    }

    return error
  }

  private extractRateLimitInfo(response: AxiosResponse): RateLimitInfo | null {
    const headers = response.headers
    if (headers['x-ratelimit-limit']) {
      return {
        limit: parseInt(headers['x-ratelimit-limit']),
        remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
        reset: parseInt(headers['x-ratelimit-reset'] || '0'),
      }
    }
    return null
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<APIResponse<T>>(url, config)
    return this.extractData(response.data)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<APIResponse<T>>(url, data, config)
    return this.extractData(response.data)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<APIResponse<T>>(url, data, config)
    return this.extractData(response.data)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<APIResponse<T>>(url, data, config)
    return this.extractData(response.data)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<APIResponse<T>>(url, config)
    return this.extractData(response.data)
  }

  private extractData<T>(response: APIResponse<T>): T {
    if (isAPISuccessResponse(response)) {
      return response.data
    }
    
    if (isAPIErrorResponse(response)) {
      const error = new Error(response.error.message)
      ;(error as any).code = response.error.code
      ;(error as any).statusCode = response.error.statusCode
      ;(error as any).details = response.error.details
      throw error
    }

    throw new Error('Invalid API response format')
  }

  // Upload method with progress tracking
  async upload<T>(
    url: string,
    files: File[],
    options?: {
      folder?: string
      onProgress?: (progress: number) => void
    }
  ): Promise<T> {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })

    if (options?.folder) {
      formData.append('folder', options.folder)
    }

    const response = await this.client.post<APIResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          options.onProgress(progress)
        }
      },
    })

    return this.extractData(response.data)
  }

  // Batch request method
  async batch<T>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    url: string
    data?: any
  }>): Promise<T[]> {
    const response = await this.client.post<APIResponse<T[]>>('/batch', {
      requests,
    })

    return this.extractData(response.data)
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  // Set authentication tokens
  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    this.tokenStorage?.setTokens(tokens)
  }

  // Clear authentication tokens
  clearTokens(): void {
    this.tokenStorage?.clearTokens()
  }

  // Get current tokens
  getTokens(): { accessToken?: string; refreshToken?: string } {
    return this.tokenStorage?.getTokens() || {}
  }
}