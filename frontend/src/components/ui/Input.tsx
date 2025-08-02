import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  isPassword?: boolean
  strength?: {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    feedback: string[]
  }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, isPassword, strength, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const getStrengthColor = (level: string) => {
      switch (level) {
        case 'weak': return 'bg-error-500'
        case 'fair': return 'bg-warning-500'
        case 'good': return 'bg-primary-500'
        case 'strong': return 'bg-success-500'
        default: return 'bg-gray-300'
      }
    }

    const getStrengthWidth = (score: number) => {
      return `${(score / 7) * 100}%`
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
            className={`
              w-full px-4 py-3 
              ${icon ? 'pl-10' : ''} 
              ${isPassword ? 'pr-12' : ''} 
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600 
              rounded-xl
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
              dark:focus:ring-primary-400 dark:focus:border-primary-400
              outline-none 
              transition-all duration-200
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
              ${className}
            `}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Password Strength Indicator */}
        {isPassword && strength && props.value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Password strength</span>
              <span className={`font-medium capitalize ${
                strength.level === 'weak' ? 'text-error-600' :
                strength.level === 'fair' ? 'text-warning-600' :
                strength.level === 'good' ? 'text-primary-600' :
                'text-success-600'
              }`}>
                {strength.level}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: getStrengthWidth(strength.score) }}
                transition={{ duration: 0.3 }}
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.level)}`}
              />
            </div>
            
            {strength.feedback.length > 0 && (
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {strength.feedback.map((feedback, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{feedback}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-error-600 text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'