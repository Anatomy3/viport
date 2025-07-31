import { FiAlertTriangle, FiX } from 'react-icons/fi'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'red' | 'blue' | 'green' | 'yellow'
  icon?: 'warning' | 'danger' | 'info' | 'success'
  isLoading?: boolean
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  icon = 'warning',
  isLoading = false
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  const getIconComponent = () => {
    switch (icon) {
      case 'warning':
        return <FiAlertTriangle size={24} className="text-yellow-600" />
      case 'danger':
        return <FiAlertTriangle size={24} className="text-red-600" />
      case 'info':
        return <FiAlertTriangle size={24} className="text-blue-600" />
      case 'success':
        return <FiAlertTriangle size={24} className="text-green-600" />
      default:
        return <FiAlertTriangle size={24} className="text-yellow-600" />
    }
  }

  const getConfirmButtonStyles = () => {
    switch (confirmColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full mx-auto shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIconComponent()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyles()}`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}