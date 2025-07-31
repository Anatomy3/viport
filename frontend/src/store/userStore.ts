import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { User } from '@/types'

interface UserState {
  currentUser: User | null
  users: User[]
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  setCurrentUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  removeUser: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  login: (user: User) => void
  logout: () => void
  checkAuth: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      currentUser: null,
      users: [],
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setCurrentUser: (user) => set({ currentUser: user }),
      
      setUsers: (users) => set({ users }),
      
      addUser: (user) => 
        set((state) => ({ users: [...state.users, user] })),
      
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        })),
      
      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      login: (user) => {
        localStorage.setItem('isAuthenticated', 'true')
        // Don't overwrite auth_token - it should already be set by the auth process
        set({ currentUser: user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('google_access_token')
        localStorage.removeItem('google_id_token')
        set({ currentUser: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const isAuth = localStorage.getItem('isAuthenticated') === 'true'
        const hasToken = localStorage.getItem('auth_token')
        
        console.log('🔍 checkAuth called:', { isAuth, hasToken: !!hasToken })
        
        if (isAuth && hasToken) {
          // In a real app, you'd validate the token with the server
          // For now, we'll use dummy data if no current user is set
          const currentUser = get().currentUser
          console.log('✅ Auth valid, currentUser:', !!currentUser)
          if (!currentUser) {
            const dummyUser: User = {
              id: 'user-1',
              username: 'johndoe',
              email: 'john@viport.com',
              firstName: 'John',
              lastName: 'Doe',
              displayName: 'John Doe',
              avatarUrl: '/default-avatar.png',
              isVerified: false,
              isCreator: false,
              verificationLevel: 'email',
              accountType: 'personal',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            set({ currentUser: dummyUser, isAuthenticated: true })
          } else {
            set({ isAuthenticated: true })
          }
        } else {
          console.log('❌ Auth invalid, clearing state')
          set({ currentUser: null, isAuthenticated: false })
        }
      },
    }),
    { name: 'user-store' }
  )
)