import { useState, useEffect } from 'react'
import { FiX, FiImage, FiVideo, FiFileText, FiUsers, FiLock, FiGlobe } from 'react-icons/fi'
import { useUpdatePost } from '@/hooks/usePosts'
import { Post, CreatePostRequest } from '@/types'

interface EditPostProps {
  post: Post
  onClose: () => void
}

export const EditPost = ({ post, onClose }: EditPostProps) => {
  const [content, setContent] = useState(post.content || '')
  const [title, setTitle] = useState(post.title || '')
  const [mediaType, setMediaType] = useState(post.mediaType)
  const [visibility, setVisibility] = useState(post.visibility)
  const updatePostMutation = useUpdatePost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const postData: Partial<CreatePostRequest> = {
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      mediaType,
      visibility,
    }

    updatePostMutation.mutate({ id: post.id, data: postData }, {
      onSuccess: () => {
        onClose()
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Postingan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul (Opsional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tambahkan judul untuk postingan Anda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ingin Anda bagikan?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Konten:
            </label>
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

          {/* Visibility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilitas:
            </label>
            <div className="space-y-2">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                return (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      visibility === option.value
                        ? 'bg-blue-50 border border-blue-300'
                        : 'border border-gray-200 hover:bg-gray-50'
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
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatePostMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {updatePostMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}