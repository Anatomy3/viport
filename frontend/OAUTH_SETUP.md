# OAuth Setup Guide for Viport

This guide will help you configure OAuth authentication for the Viport application with enterprise-grade security.

## 🔐 Security Features

Our OAuth implementation includes:
- ✅ Secure state parameter validation
- ✅ CSRF protection with nonce
- ✅ Encrypted token storage
- ✅ Rate limiting for login attempts  
- ✅ Input sanitization
- ✅ HTTPS enforcement in production
- ✅ Modern browser security checks

## 🌐 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google Identity Services

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: Viport
   - **User support email**: your-email@domain.com
   - **App logo**: Upload your app logo (optional)
   - **App domain**: your-domain.com
   - **Developer contact**: your-email@domain.com

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Viport Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

### 4. Environment Configuration

Update your `.env` file:

```env
# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration  
VITE_API_URL=http://localhost:8080
VITE_APP_URL=http://localhost:3000

# OAuth Redirect URIs (for different environments)
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback
VITE_PRODUCTION_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Security
VITE_ENABLE_OAUTH_STATE_VALIDATION=true
VITE_SESSION_TIMEOUT=3600000

# UI Configuration
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_REMEMBER_ME=true
```

## 🔧 GitHub OAuth Setup (Optional)

### 1. Create GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Viport
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/auth/github/callback`

### 2. Add to Environment

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

## 🎮 Discord OAuth Setup (Optional)

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Go to **OAuth2** settings
4. Add redirect URI: `https://yourdomain.com/auth/discord/callback`

### 2. Add to Environment

```env
VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Use HTTPS for all OAuth redirect URIs
- [ ] Update OAuth provider redirect URIs to production URLs
- [ ] Set proper CORS headers
- [ ] Enable rate limiting
- [ ] Use secure session storage
- [ ] Implement proper error logging
- [ ] Set up CSP headers
- [ ] Enable HSTS

### Environment Variables for Production

```env
# Production OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
VITE_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/google/callback
VITE_NODE_ENV=production

# Security Settings
VITE_ENABLE_OAUTH_STATE_VALIDATION=true
VITE_SESSION_TIMEOUT=3600000
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint code
npm run lint
```

## 🔍 Troubleshooting

### Common OAuth Errors

**Error: `redirect_uri_mismatch`**
- Check that your redirect URI exactly matches what's configured in OAuth provider
- Ensure no trailing slashes or protocol mismatches
- Verify environment variables are loaded correctly

**Error: `invalid_client`**
- Verify Client ID is correct and properly formatted
- Check that OAuth app is enabled in provider console
- Ensure API keys are not expired

**Error: `access_denied`**
- User cancelled the OAuth flow
- Check OAuth scopes are not too broad
- Verify OAuth consent screen is approved

### Browser Console Debugging

Open browser dev tools and check for:
- Network errors during OAuth redirect
- JavaScript errors in console
- Local storage items for OAuth state
- Cookie issues

### Security Validation

The app performs automatic security checks:
- HTTPS enforcement in production
- OAuth state parameter validation
- Browser compatibility checks
- Token expiration validation

## 📱 Mobile Considerations

The login page is fully responsive and optimized for:
- iOS Safari
- Android Chrome
- Progressive Web App (PWA) support
- Touch-friendly interactions
- Proper viewport scaling

## 🎨 UI/UX Features

- **Modern Design**: Glass morphism effects and smooth animations
- **Dark Mode**: Automatic system preference detection
- **Accessibility**: WCAG 2.1 AA compliant
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Form Validation**: Real-time validation with helpful messages

## 🔐 Security Best Practices

1. **Never expose client secrets** in frontend code
2. **Use HTTPS** in production
3. **Validate all OAuth responses** on the backend
4. **Implement proper CORS** policies
5. **Use secure session management**
6. **Regularly rotate OAuth credentials**
7. **Monitor for suspicious activity**
8. **Implement proper logging** without exposing sensitive data

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are correct
3. Test OAuth provider configuration
4. Review network requests for API errors
5. Check backend logs for authentication failures

For additional help, consult the OAuth provider documentation:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Discord OAuth Documentation](https://discord.com/developers/docs/topics/oauth2)