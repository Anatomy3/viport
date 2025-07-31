import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/posts/create',
  '/posts/edit',
  '/portfolio/create',
  '/portfolio/edit',
  '/shop/create',
  '/shop/edit',
  '/notifications',
  '/messages',
]

// Define auth routes (should redirect to dashboard if logged in)
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// Define admin routes
const adminRoutes = [
  '/admin',
]

// API routes that don't need authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/trpc',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // Allow public API routes
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Require authentication for protected API routes
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user info to headers if needed (you'd validate JWT here)
    const response = NextResponse.next()
    response.headers.set('x-user-token', token)
    return response
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check for admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      // Here you would decode the JWT and check if user is admin
      // For now, we'll assume the token contains this info
      // In a real app, you'd validate the JWT and check user role
      try {
        // Mock admin check - replace with actual JWT validation
        const isAdmin = false // Replace with actual admin check
        
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return NextResponse.next()
  }

  // Handle auth routes (redirect to dashboard if already logged in)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}