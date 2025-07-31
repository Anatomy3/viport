# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Viport is an enterprise-grade social media platform with an Instagram-like feed, digital marketplace, and portfolio builder. Built with React frontend and Go backend, designed for scalability and maintainability similar to large-scale applications at companies like Amazon or Meta.

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- TanStack Query (data fetching/caching)
- Axios (HTTP client)
- React Router (routing)
- React Icons & React Colorful (UI components)
- Hello Pangea DnD (drag & drop)

**Backend:**
- Go 1.23 with Go modules
- Gin (HTTP framework)
- PostgreSQL (primary database)
- Redis (caching)
- JWT authentication (golang-jwt/jwt/v5)
- Go Playground Validator (request validation)
- UUID generation (google/uuid)

**DevOps:**
- Docker & Docker Compose
- Nginx (reverse proxy in production)

## Directory Structure

```
viport/
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   └── Layout/    # Layout components (Header, Sidebar, etc.)
│   │   ├── pages/        # Page components (Login, Register, Profile, etc.)
│   │   ├── hooks/        # Custom React hooks (useUsers.ts)
│   │   ├── store/        # Zustand stores (userStore.ts)
│   │   ├── services/     # API service functions (api.ts)
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── assets/       # Static assets
│   ├── public/           # Public static files
│   ├── vite.config.ts    # Vite configuration with API proxy
│   └── tailwind.config.js # Tailwind CSS configuration
├── backend/           # Go application
│   ├── cmd/api/          # Application entry point (main.go)
│   ├── internal/         # Private application code
│   │   ├── handlers/     # HTTP request handlers (auth, user, post, product)
│   │   ├── services/     # Business logic (currently empty)
│   │   ├── repositories/ # Data access layer (currently empty)
│   │   ├── models/       # Data models (User, Post, Product, etc.)
│   │   ├── middleware/   # HTTP middleware (CORS, auth, rate limiting)
│   │   └── config/       # Configuration management
│   ├── pkg/              # Public packages
│   │   ├── database/     # Database utilities (postgres.go)
│   │   ├── auth/         # Authentication utilities (JWT, password)
│   │   ├── logger/       # Logging utilities
│   │   └── validator/    # Validation utilities
│   ├── migrations/       # Database migrations (001_init_schema.sql)
│   └── go.mod           # Go module dependencies
├── deployments/       # Deployment configurations
├── scripts/          # Build and deployment scripts
├── docker-compose.yml    # Production Docker setup
├── docker-compose.dev.yml # Development databases only
├── Makefile          # Development commands
└── run.sh           # Quick start script
```

## Development Commands

### Essential Commands (Use these frequently)
```bash
# Quick setup (recommended)
make install         # Install both frontend and backend dependencies
make dev-deps        # Start databases (PostgreSQL + Redis)
make dev-backend     # Start Go backend (port 8080)
make dev-frontend    # Start React frontend (port 3000)

# Testing and quality checks
make test           # Run all tests (backend + frontend)
make typecheck      # TypeScript type checking
make lint           # Run linters (Go vet + ESLint)
make build          # Build both applications

# Docker workflows
make docker-up      # Start all services in production mode
make docker-down    # Stop all services
make docker-build   # Build Docker images
```

### Backend Commands
```bash
cd backend
go run cmd/api/main.go        # Start development server
go build -o bin/api cmd/api/main.go  # Build binary
go test ./...                 # Run tests
go vet ./...                  # Run Go linter
go mod tidy                   # Clean up dependencies
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run preview      # Preview production build
```

## Architecture Patterns

### Backend Architecture (Clean Architecture)
- **Handlers Layer**: HTTP request/response handling in `internal/handlers/`
  - `auth.go`: Authentication endpoints (register, login, refresh)
  - `user.go`: User management endpoints with dummy data
  - `post.go`: Social media posts (Instagram-like feed)
  - `product.go`: Digital marketplace products
- **Services Layer**: Business logic (to be implemented in `internal/services/`)
- **Repository Layer**: Data access (to be implemented in `internal/repositories/`)
- **Models**: Data structures in `internal/models/`
- **Middleware**: Cross-cutting concerns (`CORS`, `RateLimit`, `Auth`)
- **Configuration**: Environment-based config management

### Frontend Architecture
- **Component Hierarchy**: 
  - Layout components for consistent UI structure
  - Page components for different routes
  - Reusable UI components
- **State Management**: 
  - Zustand for global client state (`userStore.ts`)
  - TanStack Query for server state caching
- **Routing**: React Router with protected routes and authentication guards
- **API Layer**: Axios-based service layer with interceptors for auth
- **Type Safety**: Comprehensive TypeScript coverage

### API Design Patterns
- **RESTful Endpoints**: Consistent URL structure (`/api/users`, `/api/posts`, `/api/products`)
- **Response Format**: Standardized using `ApiResponse` wrapper
- **Authentication**: JWT-based with refresh tokens
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Middleware Pipeline**: CORS, rate limiting, authentication middleware

## Key Application Features

### Core Features
1. **Social Feed**: Instagram-like post creation, viewing, likes, comments
2. **Digital Marketplace**: Product listings, purchases, creator monetization
3. **User Management**: Registration, authentication, profiles, verification
4. **Portfolio Builder**: Drag-and-drop portfolio creation interface
5. **Admin Dashboard**: Platform statistics and management

### Authentication Flow
- JWT-based authentication with refresh tokens
- Protected routes on frontend using route guards
- Middleware-based auth on backend endpoints
- Local storage token management with automatic refresh

## Development Workflow

1. **Environment Setup**:
   ```bash
   make install      # Install dependencies
   make dev-deps     # Start databases
   ```

2. **Development**:
   ```bash
   # Terminal 1: Backend
   make dev-backend  # Starts on localhost:8080
   
   # Terminal 2: Frontend  
   make dev-frontend # Starts on localhost:3000
   ```

3. **API Proxy**: Frontend automatically proxies `/api/*` requests to backend

4. **Testing**: Use `make test` and `make typecheck` frequently

## Important Implementation Details

### Current State
- **Backend**: Uses dummy data in handlers, database integration ready but not active
- **Frontend**: Fully functional UI with API integration
- **Authentication**: JWT infrastructure in place, needs full implementation
- **Database**: Migration files exist, PostgreSQL/Redis containers configured

### Database Integration
- Database connection code exists but is commented out in `main.go:24-28`
- Migration file: `backend/migrations/001_init_schema.sql`
- Connection utilities: `pkg/database/postgres.go`

### Environment Configuration
- Backend config in `internal/config/config.go`
- Environment variables support for database URLs, JWT secrets
- Docker configurations for both development and production

## Testing and Quality

### Backend Testing
```bash
cd backend && go test ./...     # Run all Go tests
cd backend && go vet ./...      # Static analysis
```

### Frontend Testing
```bash
cd frontend && npm run typecheck  # TypeScript checking
cd frontend && npm run lint       # ESLint
cd frontend && npm test          # Jest tests (to be configured)
```

### Linting Commands
- Use `make lint` to run both Go vet and ESLint
- Use `make typecheck` for TypeScript validation

## Port Configuration
- **Frontend**: localhost:3000 (Vite dev server)
- **Backend**: localhost:8080 (Gin server)
- **PostgreSQL**: localhost:5432 (Docker)
- **Redis**: localhost:6379 (Docker)
- **Production**: Port 80 (Nginx reverse proxy)

## Quick Start Alternative
For rapid setup, use the included script:
```bash
./run.sh  # Automated setup and startup
```