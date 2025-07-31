import { useState } from 'react'
import { FiImage, FiVideo, FiFileText, FiUsers, FiLock, FiGlobe } from 'react-icons/fi'
import { useCreatePost } from '@/hooks/usePosts'
import { CreatePostRequest, MediaFile } from '@/types'
import { FileUpload } from './FileUpload'

export const CreatePost = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState<string>('text')
  const [visibility, setVisibility] = useState<string>('public')
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const createPostMutation = useCreatePost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && uploadedFiles.length === 0) return

    const postData: CreatePostRequest = {
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      mediaUrls: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      mediaType,
      visibility,
    }

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        setContent('')
        setTitle('')
        setUploadedFiles([])
        setIsOpen(false)
        setMediaType('text')
        setVisibility('public')
      },
    })
  }

  const mediaTypes = [
    { value: 'text', label: 'Teks', icon: FiFileText },
    { value: 'image', label: 'Gambar', icon: FiImage },
    { value: 'video', label: 'Video', icon: FiVideo },
  ]

  const visibilityOptions = [
    { value: 'public', label: 'Publik', icon: FiGlobe, desc: 'Semua orang dapat melihat' },
    { value: 'followers', label: 'Pengikut', icon: FiUsers, desc: 'Hanya pengikut yang dapat melihat' },
    { value: 'private', label: 'Pribadi', icon: FiLock, desc: 'Hanya Anda yang dapat melihat' },
  ]

  if (!isOpen) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <img
            src="/default-avatar.png"
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-left text-gray-500 transition-colors"
          >
            Apa yang ingin Anda bagikan?
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3 mb-4">
          <img
            src="/default-avatar.png"
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul postingan (opsional)"
              className="w-full border-none outline-none text-gray-900 placeholder-gray-500 font-medium"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ingin Anda bagikan?"
              className="w-full border-none outline-none resize-none text-gray-900 placeholder-gray-500"
              rows={3}
              autoFocus
            />
          </div>
        </div>

        {/* Media Type Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Jenis Konten:</p>
          <div className="flex space-x-2">
            {mediaTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMediaType(type.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    mediaType === type.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <FileUpload
            onFilesChange={setUploadedFiles}
            mediaType={mediaType}
            maxFiles={5}
          />
        </div>

        {/* Visibility Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Visibilitas:</p>
          <div className="space-y-2">
            {visibilityOptions.map((option) => {
              const Icon = option.icon
              return (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    visibility === option.value
                      ? 'bg-blue-50 border border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-blue-600"
                  />
                  <Icon size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={(!content.trim() && uploadedFiles.length === 0) || createPostMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {createPostMutation.isPending ? 'Memposting...' : 'Posting'}
          </button>
        </div>
      </form>
    </div>
  )
}