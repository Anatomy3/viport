import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/api/client'
import { getTokens } from '@/lib/api/client'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { accessToken } = getTokens()
    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided' 
        },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File size exceeds 10MB limit' 
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File type not supported' 
        },
        { status: 400 }
      )
    }

    // Upload file to Go backend
    const response = await uploadFile(file)

    if (!response.success || !response.data) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Upload failed' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'File uploaded successfully',
    })

  } catch (error: any) {
    console.error('Upload API error:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Upload failed' 
      },
      { status: 500 }
    )
  }
}