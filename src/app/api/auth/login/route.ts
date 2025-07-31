import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/config'
import type { LoginRequest, AuthResponse } from '@/types/api'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Forward request to Go backend
    const response = await api.post<AuthResponse, LoginRequest>(
      API_ENDPOINTS.AUTH.LOGIN,
      validatedData
    )

    if (!response.success || !response.data) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Login failed' 
        },
        { status: 400 }
      )
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Login successful',
    })

  } catch (error: any) {
    console.error('Login API error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Handle API errors
    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Login failed' 
      },
      { status: 500 }
    )
  }
}