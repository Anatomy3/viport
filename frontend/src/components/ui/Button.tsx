import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'social'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium
    rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `

  const variants = {
    primary: `
      bg-primary-600 hover:bg-primary-700 text-white
      focus:ring-primary-500 shadow-md hover:shadow-lg
      dark:bg-primary-500 dark:hover:bg-primary-600
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 text-gray-900
      focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600
      dark:text-gray-100
    `,
    outline: `
      border border-gray-300 hover:bg-gray-50 text-gray-700
      focus:ring-primary-500 dark:border-gray-600 dark:hover:bg-gray-800
      dark:text-gray-200
    `,
    ghost: `
      hover:bg-gray-100 text-gray-700
      focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-200
    `,
    social: `
      border border-gray-300 hover:bg-gray-50 text-gray-700
      focus:ring-primary-500 shadow-sm hover:shadow-md
      dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-200
      bg-white dark:bg-gray-900
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm space-x-2',
    md: 'px-4 py-3 text-base space-x-2',
    lg: 'px-6 py-4 text-lg space-x-3'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-current opacity-10 rounded-xl"
        />
      )}
      
      {loading ? (
        <Loader2 size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">
          {React.cloneElement(icon as React.ReactElement, {
            size: size === 'sm' ? 16 : size === 'md' ? 18 : 20
          })}
        </span>
      ) : null}
      
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  )
}