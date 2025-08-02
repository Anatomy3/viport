import React, { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start space-x-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only"
              {...props}
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center
                transition-all duration-200
                ${props.checked 
                  ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                  : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                }
                ${error ? 'border-error-500' : ''}
                group-hover:border-primary-400
                focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
                ${className}
              `}
            >
              {props.checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <div className="flex-1 min-w-0">
            {label && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </label>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error-600 ml-8"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'