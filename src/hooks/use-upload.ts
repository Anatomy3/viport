'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadFile } from '@/lib/api/client'
import { toast } from 'react-hot-toast'
import type { MediaFile } from '@/types/api'

interface UploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  onProgress?: (progress: number) => void
  onSuccess?: (file: MediaFile) => void
  onError?: (error: string) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedFile: MediaFile | null
}

export function useUpload(options: UploadOptions = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
    onProgress,
    onSuccess,
    onError,
  } = options

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`)
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported')
      }

      // Upload file with progress tracking
      const response = await uploadFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, progress }))
        onProgress?.(progress)
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Upload failed')
      }

      return response.data
    },
    onMutate: () => {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedFile: null,
      })
    },
    onSuccess: (data: MediaFile) => {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFile: data,
      }))
      onSuccess?.(data)
      toast.success('File uploaded successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Upload failed'
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
      }))
      onError?.(errorMessage)
      toast.error(errorMessage)
    },
  })

  const upload = useCallback((file: File) => {
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
    })
  }, [])

  return {
    upload,
    reset,
    ...uploadState,
  }
}

// Hook for multiple file uploads
export function useMultipleUpload(options: UploadOptions = {}) {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({})

  const createUpload = useCallback((fileId: string) => {
    return useUpload({
      ...options,
      onProgress: (progress) => {
        setUploads(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress },
        }))
        options.onProgress?.(progress)
      },
      onSuccess: (file) => {
        setUploads(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            isUploading: false,
            progress: 100,
            uploadedFile: file,
          },
        }))
        options.onSuccess?.(file)
      },
      onError: (error) => {
        setUploads(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            isUploading: false,
            error,
          },
        }))
        options.onError?.(error)
      },
    })
  }, [options])

  const uploadFiles = useCallback((files: File[]) => {
    files.forEach((file, index) => {
      const fileId = `${file.name}-${index}-${Date.now()}`
      setUploads(prev => ({
        ...prev,
        [fileId]: {
          isUploading: true,
          progress: 0,
          error: null,
          uploadedFile: null,
        },
      }))

      const upload = createUpload(fileId)
      upload.upload(file)
    })
  }, [createUpload])

  const reset = useCallback(() => {
    setUploads({})
  }, [])

  const isAnyUploading = Object.values(uploads).some(upload => upload.isUploading)
  const uploadedFiles = Object.values(uploads)
    .map(upload => upload.uploadedFile)
    .filter(Boolean) as MediaFile[]
  const errors = Object.values(uploads)
    .map(upload => upload.error)
    .filter(Boolean)

  return {
    uploadFiles,
    reset,
    uploads,
    isAnyUploading,
    uploadedFiles,
    errors,
  }
}