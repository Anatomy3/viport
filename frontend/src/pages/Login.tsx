import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMail, FiLock, FiLoader } from 'react-icons/fi'
import { useUserStore } from '@/store/userStore'
import { User } from '@/types'
import { TempGoogleSetup } from '@/components/TempGoogleSetup'
import { GoogleOAuthDebugger } from '@/components/GoogleOAuthDebugger'

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDebugger, setShowDebugger] = useState(false)
  const navigate = useNavigate()

  const login = useUserStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create user object based on login
      const user: User = {
        id: 'user-1',
        username: formData.email.split('@')[0],
        email: formData.email,
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
      navigate('/beranda')
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Viport account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Enter your email or username"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <a
              href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&scope=openid%20email%20profile&response_type=code&access_type=offline&prompt=select_account`}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-decoration-none"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
              Continue with Google
            </a>
            
            {/* Debug Button */}
            <button 
              type="button"
              onClick={() => setShowDebugger(true)}
              className="w-full flex items-center justify-center px-4 py-2 text-sm border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              🔧 Debug Google OAuth
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign up
            </Link>
          </div>
        </div>

        
        {/* Temporary Google Setup Helper */}
        <TempGoogleSetup />
        
        {/* OAuth Debugger */}
        {showDebugger && <GoogleOAuthDebugger />}
      </div>
    </div>
  )
}