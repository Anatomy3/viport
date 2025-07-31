import { useState } from 'react'
import { FiRefreshCw, FiFilter } from 'react-icons/fi'
import { useFeed } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import { CreatePost } from './CreatePost'

export const Feed = () => {
  const [mediaFilter, setMediaFilter] = useState<string>('')
  const { data: posts, isLoading, error, refetch } = useFeed({ 
    limit: 20, 
    mediaType: mediaFilter || undefined 
  })

  const mediaFilters = [
    { value: '', label: 'Semua' },
    { value: 'text', label: 'Teks' },
    { value: 'image', label: 'Gambar' },
    { value: 'video', label: 'Video' },
    { value: 'mixed', label: 'Campuran' },
  ]

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 mb-4">Gagal memuat beranda</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <FiFilter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Konten:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mediaFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setMediaFilter(filter.value)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                mediaFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <CreatePost />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-40 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts && posts.length > 0 ? (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada postingan</h3>
            <p className="text-gray-500 mb-4">
              Jadilah orang pertama yang membagikan sesuatu!
            </p>
          </div>
        )
      )}

      {/* Load More Button - Placeholder */}
      {posts && posts.length > 0 && (
        <div className="text-center py-6">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  )
}