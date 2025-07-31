// Google OAuth Service
export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
  verified_email: boolean
}

export interface GoogleAuthResponse {
  access_token: string
  id_token: string
  user: GoogleUser
}

class GoogleAuthService {
  private clientId: string
  private isGoogleLoaded = false
  private googleAuth: any = null

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    
    // Validate Client ID format
    if (this.clientId && !this.clientId.endsWith('.apps.googleusercontent.com')) {
      console.error('Invalid Google Client ID format. Must end with .apps.googleusercontent.com')
    }
  }

  // Initialize Google OAuth
  async initialize(): Promise<void> {
    if (this.isGoogleLoaded) return

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        if (window.google) {
          this.isGoogleLoaded = true
          resolve()
        } else {
          reject(new Error('Google Identity Services failed to load'))
        }
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script'))
      }
      
      document.head.appendChild(script)
    })
  }

  // Sign in with Google using popup
  async signInWithPopup(): Promise<GoogleAuthResponse> {
    if (!this.isGoogleLoaded) {
      await this.initialize()
    }

    if (!this.clientId || this.clientId === 'your_google_client_id_here') {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file with a valid Client ID from Google Cloud Console.')
    }
    
    if (!this.clientId.endsWith('.apps.googleusercontent.com')) {
      throw new Error('Invalid Google Client ID format. Client ID must end with .apps.googleusercontent.com')
    }

    // Instead of popup, use redirect approach
    return this.signInWithRedirect()
  }

  // Redirect-based Google sign-in (no popup needed)
  private async signInWithRedirect(): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Create Google OAuth URL manually
        const redirectUri = `${window.location.origin}/auth/google/callback`
        const scope = 'openid email profile'
        const responseType = 'code'
        const state = this.generateRandomState()
        
        // Store state for validation
        localStorage.setItem('google_oauth_state', state)
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(this.clientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=${encodeURIComponent(scope)}` +
          `&response_type=${encodeURIComponent(responseType)}` +
          `&state=${encodeURIComponent(state)}` +
          `&access_type=offline` +
          `&prompt=select_account`

        // Redirect to Google OAuth page
        window.location.href = googleAuthUrl
        
        // This won't resolve immediately since we're redirecting
        // The actual resolution will happen after redirect back
        
      } catch (error) {
        reject(error)
      }
    })
  }

  // Generate random state for OAuth security
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Fallback method using ID token
  private async signInWithIdToken(): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }

          try {
            // Parse the JWT token to get user info
            const userInfo = this.parseJwtToken(response.credential)
            
            const authResponse: GoogleAuthResponse = {
              access_token: '',
              id_token: response.credential,
              user: userInfo
            }
            
            resolve(authResponse)
          } catch (error) {
            reject(error)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      })

      // Create a temporary button and trigger it
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.top = '-9999px'
      tempContainer.style.left = '-9999px'
      document.body.appendChild(tempContainer)

      window.google.accounts.id.renderButton(tempContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with'
      })

      // Trigger the button click
      setTimeout(() => {
        const button = tempContainer.querySelector('div[role="button"]') as HTMLElement
        if (button) {
          button.click()
          // Clean up
          setTimeout(() => {
            if (document.body.contains(tempContainer)) {
              document.body.removeChild(tempContainer)
            }
          }, 1000)
        } else {
          document.body.removeChild(tempContainer)
          reject(new Error('Failed to create Google sign-in button'))
        }
      }, 100)
    })
  }

  // Sign in with Google using One Tap
  async signInWithOneTap(): Promise<GoogleAuthResponse> {
    if (!this.isGoogleLoaded) {
      await this.initialize()
    }

    if (!this.clientId || this.clientId === 'your_google_client_id_here') {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.')
    }
    
    if (!this.clientId.endsWith('.apps.googleusercontent.com')) {
      throw new Error('Invalid Google Client ID format. Client ID must end with .apps.googleusercontent.com')
    }

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error('Google One Tap not available'))
        return
      }

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }

          try {
            // Decode JWT token to get user info
            const userInfo = this.parseJwtToken(response.credential)
            
            const authResponse: GoogleAuthResponse = {
              access_token: '',
              id_token: response.credential,
              user: userInfo
            }
            
            resolve(authResponse)
          } catch (error) {
            reject(error)
          }
        }
      })

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if One Tap is not available
          this.signInWithPopup().then(resolve).catch(reject)
        }
      })
    })
  }

  // Get user information from Google API
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error('Failed to get user information from Google')
    }

    const data = await response.json()
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      given_name: data.given_name,
      family_name: data.family_name,
      verified_email: data.verified_email
    }
  }

  // Parse JWT token to extract user info
  private parseJwtToken(token: string): GoogleUser {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      const payload = JSON.parse(jsonPayload)
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        verified_email: payload.email_verified
      }
    } catch (error) {
      throw new Error('Failed to parse Google JWT token')
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return this.googleAuth?.isSignedIn?.get() || false
  }
}

// Global type declarations
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
          disableAutoSelect: () => void
        }
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

export const googleAuthService = new GoogleAuthService()