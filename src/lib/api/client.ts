import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  API_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  createApiError,
  getAuthHeaders,
} from './config'
import type { ApiResponse, ApiError } from '@/types/api'
import { toast } from 'react-hot-toast'

// Token management
let accessToken: string | null = null
let refreshToken: string | null = null

export const setTokens = (access: string, refresh: string) => {
  accessToken = access
  refreshToken = refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }
}

export const getTokens = () => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken')
    refreshToken = localStorage.getItem('refreshToken')
  }
  return { accessToken, refreshToken }
}

export const clearTokens = () => {
  accessToken = null
  refreshToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = getTokens()
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      
      // Add request timestamp for debugging
      config.metadata = { startTime: Date.now() }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - (response.config.metadata?.startTime || 0)
        console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`)
      }
      
      return response
    },
    async (error) => {
      const originalRequest = error.config
      
      // Handle token refresh
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          const { refreshToken: currentRefreshToken } = getTokens()
          
          if (currentRefreshToken) {
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}/auth/refresh`,
              { refreshToken: currentRefreshToken }
            )
            
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data
            setTokens(newAccessToken, newRefreshToken)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      }
      
      // Handle other errors
      const apiError = handleApiError(error)
      
      // Show toast for certain errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        toast.error(apiError.message)
      }
      
      return Promise.reject(apiError)
    }
  )

  return instance
}

// Error handler
const handleApiError = (error: any): ApiError => {
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return createApiError(
          data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
          'VALIDATION_ERROR',
          data?.details
        )
      case HTTP_STATUS.UNAUTHORIZED:
        return createApiError(
          data?.error || ERROR_MESSAGES.UNAUTHORIZED,
          'UNAUTHORIZED'
        )
      case HTTP_STATUS.FORBIDDEN:
        return createApiError(
          data?.error || ERROR_MESSAGES.FORBIDDEN,
          'FORBIDDEN'
        )
      case HTTP_STATUS.NOT_FOUND:
        return createApiError(
          data?.error || ERROR_MESSAGES.NOT_FOUND,
          'NOT_FOUND'
        )
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return createApiError(
          'Too many requests. Please try again later.',
          'RATE_LIMIT_EXCEEDED'
        )
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return createApiError(
          data?.error || ERROR_MESSAGES.SERVER_ERROR,
          'SERVER_ERROR'
        )
      default:
        return createApiError(
          data?.error || ERROR_MESSAGES.UNKNOWN,
          'UNKNOWN_ERROR'
        )
    }
  } else if (error.request) {
    return createApiError(
      ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    )
  } else if (error.code === 'ECONNABORTED') {
    return createApiError(
      ERROR_MESSAGES.TIMEOUT,
      'TIMEOUT'
    )
  } else {
    return createApiError(
      error.message || ERROR_MESSAGES.UNKNOWN,
      'UNKNOWN_ERROR'
    )
  }
}

// Create API client instance
export const apiClient = createAxiosInstance()

// Generic API methods
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config)
    return response.data
  },

  post: async <T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config)
    return response.data
  },

  put: async <T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config)
    return response.data
  },

  patch: async <T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config)
    return response.data
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config)
    return response.data
  },
}

// File upload method
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<any>> => {
  const formData = new FormData()
  formData.append('file', file)

  const { accessToken } = getTokens()
  
  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })

  return response.data
}

// Retry wrapper
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.status >= 400 && axiosError.response?.status < 500) {
          throw error
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw new Error('Max retry attempts reached')
}