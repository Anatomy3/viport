'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileImage, FileVideo, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading'
import { useUpload } from '@/hooks/use-upload'
import type { MediaFile } from '@/types/api'

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  onUpload?: (files: MediaFile[]) => void
  onRemove?: (file: MediaFile) => void
  className?: string
  disabled?: boolean
}

export function FileUpload({
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    'video/*': ['.mp4', '.webm'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  onUpload,
  onRemove,
  className,
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])

  const { upload, isUploading, progress, error, uploadedFile, reset } = useUpload({
    maxSize,
    allowedTypes: Object.keys(accept),
    onSuccess: (file) => {
      const newFiles = multiple ? [...uploadedFiles, file] : [file]
      setUploadedFiles(newFiles)
      onUpload?.(newFiles)
      reset()
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      upload(file)
    }
  }, [upload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false, // Handle one at a time
    disabled: disabled || isUploading,
  })

  const removeFile = (file: MediaFile) => {
    const newFiles = uploadedFiles.filter(f => f.id !== file.id)
    setUploadedFiles(newFiles)
    onRemove?.(file)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8" />
    if (type.startsWith('video/')) return <FileVideo className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          {
            'border-primary bg-primary/10': isDragActive,
            'border-muted-foreground/25 hover:border-muted-foreground/50': !isDragActive && !disabled,
            'border-muted-foreground/10 cursor-not-allowed opacity-50': disabled,
            'border-destructive bg-destructive/10': error,
          }
        )}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-2">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="text-sm text-muted-foreground">
              Uploading... {progress}%
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-sm">
                  Drag & drop a file here, or{' '}
                  <span className="text-primary font-medium">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.mimeType)}
                  <div>
                    <p className="text-sm font-medium">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ImageUploadProps {
  onUpload?: (file: MediaFile) => void
  onRemove?: () => void
  value?: MediaFile | null
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  onRemove,
  value,
  className,
  disabled = false,
}: ImageUploadProps) {
  const { upload, isUploading, progress, error, reset } = useUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    onSuccess: (file) => {
      onUpload?.(file)
      reset()
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      upload(acceptedFiles[0])
    }
  }, [upload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxSize: 5 * 1024 * 1024, // 5MB for images
    multiple: false,
    disabled: disabled || isUploading,
  })

  return (
    <div className={cn('space-y-4', className)}>
      {value ? (
        <div className="relative">
          <img
            src={value.url}
            alt={value.alt || value.filename}
            className="w-full h-48 object-cover rounded-lg border"
          />
          {!disabled && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors h-48 flex flex-col items-center justify-center',
            {
              'border-primary bg-primary/10': isDragActive,
              'border-muted-foreground/25 hover:border-muted-foreground/50': !isDragActive && !disabled,
              'border-muted-foreground/10 cursor-not-allowed opacity-50': disabled,
              'border-destructive bg-destructive/10': error,
            }
          )}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-2">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileImage className="h-12 w-12 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-sm">
                    Drag & drop an image, or{' '}
                    <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}