import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { motion } from 'framer-motion'

// Custom toast component
const CustomToast: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onDismiss: () => void
}> = ({ type, message, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="text-success-500" size={20} />,
    error: <XCircle className="text-error-500" size={20} />,
    warning: <AlertCircle className="text-warning-500" size={20} />,
    info: <Info className="text-primary-500" size={20} />
  }

  const backgrounds = {
    success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    error: 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
    info: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`
        flex items-center space-x-3 p-4 rounded-xl border
        ${backgrounds[type]}
        shadow-lg backdrop-blur-sm
        max-w-md mx-auto
      `}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

// Toast utility functions
export const showToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="success"
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-center'
    })
  },
  
  error: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="error"
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 6000,
      position: 'top-center'
    })
  },
  
  warning: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="warning"
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 5000,
      position: 'top-center'
    })
  },
  
  info: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="info"
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-center'
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: (data) => typeof messages.success === 'function' 
        ? messages.success(data) 
        : messages.success,
      error: (error) => typeof messages.error === 'function' 
        ? messages.error(error) 
        : messages.error,
    })
  }
}

// Main Toaster component to be used in App.tsx
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  )
}