import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/config'
import type { RegisterRequest, AuthResponse } from '@/types/api'

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    ),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Forward request to Go backend
    const response = await api.post<AuthResponse, RegisterRequest>(
      API_ENDPOINTS.AUTH.REGISTER,
      validatedData
    )

    if (!response.success || !response.data) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Registration failed' 
        },
        { status: 400 }
      )
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Registration successful',
    })

  } catch (error: any) {
    console.error('Registration API error:', error)

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

    // Handle conflict errors (email/username already exists)
    if (error.code === 'CONFLICT') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email or username already exists' 
        },
        { status: 409 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Registration failed' 
      },
      { status: 500 }
    )
  }
}