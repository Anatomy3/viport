import axios from 'axios'
import { ApiResponse, User, Post, CreatePostRequest, Comment } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const userService = {
  getUsers: () => api.get<ApiResponse<User[]>>('/users'),
  getUser: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  createUser: (data: Partial<User>) => api.post<ApiResponse<User>>('/users', data),
  updateUser: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse<void>>(`/users/${id}`),
}

export const postService = {
  getFeed: (params?: { limit?: number; offset?: number; mediaType?: string }) => 
    api.get<ApiResponse<Post[]>>('/posts', { params }),
  getPost: (id: string) => api.get<ApiResponse<Post>>(`/posts/${id}`),
  createPost: (data: CreatePostRequest) => api.post<ApiResponse<Post>>('/posts', data),
  updatePost: (id: string, data: Partial<CreatePostRequest>) => 
    api.put<ApiResponse<Post>>(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete<ApiResponse<void>>(`/posts/${id}`),
  likePost: (id: string) => api.post<ApiResponse<{ postId: string; isLiked: boolean; likeCount: number }>>(`/posts/${id}/like`),
  unlikePost: (id: string) => api.delete<ApiResponse<{ postId: string; isLiked: boolean; likeCount: number }>>(`/posts/${id}/like`),
  getComments: (postId: string, params?: { limit?: number; offset?: number }) => 
    api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`, { params }),
}

export default api