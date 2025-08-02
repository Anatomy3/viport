'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Button, Avatar } from '@viport/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@viport/ui'

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    title: 'Sunset Over the Mountains',
    description: 'Captured this beautiful sunset during my hiking trip last weekend. The colors were absolutely stunning!',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    ],
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      username: 'sarahj_photo',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    stats: {
      likes: 234,
      comments: 18,
      shares: 5,
    },
    tags: ['photography', 'nature', 'sunset'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    title: 'Digital Art Experiment',
    description: 'Playing around with some new digital painting techniques. What do you think of this abstract piece?',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    ],
    author: {
      id: 'user2',
      name: 'Mike Chen',
      username: 'mikechenart',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    stats: {
      likes: 156,
      comments: 12,
      shares: 3,
    },
    tags: ['digitalart', 'abstract', 'experiment'],
    createdAt: new Date('2024-01-14T15:45:00Z'),
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    title: 'Street Photography Collection',
    description: 'Some shots from my morning walk through downtown. Love how the light hits the buildings.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=600&fit=crop',
    ],
    author: {
      id: 'user3',
      name: 'Alex Rivera',
      username: 'alexr_street',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    stats: {
      likes: 89,
      comments: 7,
      shares: 2,
    },
    tags: ['street', 'photography', 'urban'],
    createdAt: new Date('2024-01-13T08:20:00Z'),
    isLiked: false,
    isBookmarked: false,
  },
]

interface Post {
  id: string
  title: string
  description: string
  images: string[]
  author: {
    id: string
    name: string
    username: string
    avatar: string
  }
  stats: {
    likes: number
    comments: number
    shares: number
  }
  tags: string[]
  createdAt: Date
  isLiked: boolean
  isBookmarked: boolean
}

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
}

function PostCard({ post, onLike, onBookmark, onEdit, onDelete }: PostCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img src={post.author.avatar} alt={post.author.name} />
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(post.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{post.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative">
          <div className="aspect-square bg-muted">
            <img
              src={post.images[currentImageIndex]}
              alt={`${post.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image navigation */}
          {post.images.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              {currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  ←
                </button>
              )}
              
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  →
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
              onClick={() => onLike(post.id)}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.stats.likes}
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {post.stats.comments}
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              {post.stats.shares}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={post.isBookmarked ? 'text-primary' : ''}
            onClick={() => onBookmark(post.id)}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PostsFeed() {
  const [posts, setPosts] = useState(mockPosts)

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            stats: {
              ...post.stats,
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
            }
          }
        : post
    ))
  }

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ))
  }

  const handleEdit = (postId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit post:', postId)
  }

  const handleDelete = (postId: string) => {
    // TODO: Implement delete functionality with confirmation
    const confirmed = window.confirm('Are you sure you want to delete this post?')
    if (confirmed) {
      setPosts(posts.filter(post => post.id !== postId))
    }
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}