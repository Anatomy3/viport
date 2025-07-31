import { useUsers } from '@/hooks/useUsers'
import { User } from '@/types'

interface UserCardProps {
  user: User
}

const UserCard = ({ user }: UserCardProps) => (
  <div className="card">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.displayName || user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <span className="text-primary-600 font-semibold text-lg">
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {user.displayName || user.username}
        </h3>
        <p className="text-gray-600">{user.email}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {user.accountType}
          </span>
          {user.isVerified && (
            <span className="text-blue-500 text-xs">✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  </div>
)

export const UserList = () => {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-600">
          <p>Error loading users: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          <p>No users found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}