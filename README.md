# Viport - Enterprise Application

A scalable, enterprise-grade application built with React and Go, designed with best practices for large-scale development.

## Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Zustand + TanStack Query  
**Backend:** Go + Gin + PostgreSQL + Redis + JWT  
**DevOps:** Docker + Docker Compose + Nginx

## Quick Start

1. **Install dependencies:**
   ```bash
   make install
   ```

2. **Start development environment:**
   ```bash
   # Start databases
   make dev-deps
   
   # Start backend (new terminal)
   make dev-backend
   
   # Start frontend (new terminal)
   make dev-frontend
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Health check: http://localhost:8080/health

## Project Structure

```
viport/
├── frontend/          # React + TypeScript application
├── backend/           # Go API server
├── docker-compose.yml # Production setup
├── docker-compose.dev.yml # Development databases
└── Makefile          # Development commands
```

## Available Commands

See `make help` for all available commands.

## Development

- Frontend runs on port 3000 with API proxy to backend
- Backend runs on port 8080
- PostgreSQL on port 5432
- Redis on port 6379

## Production Deployment

```bash
# Build and start all services
make docker-up
```

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed development guidance.