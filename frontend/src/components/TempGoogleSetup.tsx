import { useState } from 'react'
import { FiAlertCircle, FiExternalLink, FiCopy, FiCheck } from 'react-icons/fi'

export const TempGoogleSetup = () => {
  const [copied, setCopied] = useState(false)
  const currentEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (currentEnv && currentEnv !== 'your_google_client_id_here') {
    return null // Don't show if properly configured
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <FiAlertCircle size={24} className="text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Google OAuth Setup Required
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Current Error:</h4>
            <p className="text-red-700 text-sm">
              Error 401: invalid_client - The OAuth client was not found.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Quick Setup (5 minutes):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>
                Open{' '}
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900 inline-flex items-center gap-1"
                >
                  Google Cloud Console <FiExternalLink size={12} />
                </a>
              </li>
              <li>Create new project: "Viport App"</li>
              <li>APIs & Services → Library → Enable "Google+ API"</li>
              <li>Credentials → Create OAuth 2.0 Client ID</li>
              <li>Web application, authorized origins: <code className="bg-white px-1 rounded">http://localhost:3000</code></li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Update .env file:
            </h4>
            <div className="bg-gray-900 text-green-400 text-sm p-3 rounded font-mono relative">
              <div className="pr-8">
                VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
              </div>
              <button
                onClick={() => copyToClipboard('VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com')}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Replace YOUR_ACTUAL_CLIENT_ID_HERE with your real Client ID from Google Cloud Console
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              <li>Client ID must end with <code>.apps.googleusercontent.com</code></li>
              <li>Restart frontend server after updating .env</li>
              <li>Make sure authorized origins include <code>http://localhost:3000</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600">
            Current .env: <code className="bg-white px-2 py-1 rounded text-xs">
              {currentEnv || 'Not set'}
            </code>
          </p>
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Open Google Console</span>
            <FiExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}