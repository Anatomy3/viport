import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useUserStore()
  const { signOut: googleSignOut } = useGoogleAuth()
  const [isLoading, setIsLoading] = useState(false)

  const performLogout = async () => {
    setIsLoading(true)
    
    try {
      // Sign out from Google if user used Google OAuth
      await googleSignOut()
    } catch (error) {
      console.error('Google sign out error:', error)
    }
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Clear app state
    logout()
    
    // Navigate to login
    navigate('/login')
    
    setIsLoading(false)
  }

  return {
    performLogout,
    isLoading
  }
}