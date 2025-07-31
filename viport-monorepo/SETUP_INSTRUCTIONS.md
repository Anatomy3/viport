# 🚀 Viport Next.js Monorepo Setup Instructions

## 📋 Prerequisites

- **Node.js**: 18+ (recommended: 20+)
- **pnpm**: 8.0+ (`npm install -g pnpm`)
- **Git**: Latest version
- **Go**: 1.23+ (for existing backend)

## 🛠️ Initial Setup

### 1. Clone and Setup Repository

```bash
# Navigate to your project directory
cd /path/to/your/viport

# Create the new monorepo structure
mkdir viport-monorepo
cd viport-monorepo

# Copy the generated files to your new directory
# (Copy all the files we just generated)

# Install dependencies
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment files
cp apps/web/.env.example apps/web/.env.local

# Edit the environment variables
nano apps/web/.env.local
```

**Required Environment Variables:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GO_BACKEND_URL=http://localhost:8080
```

### 3. Copy Existing Assets

```bash
# Copy your existing Go backend
cp -r /path/to/current/viport/backend/* services/backend/

# Copy existing components (manual migration required)
# From: /path/to/current/viport/frontend/src/components/*
# To: packages/ui/src/components/* (shared components)
# To: apps/web/src/components/* (app-specific components)

# Copy existing types
# From: /path/to/current/viport/frontend/src/types/*
# To: packages/types/src/*
```

## 🔧 Development Commands

### Start Development Environment

```bash
# Start all services in development mode
pnpm dev

# Or start specific services
pnpm dev --filter=@viport/web     # Next.js app only
pnpm dev --filter=@viport/ui      # UI package only
```

### Build and Test

```bash
# Build all packages and apps
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## 📦 Package Structure

### Adding New Shared Components

```bash
# Navigate to UI package
cd packages/ui

# Add shadcn/ui components
pnpm ui:add button
pnpm ui:add card
pnpm ui:add dialog
```

### Creating New tRPC Routers

```typescript
// packages/trpc/src/routers/new-router.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../server';

export const newRouter = createTRPCRouter({
  // Add your procedures here
});

// Don't forget to add to packages/trpc/src/routers/index.ts
```

### Adding New Pages

```bash
# Create new page in App Router
mkdir -p apps/web/src/app/(dashboard)/new-page
touch apps/web/src/app/(dashboard)/new-page/page.tsx
```

## 🔄 Migration Process

### Phase 1: Setup and Basic Structure ✅
- [x] Monorepo setup with Turborepo
- [x] Shared packages (ui, types, config)
- [x] Next.js 14 app with App Router
- [x] tRPC configuration

### Phase 2: Component Migration (Next Steps)

1. **Move Components to Shared UI Package**
   ```bash
   # Copy components from current frontend
   cp frontend/src/components/Layout/* packages/ui/src/components/layout/
   cp frontend/src/components/Feed/* apps/web/src/components/feed/
   ```

2. **Update Import Paths**
   ```typescript
   // Old import
   import { Button } from '../components/ui/Button';
   
   // New import
   import { Button } from '@viport/ui/components/ui/button';
   ```

3. **Migrate Pages One by One**
   - Start with Login page
   - Then Posts, Portfolio, Profile, Shop, Users
   - Test each page individually

### Phase 3: API Integration

1. **Update tRPC Routers**
   - Test connection to Go backend
   - Update API endpoints
   - Add error handling

2. **Authentication Setup**
   ```bash
   # Configure NextAuth
   npm install next-auth
   # Update auth configuration
   ```

## 🧪 Testing

```bash
# Add testing packages
pnpm add -D jest @testing-library/react @testing-library/jest-dom

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🚀 Production Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t viport-web -f apps/web/Dockerfile .

# Run container
docker run -p 3000:3000 viport-web
```

## 📊 Performance Monitoring

- **Bundle Analyzer**: `pnpm analyze` in web app
- **Lighthouse**: Built-in Next.js optimization
- **Core Web Vitals**: Monitored automatically

## 🔒 Security Checklist

- [x] Environment variables secured
- [x] HTTPS enforced in production
- [x] Security headers configured
- [x] Authentication implemented
- [x] Input validation with Zod
- [x] Rate limiting configured

## 🎯 Next Steps

1. **Immediate (Week 1)**
   - Copy existing components to new structure
   - Update import paths
   - Test basic functionality

2. **Short-term (Week 2-3)**
   - Migrate all pages
   - Set up authentication
   - Test API integration

3. **Long-term (Month 1-2)**
   - Performance optimization
   - SEO improvements
   - Advanced features

## 📚 Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [tRPC Documentation](https://trpc.io/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   ```bash
   # Clear cache and reinstall
   pnpm clean
   pnpm install
   ```

2. **Type Errors**
   ```bash
   # Rebuild type definitions
   pnpm type-check
   ```

3. **Build Failures**
   ```bash
   # Check for circular dependencies
   pnpm build --verbose
   ```

Need help? Check the documentation or create an issue in the repository.