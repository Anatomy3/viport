import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Shield, AlertTriangle } from 'lucide-react'
import { passwordSecurityCheck } from '@/utils/security'

interface PasswordStrengthIndicatorProps {
  password: string
  showDetails?: boolean
  className?: string
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true,
  className = ''
}) => {
  const { isSecure, issues, score } = passwordSecurityCheck(password)
  
  if (!password) return null

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'from-red-400 to-red-600'
    if (score <= 4) return 'from-yellow-400 to-orange-500'
    return 'from-green-400 to-green-600'
  }

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak'
    if (score <= 4) return 'Medium'
    return 'Strong'
  }

  const getStrengthIcon = (score: number) => {
    if (score <= 2) return <X size={16} className="text-red-500" />
    if (score <= 4) return <AlertTriangle size={16} className="text-yellow-500" />
    return <Check size={16} className="text-green-500" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`mt-3 ${className}`}
    >
      {/* Strength Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
            {getStrengthIcon(score)}
            <span>Password Strength: {getStrengthText(score)}</span>
          </span>
          <Shield size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (score / 6) * 100)}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full bg-gradient-to-r ${getStrengthColor(score)} rounded-full`}
          />
        </div>
      </div>

      {/* Security Requirements */}
      <AnimatePresence>
        {showDetails && issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Requirements:
            </h4>
            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400"
                >
                  <X size={12} className="text-red-400 flex-shrink-0" />
                  <span>{issue}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {isSecure && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3"
          >
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Great! Your password meets all security requirements.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}