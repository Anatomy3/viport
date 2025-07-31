import { useState, useEffect } from 'react'
import { googleAuthService, GoogleAuthResponse } from '@/services/googleAuth'
import { useUserStore } from '@/store/userStore'
import { authApi } from '@/services/authApi'
import { User } from '@/types'

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useUserStore((state) => state.login)

  useEffect(() => {
    // Initialize Google Auth
    googleAuthService.initialize().catch((err) => {
      console.error('Failed to initialize Google Auth:', err)
      setError('Failed to initialize Google authentication')
    })
  }, [])

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Starting Google sign-in...')
      const googleResponse: GoogleAuthResponse = await googleAuthService.signInWithPopup()
      console.log('✅ Google response received:', { 
        hasIdToken: !!googleResponse.id_token,
        hasAccessToken: !!googleResponse.access_token,
        user: googleResponse.user 
      })
      
      // Send Google token to backend for verification and user creation/login
      console.log('🔍 Sending to backend...')
      const authResponse = await authApi.googleAuth({
        id_token: googleResponse.id_token,
        access_token: googleResponse.access_token
      })
      console.log('✅ Backend response received:', { 
        hasToken: !!authResponse.token,
        user: authResponse.user 
      })

      // Store JWT token from backend
      localStorage.setItem('auth_token', authResponse.token)
      
      // Store Google tokens for additional API calls if needed
      localStorage.setItem('google_access_token', googleResponse.access_token)
      if (googleResponse.id_token) {
        localStorage.setItem('google_id_token', googleResponse.id_token)
      }

      console.log('✅ Calling login function...')
      login(authResponse.user)
      console.log('✅ Login completed, returning user')
      return authResponse.user
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error)
      
      // Handle specific error cases
      if (error.message?.includes('popup_closed_by_user') || error.message?.includes('popup_blocked')) {
        setError('Google sign-in was cancelled or blocked by popup blocker')
      } else if (error.message?.includes('Client ID')) {
        setError('Google authentication not properly configured')
      } else {
        setError(error.response?.data?.error || error.message || 'Google sign-in failed')
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithOneTap = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const googleResponse: GoogleAuthResponse = await googleAuthService.signInWithOneTap()
      
      // Send Google token to backend for verification and user creation/login
      const authResponse = await authApi.googleAuth({
        id_token: googleResponse.id_token,
        access_token: googleResponse.access_token
      })

      // Store JWT token from backend
      localStorage.setItem('auth_token', authResponse.token)
      
      if (googleResponse.id_token) {
        localStorage.setItem('google_id_token', googleResponse.id_token)
      }

      login(authResponse.user)
      return authResponse.user
    } catch (error: any) {
      console.error('Google One Tap error:', error)
      setError(error.response?.data?.error || error.message || 'Google One Tap failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await googleAuthService.signOut()
      // Clear Google tokens
      localStorage.removeItem('google_access_token')
      localStorage.removeItem('google_id_token')
    } catch (error) {
      console.error('Google sign-out error:', error)
    }
  }

  return {
    isLoading,
    error,
    signInWithGoogle,
    signInWithOneTap,
    signOut,
    clearError: () => setError(null)
  }
}