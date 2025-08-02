import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUserStore } from '@/store/userStore'
import { User } from '@/types'
import { loginSchema, type LoginFormData } from '@/schemas/authSchemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { OAuthProviders } from '@/components/auth/OAuthProviders'
import { showToast } from '@/components/ui/Toast'
import { SecurityNotifications, SecurityBadge } from '@/components/auth/SecurityNotifications'
import { RateLimitNotification, LoginAttemptCounter } from '@/components/auth/RateLimitNotification'
import { RateLimiter, sanitizeInput } from '@/utils/security'

export const Login = () => {
  const [oauthLoading, setOauthLoading] = useState<{ google?: boolean, github?: boolean }>({})
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [rateLimiter] = useState(() => new RateLimiter(5, 15 * 60 * 1000)) // 5 attempts per 15 minutes
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    // Check rate limiting
    const userIdentifier = sanitizeInput(data.email)
    if (!rateLimiter.isAllowed(userIdentifier)) {
      const remainingTime = rateLimiter.getRemainingTime(userIdentifier)
      const minutes = Math.ceil(remainingTime / 60000)
      showToast.error(`Too many login attempts. Please try again in ${minutes} minutes.`)
      return
    }

    try {
      // Simulate API call with better loading state
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(data.email)
      const sanitizedPassword = data.password // Don't sanitize password content
      
      // Simulate email validation
      if (sanitizedEmail === 'demo@example.com' && sanitizedPassword === 'password123') {
        const user: User = {
          id: 'user-1',
          username: sanitizedEmail.split('@')[0],
          email: sanitizedEmail,
          firstName: 'Demo',
          lastName: 'User',
          displayName: 'Demo User',
          avatarUrl: '/default-avatar.png',
          isVerified: true,
          isCreator: false,
          verificationLevel: 'email',
          accountType: 'personal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        login(user)
        showToast.success('Welcome back! Login successful.')
        
        // Store remember me preference securely
        if (data.rememberMe) {
          localStorage.setItem('remember_me', 'true')
          localStorage.setItem('remember_user', JSON.stringify({ email: sanitizedEmail }))
        }
        
        // Reset login attempts on successful login
        setLoginAttempts(0)
        rateLimiter.reset(userIdentifier)
        
        navigate('/beranda')
      } else if (sanitizedEmail.includes('@') && sanitizedPassword.length >= 8) {
        // Simulate successful login for any valid email/password combo
        const user: User = {
          id: 'user-1',
          username: sanitizedEmail.split('@')[0],
          email: sanitizedEmail,
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          avatarUrl: '/default-avatar.png',
          isVerified: false,
          isCreator: false,
          verificationLevel: 'email',
          accountType: 'personal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        login(user)
        showToast.success('Welcome back! Login successful.')
        
        // Reset login attempts on successful login
        setLoginAttempts(0)
        rateLimiter.reset(userIdentifier)
        
        navigate('/beranda')
      } else {
        // Increment login attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        
        setError('root', {
          message: 'Invalid email or password. Try demo@example.com / password123'
        })
        showToast.error('Invalid credentials. Please check your email and password.')
      }
    } catch (error) {
      // Increment login attempts on error
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      
      setError('root', {
        message: 'Login failed. Please try again.'
      })
      showToast.error('Login failed. Please try again.')
    }
  }

  const handleGoogleLogin = async () => {
    setOauthLoading({ ...oauthLoading, google: true })
    
    try {
      showToast.info('Redirecting to Google...')
      
      // Use secure OAuth service
      const { useSecureOAuth } = await import('@/services/secureOAuth')
      const { initiateGoogleOAuth } = useSecureOAuth()
      
      await initiateGoogleOAuth()
    } catch (error: any) {
      showToast.error(error.message || 'Google login failed')
      setOauthLoading({ ...oauthLoading, google: false })
    }
  }

  const handleGitHubLogin = async () => {
    setOauthLoading({ ...oauthLoading, github: true })
    
    try {
      showToast.info('Redirecting to GitHub...')
      
      // Use secure OAuth service
      const { useSecureOAuth } = await import('@/services/secureOAuth')
      const { initiateGitHubOAuth } = useSecureOAuth()
      
      await initiateGitHubOAuth()
    } catch (error: any) {
      showToast.error(error.message || 'GitHub login failed')
      setOauthLoading({ ...oauthLoading, github: false })
    }
  }

  // Load remembered user on component mount
  useEffect(() => {
    const rememberMe = localStorage.getItem('remember_me')
    if (rememberMe === 'true') {
      const rememberUser = localStorage.getItem('remember_user')
      if (rememberUser) {
        try {
          const userData = JSON.parse(rememberUser)
          if (userData.email) {
            // Pre-fill email field
            setValue('email', userData.email)
            setValue('rememberMe', true)
          }
        } catch (error) {
          // Clean up invalid data
          localStorage.removeItem('remember_user')
        }
      }
    }
  }, [setValue])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Security Notifications */}
      <SecurityNotifications />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.3"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23374151" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25"
          >
            <span className="text-white font-bold text-3xl">V</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sign in to your Viport account
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8"
        >
          {/* Security Badge */}
          <div className="flex justify-between items-center mb-6">
            <SecurityBadge />
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield size={12} />
              <span>Secure Login</span>
            </div>
          </div>

          {/* Rate Limit Notification */}
          <RateLimitNotification
            rateLimiter={rateLimiter}
            identifier={watch('email') || 'anonymous'}
            className="mb-6"
          />

          {/* Error Message */}
          <AnimatePresence>
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: 3, duration: 0.5 }}
                >
                  ⚠️
                </motion.div>
                <span className="font-medium">{errors.root.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Attempt Counter */}
          <LoginAttemptCounter
            attempts={loginAttempts}
            maxAttempts={5}
            className="mb-6"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                autoComplete="email"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Input
                {...register('password')}
                label="Password"
                isPassword
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <Checkbox
                {...register('rememberMe')}
                label="Remember me"
              />
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                icon={!isSubmitting ? <ArrowRight size={18} /> : undefined}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="my-8 flex items-center"
          >
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              or continue with
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </motion.div>

          {/* OAuth Providers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <OAuthProviders
              onGoogleLogin={handleGoogleLogin}
              onGithubLogin={handleGitHubLogin}
              loading={oauthLoading}
            />
          </motion.div>

          {/* Sign up link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <span className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
            </span>
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Sign up
            </Link>
          </motion.div>
        </motion.div>

        {/* Demo Credentials Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
            <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">
              💡 Demo Credentials
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              Email: demo@example.com • Password: password123
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}