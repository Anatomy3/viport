# 🏗️ Enterprise Monorepo Structure - Viport Next.js

## 📁 Complete Folder Structure

```
viport-monorepo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── apps/
│   ├── web/                          # Next.js 14 Main App
│   │   ├── .env.local
│   │   ├── .env.example
│   │   ├── .eslintrc.js
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── logo.svg
│   │   │   └── images/
│   │   └── src/
│   │       ├── app/                  # App Router Structure
│   │       │   ├── (auth)/           # Route Groups
│   │       │   │   ├── login/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── loading.tsx
│   │       │   │   ├── register/
│   │       │   │   │   └── page.tsx
│   │       │   │   └── layout.tsx    # Auth Layout
│   │       │   ├── (dashboard)/      # Protected Routes
│   │       │   │   ├── beranda/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── loading.tsx
│   │       │   │   ├── profile/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   ├── edit/
│   │       │   │   │   │   └── page.tsx
│   │       │   │   │   └── [userId]/
│   │       │   │   │       └── page.tsx
│   │       │   │   ├── posts/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   ├── create/
│   │       │   │   │   │   └── page.tsx
│   │       │   │   │   └── [postId]/
│   │       │   │   │       └── page.tsx
│   │       │   │   ├── portfolio/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   ├── builder/
│   │       │   │   │   │   └── page.tsx
│   │       │   │   │   └── [portfolioId]/
│   │       │   │   │       └── page.tsx
│   │       │   │   ├── shop/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   ├── products/
│   │       │   │   │   │   └── [productId]/
│   │       │   │   │   │       └── page.tsx
│   │       │   │   │   └── checkout/
│   │       │   │   │       └── page.tsx
│   │       │   │   ├── users/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── [userId]/
│   │       │   │   │       └── page.tsx
│   │       │   │   └── layout.tsx    # Dashboard Layout
│   │       │   ├── api/              # API Routes (tRPC)
│   │       │   │   ├── auth/
│   │       │   │   │   └── [...nextauth]/
│   │       │   │   │       └── route.ts
│   │       │   │   └── trpc/
│   │       │   │       └── [trpc]/
│   │       │   │           └── route.ts
│   │       │   ├── globals.css
│   │       │   ├── layout.tsx        # Root Layout
│   │       │   ├── loading.tsx
│   │       │   ├── error.tsx
│   │       │   ├── not-found.tsx
│   │       │   └── page.tsx          # Landing Page
│   │       ├── components/           # App-specific components
│   │       │   ├── auth/
│   │       │   │   ├── login-form.tsx
│   │       │   │   ├── register-form.tsx
│   │       │   │   └── google-auth-button.tsx
│   │       │   ├── dashboard/
│   │       │   │   ├── header.tsx
│   │       │   │   ├── sidebar.tsx
│   │       │   │   └── stats-card.tsx
│   │       │   ├── feed/
│   │       │   │   ├── post-card.tsx
│   │       │   │   ├── create-post.tsx
│   │       │   │   └── post-comments.tsx
│   │       │   ├── portfolio/
│   │       │   │   ├── portfolio-grid.tsx
│   │       │   │   ├── portfolio-builder.tsx
│   │       │   │   └── portfolio-preview.tsx
│   │       │   ├── shop/
│   │       │   │   ├── product-grid.tsx
│   │       │   │   ├── product-card.tsx
│   │       │   │   └── shopping-cart.tsx
│   │       │   └── users/
│   │       │       ├── user-list.tsx
│   │       │       ├── user-card.tsx
│   │       │       └── user-profile.tsx
│   │       ├── hooks/                # App-specific hooks
│   │       │   ├── use-auth.ts
│   │       │   ├── use-posts.ts
│   │       │   ├── use-portfolio.ts
│   │       │   └── use-local-storage.ts
│   │       ├── lib/                  # App utilities
│   │       │   ├── auth.ts
│   │       │   ├── trpc.ts
│   │       │   ├── utils.ts
│   │       │   ├── validations.ts
│   │       │   └── constants.ts
│   │       ├── providers/            # Context providers
│   │       │   ├── trpc-provider.tsx
│   │       │   ├── auth-provider.tsx
│   │       │   └── theme-provider.tsx
│   │       └── styles/
│   │           └── globals.css
│   └── admin/                        # Future Admin Dashboard
│       ├── package.json
│       └── [similar structure to web]
├── packages/
│   ├── ui/                           # Shared UI Components
│   │   ├── .eslintrc.js
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/               # Shadcn/ui components
│   │       │   │   ├── button.tsx
│   │       │   │   ├── card.tsx
│   │       │   │   ├── input.tsx
│   │       │   │   ├── form.tsx
│   │       │   │   ├── dialog.tsx
│   │       │   │   ├── dropdown-menu.tsx
│   │       │   │   ├── avatar.tsx
│   │       │   │   └── index.ts
│   │       │   ├── layout/
│   │       │   │   ├── header.tsx
│   │       │   │   ├── sidebar.tsx
│   │       │   │   ├── footer.tsx
│   │       │   │   └── container.tsx
│   │       │   ├── forms/
│   │       │   │   ├── form-field.tsx
│   │       │   │   ├── form-error.tsx
│   │       │   │   └── form-success.tsx
│   │       │   └── feedback/
│   │       │       ├── loading-spinner.tsx
│   │       │       ├── error-boundary.tsx
│   │       │       └── toast.tsx
│   │       ├── hooks/                # Shared hooks
│   │       │   ├── use-toast.ts
│   │       │   ├── use-media-query.ts
│   │       │   └── use-debounce.ts
│   │       ├── lib/                  # Shared utilities
│   │       │   ├── utils.ts
│   │       │   ├── cn.ts
│   │       │   └── validations.ts
│   │       └── styles/
│   │           └── globals.css
│   ├── types/                        # Shared TypeScript Types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       ├── post.ts
│   │       ├── portfolio.ts
│   │       ├── product.ts
│   │       ├── api.ts
│   │       └── index.ts
│   ├── config/                       # Shared Configurations
│   │   ├── eslint/
│   │   │   ├── package.json
│   │   │   ├── base.js
│   │   │   ├── next.js
│   │   │   └── react.js
│   │   ├── typescript/
│   │   │   ├── package.json
│   │   │   ├── base.json
│   │   │   ├── next.json
│   │   │   └── react.json
│   │   └── tailwind/
│   │       ├── package.json
│   │       └── base.js
│   └── trpc/                         # tRPC Configuration
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── routers/
│           │   ├── auth.ts
│           │   ├── user.ts
│           │   ├── post.ts
│           │   ├── portfolio.ts
│           │   ├── product.ts
│           │   └── index.ts
│           ├── middleware.ts
│           ├── context.ts
│           ├── client.ts
│           └── server.ts
├── services/
│   └── backend/                      # Existing Go Backend (preserved)
│       └── [existing Go structure]
├── .eslintrc.js                      # Root ESLint config
├── .gitignore
├── .npmrc
├── package.json                      # Root package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.json                     # Root TypeScript config
└── turbo.json                        # Turborepo configuration
```

## 📄 Page Migration Mapping

| Current Vite Page | New App Router Location | Route |
|-------------------|------------------------|-------|
| `Login.tsx` | `app/(auth)/login/page.tsx` | `/login` |
| `Portfolio.tsx` | `app/(dashboard)/portfolio/page.tsx` | `/portfolio` |
| `Posts.tsx` | `app/(dashboard)/posts/page.tsx` | `/posts` |
| `Profile.tsx` | `app/(dashboard)/profile/page.tsx` | `/profile` |
| `Shop.tsx` | `app/(dashboard)/shop/page.tsx` | `/shop` |
| `Users.tsx` | `app/(dashboard)/users/page.tsx` | `/users` |

## 🔧 Key Features

- **Monorepo**: Turborepo with pnpm workspaces
- **Next.js 14**: App Router with RSC
- **Shared UI**: Shadcn/ui + Tailwind CSS
- **Type Safety**: Strict TypeScript + tRPC
- **Performance**: SSR/SSG + optimizations
- **SEO**: Meta tags + structured data
- **Enterprise**: Scalable architecture