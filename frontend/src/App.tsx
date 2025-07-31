import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout/Layout'
import { PortfolioBuilderLayout } from '@/components/Layout/PortfolioBuilderLayout'
import { HomePage } from '@/components/HomePage'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { GoogleCallback } from '@/pages/GoogleCallback'
import { Profile } from '@/pages/Profile'
import { PortfolioBuilder } from '@/pages/PortfolioBuilder'
import { Shop } from '@/pages/Shop'
import { Users } from '@/pages/Users'
import { Posts } from '@/pages/Posts'
import { useUserStore } from '@/store/userStore'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public Route component (redirect to beranda if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/beranda" replace />
}

function App() {
  const checkAuth = useUserStore((state) => state.checkAuth)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
    // Remove artificial delay to prevent race conditions
    setIsLoading(false)
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Viport...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Google OAuth Callback */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Portfolio Builder - Full Screen */}
        <Route path="/portfolio-builder" element={
          <ProtectedRoute>
            <PortfolioBuilderLayout>
              <PortfolioBuilder />
            </PortfolioBuilderLayout>
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/beranda" replace />} />
          <Route path="beranda" element={<HomePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="shop" element={<Shop />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="create-post" element={<Posts />} />
          <Route path="analytics" element={
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          } />
          <Route path="settings" element={
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          } />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App