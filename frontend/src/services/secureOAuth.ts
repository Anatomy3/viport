import { generateSecureState, validateOAuthState, secureStorage } from '@/utils/security'

export interface OAuthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
  provider: 'google' | 'github' | 'discord'
}

export interface OAuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export class SecureOAuthService {
  private config: OAuthConfig

  constructor(config: OAuthConfig) {
    this.config = config
    this.validateConfig()
  }

  private validateConfig(): void {
    if (!this.config.clientId) {
      throw new Error(`${this.config.provider} Client ID is required`)
    }

    if (!this.config.redirectUri) {
      throw new Error('Redirect URI is required')
    }

    if (this.config.provider === 'google' && !this.config.clientId.endsWith('.apps.googleusercontent.com')) {
      throw new Error('Invalid Google Client ID format')
    }

    // Validate redirect URI is using HTTPS in production
    if (import.meta.env.PROD && !this.config.redirectUri.startsWith('https://')) {
      throw new Error('Redirect URI must use HTTPS in production')
    }
  }

  async initiateOAuth(): Promise<OAuthResult> {
    try {
      // Generate and store secure state
      const state = generateSecureState()
      secureStorage.set(`oauth_state_${this.config.provider}`, state, 1) // 1 hour

      // Generate nonce for additional security
      const nonce = generateSecureState()
      secureStorage.set(`oauth_nonce_${this.config.provider}`, nonce, 1)

      const authUrl = this.buildAuthUrl(state, nonce)

      return {
        success: true,
        redirectUrl: authUrl
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to initiate OAuth'
      }
    }
  }

  private buildAuthUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state,
      access_type: 'offline',
      prompt: 'select_account'
    })

    // Add provider-specific parameters
    if (this.config.provider === 'google') {
      params.append('nonce', nonce)
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    } else if (this.config.provider === 'github') {
      return `https://github.com/login/oauth/authorize?${params.toString()}`
    } else if (this.config.provider === 'discord') {
      return `https://discord.com/api/oauth2/authorize?${params.toString()}`
    }

    throw new Error(`Unsupported OAuth provider: ${this.config.provider}`)
  }

  validateCallback(receivedState: string, receivedCode: string): boolean {
    // Validate state parameter
    const storedState = secureStorage.get(`oauth_state_${this.config.provider}`)
    if (!storedState || !validateOAuthState(receivedState, storedState)) {
      return false
    }

    // Validate authorization code
    if (!receivedCode || receivedCode.length < 10) {
      return false
    }

    // Clean up stored state after successful validation
    secureStorage.remove(`oauth_state_${this.config.provider}`)
    secureStorage.remove(`oauth_nonce_${this.config.provider}`)

    return true
  }

  getProviderInfo() {
    const providerInfo = {
      google: {
        name: 'Google',
        color: '#4285f4',
        icon: 'chrome'
      },
      github: {
        name: 'GitHub', 
        color: '#333',
        icon: 'github'
      },
      discord: {
        name: 'Discord',
        color: '#5865f2',
        icon: 'discord'
      }
    }

    return providerInfo[this.config.provider]
  }
}

// Factory function to create OAuth services
export const createOAuthService = (provider: 'google' | 'github' | 'discord'): SecureOAuthService => {
  const configs = {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/google/callback`,
      scopes: ['openid', 'email', 'profile'],
      provider: 'google' as const
    },
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/github/callback`,
      scopes: ['user:email'],
      provider: 'github' as const
    },
    discord: {
      clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`,
      scopes: ['identify', 'email'],
      provider: 'discord' as const
    }
  }

  return new SecureOAuthService(configs[provider])
}

// Enhanced OAuth hooks
export const useSecureOAuth = () => {
  const initiateGoogleOAuth = async () => {
    const service = createOAuthService('google')
    const result = await service.initiateOAuth()
    
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl
    } else {
      throw new Error(result.error || 'Failed to initiate Google OAuth')
    }
  }

  const initiateGitHubOAuth = async () => {
    const service = createOAuthService('github')
    const result = await service.initiateOAuth()
    
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl
    } else {
      throw new Error(result.error || 'Failed to initiate GitHub OAuth')
    }
  }

  const validateOAuthCallback = (provider: 'google' | 'github' | 'discord', state: string, code: string): boolean => {
    const service = createOAuthService(provider)
    return service.validateCallback(state, code)
  }

  return {
    initiateGoogleOAuth,
    initiateGitHubOAuth,
    validateOAuthCallback
  }
}