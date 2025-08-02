import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield, Wifi, WifiOff } from 'lucide-react'
import { Login } from '@/pages/Login'

interface MobileOptimizedLoginProps {
  className?: string
}

export const MobileOptimizedLogin: React.FC<MobileOptimizedLoginProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    // Detect device type
    const detectDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
      
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Viewport change monitoring
    const handleResize = () => detectDevice()
    const handleOrientationChange = () => {
      setTimeout(detectDevice, 100) // Delay to get accurate dimensions
    }

    detectDevice()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  const isMobile = deviceType === 'mobile'
  const isTablet = deviceType === 'tablet'

  if (!isMobile && !isTablet) {
    return <Login />
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 ${className}`}>
      {/* Mobile Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 safe-area-top">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <h1 className="font-semibold text-gray-900 dark:text-gray-100">Sign In</h1>
          
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi size={16} className="text-green-500" />
            ) : (
              <WifiOff size={16} className="text-red-500" />
            )}
            <Shield size={16} className="text-primary-500" />
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 left-4 right-4 z-40 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <WifiOff size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                No internet connection. Please check your network.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-16 pb-8 px-4 safe-area-bottom">
        {isMobile && orientation === 'landscape' ? (
          <MobileLandscapeLogin />
        ) : (
          <MobilePortraitLogin />
        )}
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

const MobilePortraitLogin: React.FC = () => {
  return (
    <div className="max-w-sm mx-auto space-y-6">
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue
        </p>
      </motion.div>

      {/* Login Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <Login />
      </motion.div>
    </div>
  )
}

const MobileLandscapeLogin: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto h-full items-center">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-bold text-3xl">V</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Viport
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your creative platform
        </p>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <Login />
      </motion.div>
    </div>
  )
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  if (!showInstallPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 bg-primary-600 text-white rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Install Viport</h3>
            <p className="text-sm opacity-90">Add to home screen for quick access</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 text-sm rounded bg-primary-700 hover:bg-primary-800 transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              className="px-3 py-1 text-sm rounded bg-white text-primary-600 hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}