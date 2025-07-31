import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiVideo, FiFile } from 'react-icons/fi'
import { MediaFile } from '@/types'

interface FileUploadProps {
  onFilesChange: (files: MediaFile[]) => void
  mediaType: string
  maxFiles?: number
}

export const FileUpload = ({ onFilesChange, mediaType, maxFiles = 5 }: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = {
    image: 'image/*',
    video: 'video/*',
    mixed: 'image/*,video/*'
  }

  const handleFiles = (files: FileList) => {
    const newFiles: MediaFile[] = []
    
    Array.from(files).forEach((file) => {
      if (uploadedFiles.length + newFiles.length >= maxFiles) return
      
      // Create object URL untuk preview
      const url = URL.createObjectURL(file)
      const mediaFile: MediaFile = {
        url,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
      }
      
      // Untuk image, dapatkan dimensi
      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          mediaFile.width = img.width
          mediaFile.height = img.height
          URL.revokeObjectURL(img.src)
        }
        img.src = url
      }
      
      newFiles.push(mediaFile)
    })
    
    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
    // Revoke object URL untuk mencegah memory leak
    URL.revokeObjectURL(uploadedFiles[index].url)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const getFileIcon = (type: string) => {
    if (type === 'image') return <FiImage size={20} />
    if (type === 'video') return <FiVideo size={20} />
    return <FiFile size={20} />
  }

  if (mediaType === 'text') return null

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes[mediaType as keyof typeof acceptedTypes]}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <FiUpload size={32} className="text-gray-400" />
          <div>
            <p className="text-gray-600">
              Seret file ke sini atau{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                pilih file
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {mediaType === 'image' && 'PNG, JPG, GIF hingga 10MB'}
              {mediaType === 'video' && 'MP4, MOV, AVI hingga 100MB'}
              {mediaType === 'mixed' && 'Gambar atau video'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            File yang diunggah ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      {getFileIcon(file.type)}
                      <span className="text-xs mt-2">Video</span>
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <FiX size={14} />
                </button>
                
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                  {file.size && (
                    <p>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  )}
                  {file.width && file.height && (
                    <p>{file.width} × {file.height}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}