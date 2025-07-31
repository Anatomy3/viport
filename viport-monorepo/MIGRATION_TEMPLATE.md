# 🔄 Next.js App Router Migration Template

## 📁 File Structure Pattern

For each page migration, create this structure:

```
apps/web/src/app/(group)/[page-name]/
├── page.tsx          # Main page component (Server Component)
├── loading.tsx       # Loading UI (Client Component)
├── error.tsx         # Error boundary (Client Component)
└── not-found.tsx     # 404 page (optional)

apps/web/src/components/[page-name]/
├── [page-name]-form.tsx    # Form components (Client)
├── [page-name]-card.tsx    # Display components
├── [page-name]-list.tsx    # List components
└── [page-name]-modal.tsx   # Modal components (Client)
```

## 🎯 Migration Checklist

### ✅ **1. Page Component (page.tsx)**

```typescript
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

// SEO Metadata (REQUIRED)
export const metadata: Metadata = {
  title: 'Page Title | Viport',
  description: 'Page description for SEO',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

// Server Component (DEFAULT - use for data fetching)
export default async function PageName() {
  // Server-side auth check (if needed)
  const session = await getServerSession();
  if (!session) redirect('/login');

  // Server-side data fetching (optional)
  // const data = await fetchData();

  return (
    <div className="container mx-auto py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>

      {/* Main Content with Suspense */}
      <Suspense fallback={<PageLoading />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
```

### ✅ **2. Loading Component (loading.tsx)**

```typescript
import { Skeleton } from '@viport/ui/components/ui/skeleton';
import { Card } from '@viport/ui/components/ui/card';

export default function PageLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### ✅ **3. Error Component (error.tsx)**

```typescript
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@viport/ui/components/ui/button';

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ error, reset }: PageErrorProps) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[400px] flex-col items-center justify-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
```

### ✅ **4. tRPC Integration Pattern**

```typescript
// In your client component
'use client';

import { trpc } from '@/lib/trpc';

export function PageContent() {
  const { data, isLoading, error } = trpc.pageName.getAll.useQuery();
  const createMutation = trpc.pageName.create.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      trpc.useContext().pageName.getAll.invalidate();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

### ✅ **5. TypeScript Types Pattern**

```typescript
// packages/types/src/[page-name].ts
import { z } from 'zod';

export const pageItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPageItemSchema = pageItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PageItem = z.infer<typeof pageItemSchema>;
export type CreatePageItem = z.infer<typeof createPageItemSchema>;
```

## 🚀 **Quick Migration Steps**

### **Step 1: Create Page Structure**
```bash
# Create page directory
mkdir -p apps/web/src/app/(dashboard)/[page-name]

# Create required files
touch apps/web/src/app/(dashboard)/[page-name]/page.tsx
touch apps/web/src/app/(dashboard)/[page-name]/loading.tsx
touch apps/web/src/app/(dashboard)/[page-name]/error.tsx
```

### **Step 2: Copy & Convert Components**
```bash
# Create component directory
mkdir -p apps/web/src/components/[page-name]

# Copy existing components and convert to new structure
# Update imports to use @viport/ui packages
```

### **Step 3: Update Routing**
- Remove React Router code
- Use Next.js `useRouter` from `next/navigation`
- Replace `<Link>` with Next.js `Link` component

### **Step 4: Convert State Management**
- Replace `useState` with `trpc.useQuery` for server state
- Keep `useState` only for local UI state
- Remove unnecessary API service files

### **Step 5: Add SEO & Performance**
- Add metadata export
- Implement proper loading states
- Add error boundaries
- Optimize images with Next.js `Image`

## 📋 **Page-Specific Migration Notes**

### **Portfolio.tsx → portfolio/page.tsx**
- Use Server Components for portfolio data
- Implement ISR for better performance
- Add portfolio-specific metadata

### **Posts.tsx → posts/page.tsx**
- Use streaming for real-time updates
- Implement infinite scrolling with tRPC
- Add post creation modals

### **Profile.tsx → profile/page.tsx**
- Use dynamic routing: `profile/[userId]/page.tsx`
- Implement profile editing forms
- Add profile-specific SEO

### **Shop.tsx → shop/page.tsx**
- Use Server Components for product data
- Implement search and filtering
- Add e-commerce structured data

### **Users.tsx → users/page.tsx**
- Use data tables with server-side pagination
- Implement user management actions
- Add bulk operations

## ⚡ **Performance Optimizations**

```typescript
// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton className="h-48 w-full" />,
});

// Use Server Components for data fetching
async function ServerDataComponent() {
  const data = await fetchData(); // Runs on server
  return <div>{data}</div>;
}

// Use Suspense for progressive loading
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

## 🔒 **Security Best Practices**

- ✅ Validate all inputs with Zod schemas
- ✅ Use Server Components for sensitive operations  
- ✅ Implement proper error handling
- ✅ Add CSRF protection for forms
- ✅ Sanitize user-generated content
- ✅ Use proper authentication checks

## 📱 **Responsive Design**

```typescript
// Use Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Use container for consistent spacing
<div className="container mx-auto px-4 py-6">
  {/* Page content */}
</div>
```

This template provides a complete migration pattern that you can follow for all your remaining pages!