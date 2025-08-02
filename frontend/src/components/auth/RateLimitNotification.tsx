import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Shield, AlertCircle } from 'lucide-react'
import { RateLimiter } from '@/utils/security'

interface RateLimitNotificationProps {
  rateLimiter: RateLimiter
  identifier: string
  onReset?: () => void
  className?: string
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  rateLimiter,
  identifier,
  onReset,
  className = ''
}) => {
  const [remainingTime, setRemainingTime] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const checkRateLimit = () => {
      const remaining = rateLimiter.getRemainingTime(identifier)
      setRemainingTime(remaining)
      setIsBlocked(remaining > 0)
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 1000)

    return () => clearInterval(interval)
  }, [rateLimiter, identifier])

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!isBlocked) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                Too Many Login Attempts
              </h3>
            </div>
            
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              For security reasons, you've been temporarily blocked due to multiple failed login attempts.
            </p>
            
            <div className="flex items-center space-x-2 mb-3">
              <Clock size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Try again in: {formatTime(remainingTime)}
              </span>
            </div>
            
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
              <h4 className="text-xs font-medium text-red-800 dark:text-red-200 mb-2">
                Security Tips:
              </h4>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Double-check your email and password</li>
                <li>• Use the "Forgot Password" option if needed</li>
                <li>• Enable two-factor authentication for better security</li>
                <li>• Make sure Caps Lock is off</li>
              </ul>
            </div>
            
            {onReset && (
              <button
                onClick={onReset}
                className="mt-3 text-xs font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 transition-colors underline"
              >
                Contact Support
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const LoginAttemptCounter: React.FC<{
  attempts: number
  maxAttempts: number
  className?: string
}> = ({ attempts, maxAttempts, className = '' }) => {
  const remaining = maxAttempts - attempts
  const percentage = (attempts / maxAttempts) * 100

  if (attempts === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Login Attempts
        </span>
        <span className={`text-xs font-medium ${
          remaining <= 1 
            ? 'text-red-600 dark:text-red-400' 
            : remaining <= 2 
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {remaining} remaining
        </span>
      </div>
      
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${
            percentage >= 80 
              ? 'bg-red-500' 
              : percentage >= 60 
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        />
      </div>
      
      {remaining <= 1 && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium"
        >
          ⚠️ Last attempt before temporary lockout
        </motion.p>
      )}
    </motion.div>
  )
}