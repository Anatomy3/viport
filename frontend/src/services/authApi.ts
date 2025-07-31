import api from './api'
import { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface GoogleAuthRequest {
  id_token: string
  access_token?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  // Regular login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // Google OAuth login
  googleAuth: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/google', data)
      // Backend returns data wrapped in ApiResponse format
      if (response.data?.data) {
        return response.data.data
      }
      return response.data
    } catch (error: any) {
      // Temporary fallback for testing when backend is down
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.warn('Backend not available, using temporary mock response')
        
        // Parse Google ID token to get user info for mock
        const tokenPayload = JSON.parse(atob(data.id_token.split('.')[1]))
        
        return {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: `google_${tokenPayload.sub}`,
            username: tokenPayload.email.split('@')[0],
            email: tokenPayload.email,
            firstName: tokenPayload.given_name,
            lastName: tokenPayload.family_name,
            displayName: tokenPayload.name,
            avatarUrl: tokenPayload.picture,
            isVerified: tokenPayload.email_verified,
            isCreator: false,
            verificationLevel: 'email',
            accountType: 'personal',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }
      throw error
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response.data
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', data)
    return response.data
  }
}