// Security utilities for authentication

// Generate secure random state for OAuth
export const generateSecureState = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate OAuth state parameter
export const validateOAuthState = (receivedState: string, storedState: string): boolean => {
  return receivedState === storedState && storedState.length >= 32
}

// Secure token storage
export const secureStorage = {
  set: (key: string, value: string, expirationHours: number = 24): void => {
    const item = {
      value,
      timestamp: Date.now(),
      expiration: Date.now() + (expirationHours * 60 * 60 * 1000)
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  get: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expiration) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.value
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key)
  },

  clear: (): void => {
    localStorage.clear()
  }
}

// Rate limiting for login attempts
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (record.count >= this.maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record || record.count < this.maxAttempts) return 0
    
    return Math.max(0, record.resetTime - Date.now())
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return escapeMap[match]
    })
}

// Email validation (more robust than basic regex)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email) && email.length <= 254
}

// Password security checks
export const passwordSecurityCheck = (password: string): {
  isSecure: boolean
  issues: string[]
  score: number
} => {
  const issues: string[] = []
  let score = 0

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  if (password.length >= 12) score += 1

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Avoid repeating characters')
    score -= 1
  }

  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ]
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    issues.push('Avoid common passwords or patterns')
    score -= 2
  }

  return {
    isSecure: issues.length === 0 && score >= 4,
    issues,
    score: Math.max(0, score)
  }
}

// CSRF Token generation and validation
export const csrfToken = {
  generate: (): string => {
    return generateSecureState()
  },
  
  store: (token: string): void => {
    secureStorage.set('csrf_token', token, 1) // 1 hour expiration
  },
  
  verify: (token: string): boolean => {
    const storedToken = secureStorage.get('csrf_token')
    return storedToken === token && token.length >= 32
  }
}

// Environment detection
export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production'
}

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development'
}

// Browser security checks
export const browserSecurityCheck = (): {
  isSecure: boolean
  warnings: string[]
} => {
  const warnings: string[] = []

  // Check if running over HTTPS in production
  if (isProduction() && location.protocol !== 'https:') {
    warnings.push('Connection is not secure. Please use HTTPS.')
  }

  // Check for modern browser features
  if (!window.crypto || !window.crypto.getRandomValues) {
    warnings.push('Browser does not support secure random number generation.')
  }

  if (!window.localStorage) {
    warnings.push('Browser does not support local storage.')
  }

  return {
    isSecure: warnings.length === 0,
    warnings
  }
}