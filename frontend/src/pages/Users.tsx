import { useState } from 'react'
import { FiSearch, FiFilter, FiUsers as FiUsersIcon } from 'react-icons/fi'
import { useUsers } from '@/hooks/useUsers'

export const Users = () => {
  const { data: users, isLoading, error } = useUsers()
  const [searchQuery, setSearchQuery] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')

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

  const filteredUsers = users?.filter(user => {
    const matchesSearch = (user.displayName || user.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAccountType = accountTypeFilter === 'all' || user.accountType === accountTypeFilter
    
    return matchesSearch && matchesAccountType
  }) || []

  const accountTypes = ['all', 'personal', 'business', 'creator']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <FiUsersIcon size={20} />
          <span>{users?.length || 0} pengguna</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter size={16} className="text-gray-500" />
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {accountTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Semua Tipe' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.displayName || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {user.displayName || user.username}
                    </h3>
                    {user.isVerified && (
                      <span className="text-blue-500 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">{user.email}</p>
                {user.bio && (
                  <p className="text-gray-600 line-clamp-2">{user.bio}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-xs text-gray-500">
                    {user.followerCount !== undefined && (
                      <span>{user.followerCount} pengikut</span>
                    )}
                    {user.postCount !== undefined && (
                      <span>{user.postCount} postingan</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.accountType === 'creator' 
                      ? 'bg-purple-100 text-purple-700'
                      : user.accountType === 'business'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.accountType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiUsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna ditemukan</h3>
          <p className="text-gray-500">
            {searchQuery || accountTypeFilter !== 'all' 
              ? 'Coba ubah filter pencarian Anda.'
              : 'Belum ada pengguna yang terdaftar.'
            }
          </p>
        </div>
      )}
    </div>
  )
}