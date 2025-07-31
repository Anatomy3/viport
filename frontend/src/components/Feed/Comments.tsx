import { useState } from 'react'
import { FiHeart, FiMoreHorizontal, FiSend } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { Comment } from '@/types'

interface CommentsProps {
  postId: string
  comments: Comment[]
  onAddComment: (content: string) => void
  onLikeComment: (commentId: string) => void
  onDeleteComment?: (commentId: string) => void
}

export const Comments = ({ 
  postId, 
  comments, 
  onAddComment, 
  onLikeComment, 
  onDeleteComment 
}: CommentsProps) => {
  const [newComment, setNewComment] = useState('')
  const [showMenu, setShowMenu] = useState<string | null>(null)

  // Mock current user
  const currentUserId = 'user-1'

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'baru saja'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j`
    return `${Math.floor(diffInMinutes / 1440)}h`
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img
              src={comment.user?.avatarUrl || '/default-avatar.png'}
              alt={comment.user?.displayName || comment.user?.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {comment.user?.displayName || comment.user?.username}
                  </span>
                  {comment.user?.isVerified && (
                    <span className="text-blue-500 text-xs">✓</span>
                  )}
                  <span className="text-gray-500 text-xs">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-900 break-words">
                  {comment.content}
                </p>
              </div>
              
              {/* Comment Actions */}
              <div className="flex items-center space-x-4 mt-1 ml-3">
                <button
                  onClick={() => onLikeComment(comment.id)}
                  className={`flex items-center space-x-1 text-xs ${
                    comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  } transition-colors`}
                >
                  {comment.isLiked ? <FaHeart size={12} /> : <FiHeart size={12} />}
                  {comment.likeCount > 0 && (
                    <span>{comment.likeCount}</span>
                  )}
                </button>
                
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Balas
                </button>
                
                {comment.user?.id === currentUserId && onDeleteComment && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiMoreHorizontal size={12} />
                    </button>
                    
                    {showMenu === comment.id && (
                      <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                        <button
                          onClick={() => {
                            onDeleteComment(comment.id)
                            setShowMenu(null)
                          }}
                          className="w-full px-3 py-1 text-left text-xs text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex space-x-3">
        <img
          src="/default-avatar.png"
          alt="Your avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  )
}