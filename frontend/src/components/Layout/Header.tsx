import { FiMenu, FiBell, FiSearch } from 'react-icons/fi'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
          Viport Dashboard
        </h1>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-md hover:bg-gray-100">
          <FiBell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}