import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService } from '@/services/api'
import { Post, CreatePostRequest } from '@/types'

export const useFeed = (params?: { limit?: number; offset?: number; mediaType?: string }) => {
  return useQuery({
    queryKey: ['feed', params],
    queryFn: () => postService.getFeed(params),
    select: (data) => data.data.data,
  })
}

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPost(id),
    select: (data) => data.data.data,
    enabled: !!id,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePostRequest) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostRequest> }) => 
      postService.updatePost(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export const useLikePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isLiked }: { id: string; isLiked: boolean }) => 
      isLiked ? postService.unlikePost(id) : postService.likePost(id),
    onSuccess: (data, variables) => {
      // Update the feed cache optimistically
      queryClient.setQueryData(['feed'], (oldData: any) => {
        if (!oldData?.data?.data) return oldData
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((post: Post) =>
              post.id === variables.id
                ? {
                    ...post,
                    isLiked: data.data.data.isLiked,
                    likeCount: data.data.data.likeCount,
                  }
                : post
            ),
          },
        }
      })
      
      // Also update individual post cache if it exists
      queryClient.setQueryData(['post', variables.id], (oldData: any) => {
        if (!oldData?.data?.data) return oldData
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              ...oldData.data.data,
              isLiked: data.data.data.isLiked,
              likeCount: data.data.data.likeCount,
            },
          },
        }
      })
    },
  })
}