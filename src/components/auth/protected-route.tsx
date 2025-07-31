'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { LoadingPage } from '@/components/ui/loading'
import { UnauthorizedError } from '@/components/ui/error'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin' | 'moderator'
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRole = 'user',
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
    }
  }, [isLoading, isAuthenticated, redirectTo, router])

  // Show loading state
  if (isLoading) {
    return <LoadingPage message="Checking authentication..." />
  }

  // Show unauthorized error if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <UnauthorizedError
        onLogin={() => {
          const currentPath = window.location.pathname
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }}
      />
    )
  }

  // Check role if required
  if (requiredRole && user) {
    const hasRequiredRole = (() => {
      switch (requiredRole) {
        case 'admin':
          return user.role === 'admin'
        case 'moderator':
          return user.role === 'admin' || user.role === 'moderator'
        case 'user':
        default:
          return true
      }
    })()

    if (!hasRequiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="mt-4 text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

interface RequireAuthProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  return (
    <ProtectedRoute fallback={fallback} redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}

interface RequireAdminProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback} redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}

interface GuestOnlyProps {
  children: React.ReactNode
  redirectTo?: string
}

export function GuestOnly({ children, redirectTo = '/dashboard' }: GuestOnlyProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, redirectTo, router])

  // Show loading state
  if (isLoading) {
    return <LoadingPage />
  }

  // If user is authenticated, don't render children (will redirect)
  if (user) {
    return null
  }

  return <>{children}</>
}