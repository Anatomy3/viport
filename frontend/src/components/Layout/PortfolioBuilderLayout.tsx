import { FiArrowLeft, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface PortfolioBuilderLayoutProps {
  children: React.ReactNode
}

export const PortfolioBuilderLayout = ({ children }: PortfolioBuilderLayoutProps) => {
  const navigate = useNavigate()

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={16} />
            <span className="text-sm">Back to Dashboard</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-gray-900">Viport</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FiUser size={16} />
            <span>John Doe</span>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="h-[calc(100vh-57px)]">
        {children}
      </div>
    </div>
  )
}