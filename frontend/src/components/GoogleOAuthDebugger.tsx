import { useState, useEffect } from 'react'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { googleAuthService } from '@/services/googleAuth'

export const GoogleOAuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})
  const { signInWithGoogle, isLoading, error } = useGoogleAuth()

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const info: any = {}
    
    // Check environment variables
    info.clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID
    info.apiUrl = (import.meta as any).env.VITE_API_URL
    info.appUrl = (import.meta as any).env.VITE_APP_URL
    
    // Check Client ID format
    info.clientIdValid = info.clientId && info.clientId.endsWith('.apps.googleusercontent.com')
    info.clientIdMocked = info.clientId === 'your_google_client_id_here'
    
    // Check if Google script is loaded
    info.googleScriptLoaded = !!window.google
    info.googleAccountsLoaded = !!window.google?.accounts
    info.googleAccountsIdLoaded = !!window.google?.accounts?.id
    
    // Check if we can reach backend
    try {
      const response = await fetch(info.apiUrl + '/health')
      info.backendReachable = response.ok
      info.backendStatus = response.status
    } catch (e: any) {
      info.backendReachable = false
      info.backendError = e.message
    }
    
    // Check current domain
    info.currentDomain = window.location.origin
    info.isLocalhost = window.location.hostname === 'localhost'
    
    setDebugInfo(info)
  }

  const testGoogleInitialization = async () => {
    const results: any = {}
    
    try {
      results.initStart = new Date().toISOString()
      await googleAuthService.initialize()
      results.initSuccess = true
      results.initEnd = new Date().toISOString()
    } catch (error: any) {
      results.initSuccess = false
      results.initError = error.message
    }
    
    // Test Google APIs availability
    results.googleAvailable = !!window.google
    results.googleAccountsAvailable = !!window.google?.accounts
    results.googleIdAvailable = !!window.google?.accounts?.id
    results.googleOAuth2Available = !!window.google?.accounts?.oauth2
    
    setTestResults({ ...testResults, initialization: results })
  }

  const testGoogleSignIn = async () => {
    const results: any = {}
    
    try {
      results.signInStart = new Date().toISOString()
      const user = await signInWithGoogle()
      results.signInSuccess = true
      results.user = user
      results.signInEnd = new Date().toISOString()
    } catch (error: any) {
      results.signInSuccess = false
      results.signInError = error.message
      results.signInErrorStack = error.stack
    }
    
    setTestResults({ ...testResults, signIn: results })
  }

  const testTokenParsing = () => {
    const mockToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkOTc5NDFhNjlmYWVlZWYwZjU2M2E2NDQxNjI2MjIzNzAyNzEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiODk2NjU1NDM2NDU3LWg2YTFqaXFpbGo2dmNsdWd2NGlsOTJhM2todGFkaDFjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyMzQ1Njc4OTAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRlc3QgVXNlciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRlOHh4eCIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiaWF0IjoxNjk5ODg4ODg4LCJleHAiOjE2OTk4OTI0ODh9'
    
    const results: any = {}
    
    try {
      const parts = mockToken.split('.')
      if (parts.length !== 3) throw new Error('Invalid token format')
      
      const payload = JSON.parse(atob(parts[1]))
      results.parseSuccess = true
      results.payload = payload
      results.requiredFields = {
        sub: !!payload.sub,
        email: !!payload.email,
        name: !!payload.name,
        picture: !!payload.picture,
        given_name: !!payload.given_name,
        family_name: !!payload.family_name
      }
    } catch (error: any) {
      results.parseSuccess = false
      results.parseError = error.message
    }
    
    setTestResults({ ...testResults, tokenParsing: results })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Google OAuth Debugger</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Environment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Environment Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Client ID:</strong> 
                <span className={debugInfo.clientIdValid ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.clientId ? debugInfo.clientId.substring(0, 20) + '...' : 'Not set'}
                </span>
              </div>
              <div>
                <strong>Client ID Valid:</strong> 
                <span className={debugInfo.clientIdValid ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.clientIdValid ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <strong>API URL:</strong> {debugInfo.apiUrl}
              </div>
              <div>
                <strong>Backend Reachable:</strong> 
                <span className={debugInfo.backendReachable ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.backendReachable ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <strong>Current Domain:</strong> {debugInfo.currentDomain}
              </div>
              <div>
                <strong>Google Script Loaded:</strong> 
                <span className={debugInfo.googleScriptLoaded ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.googleScriptLoaded ? '✓' : '✗'}
                </span>
              </div>
            </div>
            {debugInfo.backendError && (
              <div className="mt-2 text-red-600 text-sm">
                Backend Error: {debugInfo.backendError}
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testGoogleInitialization}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Google Initialization
            </button>
            <button
              onClick={testGoogleSignIn}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Google Sign In'}
            </button>
            <button
              onClick={testTokenParsing}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Token Parsing
            </button>
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Diagnostics
            </button>
          </div>

          {/* Current Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Current Error:</h4>
              <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Test Results</h4>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Console Logs */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Open browser Developer Tools (F12)</li>
              <li>Go to Console tab</li>
              <li>Click "Test Google Sign In"</li>
              <li>Look for error messages in console</li>
              <li>Copy any error messages for debugging</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close & Reload
          </button>
        </div>
      </div>
    </div>
  )
}