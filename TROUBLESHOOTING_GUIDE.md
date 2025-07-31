# 🔧 VIPORT ENTERPRISE TROUBLESHOOTING GUIDE

## 🚨 **COMMON MIGRATION ISSUES & SOLUTIONS**

### 📦 **Dependency Issues**

#### ❌ **Problem: tRPC Version Conflicts**
```bash
npm error peer @tanstack/react-query@"^4.18.0" from @trpc/react-query@10.45.2
```

✅ **Solution:**
```bash
# Option 1: Use legacy peer deps (Quick fix)
npm install --legacy-peer-deps

# Option 2: Fix version compatibility (Recommended)
npm install @trpc/react-query@^10.45.2 @tanstack/react-query@^4.36.1

# Option 3: Use latest compatible versions
npm install @trpc/react-query@^11.0.0 @tanstack/react-query@^5.0.0
```

#### ❌ **Problem: TypeScript Compilation Errors**
```bash
tsc: not found
next: not found
```

✅ **Solution:**
```bash
# Ensure dependencies are installed
npm install

# If still failing, clean and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 🔧 **BUILD & DEVELOPMENT ISSUES**

### ⚡ **Build Failures**

#### ❌ **Problem: Next.js Build Errors**
```bash
Error: Cannot resolve module '@/components/ui/button'
```

✅ **Solution:**
```bash
# Check if shadcn/ui components exist
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label

# Or create missing UI components
mkdir -p src/components/ui
```

#### ❌ **Problem: TypeScript Path Mapping Issues**
```bash
Cannot find module '@/lib/utils'
```

✅ **Solution - Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

### 🖥️ **Development Server Issues**

#### ❌ **Problem: Port Already in Use**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

✅ **Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001

# Or in package.json
"dev": "next dev -p 3001"
```

#### ❌ **Problem: API Proxy Not Working**
```bash
API calls to /api/* returning 404
```

✅ **Solution - Check `next.config.js`:**
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080/api/:path*'
        : '/api/:path*',
    },
  ]
}
```

---

## 🗄️ **DATABASE & BACKEND ISSUES**

### 🐘 **PostgreSQL Connection Issues**

#### ❌ **Problem: Database Connection Failed**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

✅ **Solution:**
```bash
# Start database containers
docker-compose -f docker-compose.dev.yml up -d

# Check if containers are running
docker ps

# Check backend connection string
grep -r "DATABASE_URL" .env*
```

#### ❌ **Problem: Go Backend Not Responding**
```bash
fetch error: ECONNREFUSED 127.0.0.1:8080
```

✅ **Solution:**
```bash
# Start Go backend
cd backend && go run cmd/api/main.go

# Or use Make commands
make dev-backend

# Check if backend is running
curl http://localhost:8080/api/health
```

---

## 🔒 **Authentication Issues**

### 🔑 **JWT Token Problems**

#### ❌ **Problem: Token Expired or Invalid**
```bash
401 Unauthorized: Token expired
```

✅ **Solution:**
```javascript
// Check token storage in browser
localStorage.getItem('viport_access_token')
localStorage.getItem('viport_refresh_token')

// Clear tokens and re-login
localStorage.removeItem('viport_access_token')
localStorage.removeItem('viport_refresh_token')
```

#### ❌ **Problem: CORS Issues with Authentication**
```bash
Access-Control-Allow-Origin header missing
```

✅ **Solution - Backend CORS Configuration:**
```go
// backend/internal/middleware/cors.go
func CORS() gin.HandlerFunc {
    return cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
    })
}
```

---

## 🎨 **Styling & UI Issues**

### 🎭 **Tailwind CSS Problems**

#### ❌ **Problem: Styles Not Loading**
```bash
Tailwind classes not applying
```

✅ **Solution - Check `tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

#### ❌ **Problem: Dark Mode Not Working**
```bash
Theme switching not functioning
```

✅ **Solution:**
```bash
# Ensure next-themes is installed
npm install next-themes

# Check ThemeProvider in layout.tsx
import { ThemeProvider } from 'next-themes'
```

---

## 📡 **API & Data Fetching Issues**

### 🔌 **tRPC Connection Problems**

#### ❌ **Problem: tRPC Client Not Connecting**
```bash
tRPC: fetch failed GET http://localhost:3000/api/trpc
```

✅ **Solution - Check API Route:**
```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/router'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
```

#### ❌ **Problem: React Query Hydration Mismatch**
```bash
Hydration failed: Initial UI does not match server
```

✅ **Solution:**
```typescript
// src/providers/index.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => trpc.createClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

---

## 🚀 **Deployment Issues**

### 🐳 **Docker Problems**

#### ❌ **Problem: Docker Build Failing**
```bash
Error: Failed to resolve import "@/components/ui/button"
```

✅ **Solution - Dockerfile:**
```dockerfile
# Ensure proper COPY commands
COPY package*.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js tsconfig.json tailwind.config.js ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps
```

#### ❌ **Problem: Environment Variables Not Working**
```bash
process.env.NEXT_PUBLIC_API_URL is undefined
```

✅ **Solution:**
```bash
# Create .env.local for development
NEXT_PUBLIC_API_URL=http://localhost:8080

# For Docker, use .env or environment in docker-compose.yml
environment:
  - NEXT_PUBLIC_API_URL=http://backend:8080
```

---

## 🧪 **Testing Issues**

### 🔬 **Jest Configuration Problems**

#### ❌ **Problem: Jest Cannot Resolve Modules**
```bash
Cannot resolve module '@/components/ui/button'
```

✅ **Solution - `jest.config.js`:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}
```

#### ❌ **Problem: Playwright E2E Tests Failing**
```bash
Test timeout of 30000ms exceeded
```

✅ **Solution - `playwright.config.ts`:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🔍 **Performance Issues**

### ⚡ **Slow Build Times**

#### ❌ **Problem: Long Build Duration**
```bash
Build taking over 5 minutes
```

✅ **Solution:**
```bash
# Enable turbo mode
npm install --save-dev turbo

# Add to package.json
"build": "turbo run build",
"dev": "turbo run dev"

# Clear cache
rm -rf .next .turbo node_modules/.cache
```

#### ❌ **Problem: Large Bundle Size**
```bash
Bundle size exceeding 1MB
```

✅ **Solution - `next.config.js`:**
```javascript
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks.cacheGroups = {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        chunks: 'all',
      },
    }
    return config
  },
}
```

---

## 🛠️ **Quick Diagnostic Commands**

### 🔍 **System Health Check**
```bash
# Check Node.js version
node --version  # Should be >= 18.17.0

# Check npm version
npm --version   # Should be >= 9.0.0

# Check Next.js installation
npx next --version

# Check TypeScript
npx tsc --version
```

### 🩺 **Project Health Check**
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Test suite
npm run test

# Bundle analysis
npm run analyze
```

### 📊 **Performance Debugging**
```bash
# Development build analysis
ANALYZE=true npm run build

# Memory usage
node --inspect server.js

# CPU profiling
node --prof server.js
```

---

## 🆘 **Emergency Recovery**

### 🔄 **Complete Reset (Last Resort)**
```bash
# Stop all processes
pkill -f "next\|node\|npm"

# Clean everything
rm -rf node_modules package-lock.json .next .turbo
rm -rf backend/bin

# Fresh install
npm install --legacy-peer-deps

# Restart databases
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start
npm run build
npm run dev
```

### 📞 **Getting Help**
1. **Check logs**: Look in browser console and terminal output
2. **GitHub Issues**: Check repository issues for similar problems
3. **Documentation**: Refer to Next.js and tRPC documentation
4. **Community**: Stack Overflow, Discord, or GitHub Discussions

---

## ✅ **Verification Steps**

After fixing any issue:

1. **Clean build**: `rm -rf .next && npm run build`
2. **Type check**: `npm run type-check`
3. **Lint check**: `npm run lint`
4. **Test suite**: `npm run test`
5. **E2E tests**: `npm run e2e`
6. **Performance check**: `npm run analyze`

## 🎯 **Prevention Tips**

1. **Regular Updates**: Keep dependencies updated
2. **Consistent Environment**: Use Docker for consistency
3. **Git Hooks**: Use Husky for pre-commit checks
4. **Documentation**: Keep README and setup docs current
5. **Monitoring**: Set up error tracking and performance monitoring

**Remember: Most issues are environment-related. Start with dependency installation and environment setup before diving into complex debugging.**