import { useState } from 'react'
import { FiPlus, FiEdit3, FiTrash2, FiHeart, FiMessageCircle, FiShare2, FiMoreVertical, FiEye } from 'react-icons/fi'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  status: 'published' | 'draft' | 'archived'
  category: string
  tags: string[]
  likes: number
  comments: number
  views: number
  isLiked?: boolean
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with React and TypeScript',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    excerpt: 'Learn how to set up a React project with TypeScript for better type safety and developer experience.',
    author: { name: 'John Doe' },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: 'published',
    category: 'Tutorial',
    tags: ['React', 'TypeScript', 'Frontend'],
    likes: 42,
    comments: 8,
    views: 234,
    isLiked: false
  },
  {
    id: '2',
    title: 'Building Scalable Node.js Applications',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    excerpt: 'Best practices for building and maintaining large-scale Node.js applications in production.',
    author: { name: 'Jane Smith' },
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    status: 'published',
    category: 'Backend',
    tags: ['Node.js', 'Backend', 'Scalability'],
    likes: 67,
    comments: 12,
    views: 456,
    isLiked: true
  },
  {
    id: '3',
    title: 'Modern CSS Techniques for 2024',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    excerpt: 'Explore the latest CSS features and techniques that will improve your web development workflow.',
    author: { name: 'Bob Johnson' },
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    status: 'draft',
    category: 'Design',
    tags: ['CSS', 'Frontend', 'Design'],
    likes: 23,
    comments: 5,
    views: 123,
    isLiked: false
  }
]

export const Posts = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const categories = ['all', 'Tutorial', 'Backend', 'Frontend', 'Design', 'News']
  const statuses = ['all', 'published', 'draft', 'archived']

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId))
    }
  }

  const PostModal = ({ post, onClose, onSave }: { 
    post?: Post | null
    onClose: () => void
    onSave: (postData: Partial<Post>) => void
  }) => {
    const [formData, setFormData] = useState({
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      category: post?.category || 'Tutorial',
      status: post?.status || 'draft',
      tags: post?.tags?.join(', ') || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })
      onClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Brief description of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' | 'archived' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Separate tags with commas"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {post ? 'Update Post' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog posts</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus size={16} />
          <span>New Post</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {posts.reduce((sum, post) => sum + post.views, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-gray-500">{post.category}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-3">{post.excerpt}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                      post.isLiked ? 'text-red-500' : ''
                    }`}
                  >
                    <FiHeart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <FiMessageCircle size={16} />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiEye size={16} />
                    <span>{post.views}</span>
                  </div>
                  <span>by {post.author.name}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <FiEdit3 size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <FiShare2 size={16} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiMoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiEdit3 size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <PostModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(postData) => {
            const newPost: Post = {
              id: Date.now().toString(),
              ...postData,
              author: { name: 'Current User' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              likes: 0,
              comments: 0,
              views: 0,
              isLiked: false
            } as Post
            setPosts([newPost, ...posts])
          }}
        />
      )}

      {editingPost && (
        <PostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(postData) => {
            setPosts(posts.map(post => 
              post.id === editingPost.id 
                ? { ...post, ...postData, updatedAt: new Date().toISOString() }
                : post
            ))
          }}
        />
      )}
    </div>
  )
}