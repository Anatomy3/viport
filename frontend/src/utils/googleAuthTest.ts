// Google OAuth Testing Utilities

export const testGoogleCredentials = () => {
  const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID
  const results = {
    clientId,
    isValid: false,
    errors: [] as string[]
  }

  // Check if Client ID exists
  if (!clientId) {
    results.errors.push('VITE_GOOGLE_CLIENT_ID not found in environment')
    return results
  }

  // Check Client ID format
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    results.errors.push('Client ID must end with .apps.googleusercontent.com')
    return results
  }

  // Check if it's still the placeholder
  if (clientId === 'your_google_client_id_here') {
    results.errors.push('Client ID is still using placeholder value')
    return results
  }

  results.isValid = true
  return results
}

export const testGoogleScriptLoading = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.google?.accounts?.id) {
      resolve(true)
      return
    }

    // Try to load the script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      // Wait a bit for Google APIs to initialize
      setTimeout(() => {
        resolve(!!window.google?.accounts?.id)
      }, 100)
    }
    
    script.onerror = () => resolve(false)
    
    document.head.appendChild(script)
  })
}

export const testGoogleInitialization = async (): Promise<{success: boolean, error?: string}> => {
  try {
    const scriptLoaded = await testGoogleScriptLoading()
    if (!scriptLoaded) {
      return { success: false, error: 'Google Identity Services script failed to load' }
    }

    const credentialsTest = testGoogleCredentials()
    if (!credentialsTest.isValid) {
      return { success: false, error: credentialsTest.errors.join(', ') }
    }

    // Try to initialize Google Auth
    if (!window.google?.accounts?.id) {
      return { success: false, error: 'Google Identity Services not available' }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const mockGoogleTokenResponse = {
  // This is a sample JWT token structure (not a real token)
  credential: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkOTc5NDFhNjlmYWVlZWYwZjU2M2E2NDQxNjI2MjIzNzAyNzEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiODk2NjU1NDM2NDU3LWg2YTFqaXFpbGo2dmNsdWd2NGlsOTJhM2todGFkaDFjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyMzQ1Njc4OTAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRlc3QgVXNlciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRlOHh4eCIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiaWF0IjoxNjk5ODg4ODg4LCJleHAiOjE2OTk4OTI0ODh9.signature'
}

export const testTokenParsing = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format - should have 3 parts')
    }

    const payload = JSON.parse(atob(parts[1]))
    
    // Check required fields
    const requiredFields = ['sub', 'email', 'name', 'picture', 'given_name', 'family_name']
    const missingFields = requiredFields.filter(field => !payload[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    return {
      success: true,
      payload,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        verified_email: payload.email_verified
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

export const runFullGoogleOAuthTest = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      clientId: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID,
      apiUrl: (import.meta as any).env.VITE_API_URL,
      domain: window.location.origin
    },
    tests: {
      credentials: testGoogleCredentials(),
      scriptLoading: false,
      initialization: { success: false, error: '' },
      tokenParsing: { success: false, error: '' }
    } as any
  }

  // Test script loading
  results.tests.scriptLoading = await testGoogleScriptLoading()

  // Test initialization
  results.tests.initialization = await testGoogleInitialization()

  // Test token parsing with mock token
  results.tests.tokenParsing = testTokenParsing(mockGoogleTokenResponse.credential)

  return results
}