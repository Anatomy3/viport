'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@viport/ui'
import { AuthUser, AuthTokens } from '@viport/types'
import { ViportAPIClient } from '@viport/api-client'

interface AuthContextType {
  user: AuthUser | null
  tokens: AuthTokens | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (data: {
    email: string
    password: string
    username: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create API client instance
const apiClient = new ViportAPIClient(
  {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tokens, setTokens] = useLocalStorage<AuthTokens | null>('viport_tokens', null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      if (tokens?.accessToken) {
        try {
          // Set tokens in API client
          apiClient.setTokens(tokens)
          
          // Verify token and get user data
          const userData = await apiClient.get<AuthUser>('/auth/me')
          setUser(userData)
        } catch (error) {
          console.error('Failed to verify authentication:', error)
          // Clear invalid tokens
          setTokens(null)
          apiClient.clearTokens()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [tokens, setTokens])

  // Setup API client token refresh callback
  useEffect(() => {
    const originalConfig = apiClient['config']
    apiClient['config'] = {
      ...originalConfig,
      onTokenRefresh: (newTokens: AuthTokens) => {
        setTokens(newTokens)
      },
      onUnauthorized: () => {
        logout()
      },
    }
  }, [setTokens])

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.post<{
        user: AuthUser
        tokens: AuthTokens
      }>('/auth/login', {
        email,
        password,
        rememberMe,
      })

      setUser(response.user)
      setTokens(response.tokens)
      apiClient.setTokens(response.tokens)

      // Redirect to dashboard or intended page
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect')
      router.push(redirectUrl || '/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    username: string
    firstName?: string
    lastName?: string
  }) => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.post<{
        user: AuthUser
        tokens: AuthTokens
      }>('/auth/register', {
        ...data,
        termsAccepted: true,
      })

      setUser(response.user)
      setTokens(response.tokens)
      apiClient.setTokens(response.tokens)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    apiClient.clearTokens()
    router.push('/login')
  }

  const refreshUser = async () => {
    if (!tokens?.accessToken) return

    try {
      const userData = await apiClient.get<AuthUser>('/auth/me')
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
    isAuthenticated: !!user && !!tokens,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}