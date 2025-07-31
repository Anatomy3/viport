import { useState } from 'react'
import { FiHeart, FiMessageCircle, FiShare, FiBookmark, FiMoreHorizontal, FiEdit3, FiTrash2 } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { Post, Comment } from '@/types'
import { useLikePost, useDeletePost } from '@/hooks/usePosts'
import { EditPost } from './EditPost'
import { Comments } from './Comments'

interface PostCardProps {
  post: Post
}

export const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()

  // Mock current user - in real app this would come from auth context
  const currentUserId = 'user-1'
  const isOwner = post.user?.id === currentUserId

  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: 'comment-1',
      userId: 'user-2',
      commentableType: 'post',
      commentableId: post.id,
      content: 'This is amazing! Love the design 😍',
      likeCount: 5,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: {
        id: 'user-2',
        username: 'emma_designer',
        email: 'emma@example.com',
        displayName: 'Emma Wilson',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        isVerified: false,
        isCreator: true,
        verificationLevel: 'email',
        accountType: 'creator',
        createdAt: '',
        updatedAt: '',
      },
      isLiked: false,
    },
    {
      id: 'comment-2',
      userId: 'user-3',
      commentableType: 'post',
      commentableId: post.id,
      content: 'Great work! Can you share some tips about your creative process?',
      likeCount: 3,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: {
        id: 'user-3',
        username: 'mike_photo',
        email: 'mike@example.com',
        displayName: 'Mike Rodriguez',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        isVerified: true,
        isCreator: true,
        verificationLevel: 'creator',
        accountType: 'creator',
        createdAt: '',
        updatedAt: '',
      },
      isLiked: true,
    },
  ]

  const handleLike = () => {
    likePostMutation.mutate({ id: post.id, isLiked: !!post.isLiked })
  }

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      deletePostMutation.mutate(post.id)
    }
    setShowMenu(false)
  }

  const handleToggleComments = () => {
    setShowComments(!showComments)
    // Load comments when opening for the first time
    if (!showComments && comments.length === 0) {
      setComments(mockComments)
    }
  }

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      commentableType: 'post',
      commentableId: post.id,
      content,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: currentUserId,
        username: 'current_user',
        email: 'user@example.com',
        displayName: 'You',
        avatarUrl: '/default-avatar.png',
        isVerified: false,
        isCreator: false,
        verificationLevel: 'email',
        accountType: 'personal',
        createdAt: '',
        updatedAt: '',
      },
      isLiked: false,
    }
    setComments([...comments, newComment])
  }

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1
          }
        : comment
    ))
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId))
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.avatarUrl || '/default-avatar.png'}
            alt={post.user?.displayName || post.user?.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm">
                {post.user?.displayName || post.user?.username}
              </span>
              {post.user?.isVerified && (
                <span className="text-blue-500 text-xs">✓</span>
              )}
            </div>
            <span className="text-gray-500 text-xs">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FiMoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setShowEditModal(true)
                      setShowMenu(false)
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiEdit3 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deletePostMutation.isPending}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiTrash2 size={16} />
                    <span>{deletePostMutation.isPending ? 'Menghapus...' : 'Hapus'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span>Laporkan</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span>Sembunyikan</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 text-sm leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Media - Placeholder for now */}
      {post.mediaType !== 'text' && (
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">
              {post.mediaType === 'image' ? '🖼️' : 
               post.mediaType === 'video' ? '🎥' : '📁'}
            </div>
            <p className="text-sm">Media ({post.mediaType})</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                post.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
              } transition-colors`}
              disabled={likePostMutation.isPending}
            >
              {post.isLiked ? <FaHeart size={20} /> : <FiHeart size={20} />}
            </button>
            <button
              onClick={handleToggleComments}
              className="text-gray-700 hover:text-blue-500 transition-colors"
            >
              <FiMessageCircle size={20} />
            </button>
            <button className="text-gray-700 hover:text-green-500 transition-colors">
              <FiShare size={20} />
            </button>
          </div>
          <button className="text-gray-700 hover:text-yellow-500 transition-colors">
            <FiBookmark size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-2 space-y-1">
          {post.likeCount > 0 && (
            <p className="font-semibold text-sm">{post.likeCount.toLocaleString()} suka</p>
          )}
          {post.viewCount > 0 && (
            <p className="text-gray-500 text-xs">{post.viewCount.toLocaleString()} tayangan</p>
          )}
        </div>

        {/* Comments Preview */}
        {(post.commentCount > 0 || comments.length > 0) && (
          <button
            onClick={handleToggleComments}
            className="text-gray-500 text-sm mt-1 hover:text-gray-700"
          >
            {showComments 
              ? 'Sembunyikan komentar'
              : `Lihat ${post.commentCount || comments.length} komentar`
            }
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-4">
          <Comments
            postId={post.id}
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPost
          post={post}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}