import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useUserStore } from '@/store/userStore'

interface GoogleOneTapProps {
  disabled?: boolean
}

export const GoogleOneTap = ({ disabled = false }: GoogleOneTapProps) => {
  const navigate = useNavigate()
  const { signInWithOneTap } = useGoogleAuth()
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  useEffect(() => {
    // Don't show One Tap if user is already authenticated or it's disabled
    if (isAuthenticated || disabled) return

    const initOneTap = async () => {
      try {
        await signInWithOneTap()
        navigate('/beranda')
      } catch (error) {
        // One Tap failed or was dismissed - this is normal behavior
        console.debug('Google One Tap not available or dismissed')
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initOneTap, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, disabled, signInWithOneTap, navigate])

  // This component doesn't render anything visible
  return null
}

export default GoogleOneTap