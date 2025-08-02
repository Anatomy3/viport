import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { browserSecurityCheck, isProduction } from '@/utils/security'

interface SecurityNotificationsProps {
  className?: string
}

export const SecurityNotifications: React.FC<SecurityNotificationsProps> = ({
  className = ''
}) => {
  const [securityCheck, setSecurityCheck] = useState<{
    isSecure: boolean
    warnings: string[]
  }>({ isSecure: true, warnings: [] })
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const check = browserSecurityCheck()
    setSecurityCheck(check)
    setShowNotifications(!check.isSecure)
  }, [])

  if (!showNotifications || securityCheck.warnings.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}
      >
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Security Warnings
              </h3>
              <ul className="space-y-1">
                {securityCheck.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                    {warning}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowNotifications(false)}
                className="mt-3 text-xs font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const SecurityBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isSecure, setIsSecure] = useState(true)

  useEffect(() => {
    const { isSecure } = browserSecurityCheck()
    setIsSecure(isSecure)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
        isSecure
          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
      } ${className}`}
    >
      {isSecure ? (
        <CheckCircle size={12} />
      ) : (
        <AlertTriangle size={12} />
      )}
      <span>{isSecure ? 'Secure Connection' : 'Check Security'}</span>
    </motion.div>
  )
}

export const FeatureSecurityIndicator: React.FC<{
  features: Array<{
    name: string
    enabled: boolean
    icon: React.ReactNode
    description: string
  }>
  className?: string
}> = ({ features, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
        <Shield size={16} />
        <span>Security Features</span>
      </h4>
      {features.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            {feature.icon}
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.name}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            feature.enabled 
              ? 'bg-green-500' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
        </motion.div>
      ))}
    </div>
  )
}