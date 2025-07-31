'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { setTokens, clearTokens, getTokens } from '@/lib/api/client'
import type { User, AuthUser } from '@/types/api'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation()
  const registerMutation = trpc.auth.register.useMutation()
  const logoutMutation = trpc.auth.logout.useMutation()
  const refreshMutation = trpc.auth.refreshToken.useMutation()

  // tRPC query for current user
  const {
    data: currentUser,
    isLoading: isUserLoading,
    refetch: refetchUser,
    error: userError,
  } = trpc.auth.me.useQuery(undefined, {
    enabled: !!getTokens().accessToken,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.data?.httpStatus === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: any) => {
      if (error?.data?.httpStatus === 401) {
        // Token is invalid, clear it and redirect to login
        handleLogout()
      }
    },
  })

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken, refreshToken } = getTokens()
      
      if (accessToken) {
        try {
          // Try to get current user
          await refetchUser()
        } catch (error) {
          // If failed, try to refresh token
          if (refreshToken) {
            try {
              await handleRefreshToken(refreshToken)
            } catch (refreshError) {
              // Refresh failed, clear tokens
              clearTokens()
            }
          }
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [refetchUser])

  // Update user state when query data changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    } else if (userError) {
      setUser(null)
    }
  }, [currentUser, userError])

  // Login function
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setIsLoading(true)
      
      const result = await loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      })

      // Store tokens
      setTokens(result.tokens.accessToken, result.tokens.refreshToken)
      
      // Update user state
      setUser(result.user)

      toast.success('Login successful!')
      
      // Redirect to dashboard or previous page
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect')
      router.push(redirectUrl || '/dashboard')
      
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loginMutation, router])

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true)
      
      const result = await registerMutation.mutateAsync(data)

      // Store tokens
      setTokens(result.tokens.accessToken, result.tokens.refreshToken)
      
      // Update user state
      setUser(result.user)

      toast.success('Registration successful!')
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [registerMutation, router])

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout mutation (optional, for server-side cleanup)
      await logoutMutation.mutateAsync()
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.warn('Logout error:', error)
    } finally {
      handleLogout()
    }
  }, [logoutMutation])

  // Handle logout (clear state and redirect)
  const handleLogout = useCallback(() => {
    clearTokens()
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/login')
  }, [router])

  // Refresh token function
  const handleRefreshToken = useCallback(async (refreshToken: string) => {
    try {
      const result = await refreshMutation.mutateAsync({ refreshToken })
      
      // Store new tokens
      setTokens(result.accessToken, result.refreshToken)
      
      // Refetch user data
      await refetchUser()
      
      return result
    } catch (error) {
      console.error('Token refresh error:', error)
      handleLogout()
      throw error
    }
  }, [refreshMutation, refetchUser, handleLogout])

  // Refresh auth function (for manual refresh)
  const refreshAuth = useCallback(async () => {
    const { refreshToken } = getTokens()
    if (refreshToken) {
      await handleRefreshToken(refreshToken)
    } else {
      await refetchUser()
    }
  }, [handleRefreshToken, refetchUser])

  // Update user function (for profile updates)
  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [])

  // Auto-refresh token before expiration
  useEffect(() => {
    const { accessToken } = getTokens()
    
    if (accessToken && user) {
      // Decode JWT to get expiration time (simplified - you might want to use a library)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiration = expirationTime - currentTime
        
        // Refresh token 5 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0)
        
        if (refreshTime > 0) {
          const timeout = setTimeout(() => {
            const { refreshToken } = getTokens()
            if (refreshToken) {
              handleRefreshToken(refreshToken)
            }
          }, refreshTime)
          
          return () => clearTimeout(timeout)
        }
      } catch (error) {
        console.warn('Error parsing token:', error)
      }
    }
  }, [user, handleRefreshToken])

  const value: AuthContextType = {
    user,
    isLoading: isLoading || isUserLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}