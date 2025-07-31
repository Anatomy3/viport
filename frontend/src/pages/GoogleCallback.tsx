import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { authApi } from '@/services/authApi'

export const GoogleCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const login = useUserStore((state) => state.login)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`Google OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('No authorization code received from Google')
        }

        // Skip state verification for now (simplified implementation)

        console.log('🔍 Processing Google OAuth callback with code:', code)

        // Exchange code for tokens via backend
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            redirect_uri: `${window.location.origin}/auth/google/callback`
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to authenticate with Google')
        }

        const authData = await response.json()
        const authResponse = authData.data || authData

        // Store JWT token from backend
        localStorage.setItem('auth_token', authResponse.token)

        // Login user
        login(authResponse.user)
        
        setStatus('success')
        
        // Navigate to beranda after short delay
        setTimeout(() => {
          navigate('/beranda')
        }, 1000)

      } catch (error: any) {
        console.error('❌ Google callback error:', error)
        setError(error.message || 'Authentication failed')
        setStatus('error')
        
        // Navigate back to login after delay
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleGoogleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Completing Sign-in...</h1>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Please wait while we complete your Google sign-in</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Success!</h1>
              <p className="text-gray-600">Sign-in completed successfully. Redirecting to your dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Redirecting back to login page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}