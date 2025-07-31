import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/api'
import { User } from '@/types'
import { useUserStore } from '@/store/userStore'

export const useUsers = () => {
  const { setLoading, setError } = useUserStore()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      setLoading(true)
      try {
        const response = await userService.getUsers()
        setError(null)
        return response.data.data
      } catch (error: any) {
        setError(error.message || 'Failed to fetch users')
        throw error
      } finally {
        setLoading(false)
      }
    },
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await userService.getUser(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  const { addUser } = useUserStore()

  return useMutation({
    mutationFn: (userData: Partial<User>) => userService.createUser(userData),
    onSuccess: (response) => {
      const newUser = response.data.data
      addUser(newUser)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useUserStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (response, { id }) => {
      const updatedUser = response.data.data
      updateUser(id, updatedUser)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  const { removeUser } = useUserStore()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      removeUser(id)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}