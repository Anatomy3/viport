import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { showToast } from '@/components/ui/Toast'

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

        // Validate OAuth state and code for security
        const { useSecureOAuth } = await import('@/services/secureOAuth')
        const { validateOAuthCallback } = useSecureOAuth()
        
        if (!validateOAuthCallback('google', state || '', code)) {
          throw new Error('Invalid OAuth state or authorization code')
        }

        // Processing Google OAuth callback

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
        showToast.success('Successfully signed in with Google!')
        
        setStatus('success')
        
        // Navigate to beranda after short delay
        setTimeout(() => {
          navigate('/beranda')
        }, 1500)

      } catch (error: any) {
        const errorMessage = error.message || 'Authentication failed'
        setError(errorMessage)
        setStatus('error')
        showToast.error(errorMessage)
        
        // Navigate back to login after delay
        setTimeout(() => {
          navigate('/login')
        }, 4000)
      }
    }

    handleGoogleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f1f5f9\" fill-opacity=\"0.3\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23374151\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]\" />\n\n      <motion.div\n        initial={{ opacity: 0, scale: 0.95 }}\n        animate={{ opacity: 1, scale: 1 }}\n        transition={{ duration: 0.5 }}\n        className=\"relative max-w-md w-full text-center z-10\"\n      >\n        <div className=\"bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8\">\n          <motion.div\n            initial={{ scale: 0 }}\n            animate={{ scale: 1 }}\n            transition={{ delay: 0.2, type: \"spring\", stiffness: 200 }}\n            className=\"w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25\"\n          >\n            <span className=\"text-white font-bold text-3xl\">V</span>\n          </motion.div>\n          \n          {status === 'loading' && (\n            <motion.div\n              initial={{ opacity: 0, y: 20 }}\n              animate={{ opacity: 1, y: 0 }}\n              className=\"space-y-4\"\n            >\n              <h1 className=\"text-2xl font-bold text-gray-900 dark:text-gray-100\">\n                Completing Sign-in...\n              </h1>\n              <motion.div\n                animate={{ rotate: 360 }}\n                transition={{ duration: 1, repeat: Infinity, ease: \"linear\" }}\n                className=\"mx-auto\"\n              >\n                <Loader2 size={32} className=\"text-primary-600\" />\n              </motion.div>\n              <p className=\"text-gray-600 dark:text-gray-400\">\n                Please wait while we complete your Google sign-in\n              </p>\n            </motion.div>\n          )}\n          \n          {status === 'success' && (\n            <motion.div\n              initial={{ opacity: 0, scale: 0.8 }}\n              animate={{ opacity: 1, scale: 1 }}\n              transition={{ delay: 0.1, type: \"spring\" }}\n              className=\"space-y-4\"\n            >\n              <motion.div\n                initial={{ scale: 0 }}\n                animate={{ scale: 1 }}\n                transition={{ delay: 0.3, type: \"spring\", stiffness: 200 }}\n              >\n                <CheckCircle size={48} className=\"text-success-500 mx-auto\" />\n              </motion.div>\n              <h1 className=\"text-2xl font-bold text-success-600 dark:text-success-400\">\n                Success!\n              </h1>\n              <p className=\"text-gray-600 dark:text-gray-400\">\n                Sign-in completed successfully. Redirecting to your dashboard...\n              </p>\n            </motion.div>\n          )}\n          \n          {status === 'error' && (\n            <motion.div\n              initial={{ opacity: 0, scale: 0.8 }}\n              animate={{ opacity: 1, scale: 1 }}\n              transition={{ delay: 0.1, type: \"spring\" }}\n              className=\"space-y-4\"\n            >\n              <motion.div\n                initial={{ scale: 0 }}\n                animate={{ scale: 1 }}\n                transition={{ delay: 0.3, type: \"spring\", stiffness: 200 }}\n              >\n                <XCircle size={48} className=\"text-error-500 mx-auto\" />\n              </motion.div>\n              <h1 className=\"text-2xl font-bold text-error-600 dark:text-error-400\">\n                Authentication Error\n              </h1>\n              <p className=\"text-error-600 dark:text-error-400 text-sm font-medium\">\n                {error}\n              </p>\n              <p className=\"text-gray-600 dark:text-gray-400 text-sm\">\n                Redirecting back to login page...\n              </p>\n            </motion.div>\n          )}\n        </div>\n      </motion.div>\n    </div>\n  )
}