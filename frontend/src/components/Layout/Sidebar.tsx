import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  FiHome, FiUser, FiUsers, FiShoppingBag, FiEdit3, 
  FiSettings, FiLogOut, FiPlus, FiBarChart 
} from 'react-icons/fi'
import { useUserStore } from '@/store/userStore'
import { ConfirmationModal } from '@/components/Modals'
import { useLogout } from '@/hooks/useLogout'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/beranda', icon: FiHome, label: 'Beranda' },
  { to: '/profile', icon: FiUser, label: 'My Profile' },
  { to: '/portfolio-builder', icon: FiEdit3, label: 'Portfolio Builder' },
  { to: '/users', icon: FiUsers, label: 'Users' },
  { to: '/shop', icon: FiShoppingBag, label: 'Digital Shop' },
  { to: '/posts', icon: FiEdit3, label: 'Posts' },
  { to: '/create-post', icon: FiPlus, label: 'Create Post' },
  { to: '/analytics', icon: FiBarChart, label: 'Analytics' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
]

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { currentUser } = useUserStore()
  const { performLogout, isLoading: isLoggingOut } = useLogout()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    await performLogout()
    
    if (window.innerWidth < 1024) {
      onClose()
    }
    
    setShowLogoutConfirm(false)
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto lg:flex lg:flex-col
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Viport</span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => window.innerWidth < 1024 && onClose()}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {currentUser?.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.displayName || currentUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser size={20} className="text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.displayName || currentUser?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.email || 'user@viport.com'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogoutClick}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message={`Apakah Anda yakin ingin keluar dari akun ${currentUser?.displayName || currentUser?.email || 'Anda'}? Anda perlu login kembali untuk mengakses aplikasi.`}
        confirmText="Ya, Logout"
        cancelText="Batal"
        confirmColor="red"
        icon="warning"
        isLoading={isLoggingOut}
      />
    </>
  )
}