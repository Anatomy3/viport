import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  info?: string
  icon?: React.ReactNode
  isPassword?: boolean
  showStrength?: boolean
  onPasswordStrengthChange?: (score: number) => void
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    label, 
    error, 
    success, 
    info, 
    icon, 
    isPassword = false, 
    showStrength = false,
    onPasswordStrengthChange,
    className = '', 
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      
      if (showStrength && isPassword && onPasswordStrengthChange) {
        // Simple password strength calculation
        const password = e.target.value
        let score = 0
        if (password.length >= 8) score++
        if (/[a-z]/.test(password)) score++
        if (/[A-Z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^a-zA-Z0-9]/.test(password)) score++
        onPasswordStrengthChange(score)
      }
      
      if (props.onChange) {
        props.onChange(e)
      }
    }

    const getInputStateStyles = () => {
      if (error) return 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
      if (success) return 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
      return 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
    }

    const getStatusIcon = () => {
      if (error) return <AlertCircle size={18} className="text-red-500" />
      if (success) return <CheckCircle size={18} className="text-green-500" />
      if (info) return <Info size={18} className="text-blue-500" />
      return null
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        
        <div className="relative">
          {/* Input Field */}
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                {React.cloneElement(icon as React.ReactElement, { size: 18 })}
              </div>
            )}
            
            <input
              ref={ref}
              type={inputType}
              className={`
                w-full px-4 py-3 ${icon ? 'pl-11' : ''} pr-12
                bg-white dark:bg-gray-800 
                ${getInputStateStyles()}
                rounded-xl border 
                placeholder-gray-400 dark:placeholder-gray-500
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-offset-0
                transition-all duration-200
                text-base
                ${isFocused || hasValue ? 'transform scale-[1.02]' : ''}
                ${className}
              `}
              onFocus={(e) => {
                setIsFocused(true)
                if (props.onFocus) props.onFocus(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                if (props.onBlur) props.onBlur(e)
              }}
              onChange={handleChange}
              {...props}
            />

            {/* Right Side Icons */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {getStatusIcon()}
              
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* Floating Animation */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.p>
          )}
          
          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-2"
            >
              <CheckCircle size={14} />
              <span>{success}</span>
            </motion.p>
          )}
          
          {info && !error && !success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-blue-600 dark:text-blue-400 flex items-center space-x-2"
            >
              <Info size={14} />
              <span>{info}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Password Strength Indicator */}
        {showStrength && isPassword && hasValue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= (props.value as string)?.length / 2
                      ? level <= 2
                        ? 'bg-red-400'
                        : level <= 4
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'