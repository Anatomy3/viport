# Development commands
.PHONY: dev dev-deps dev-backend dev-frontend build build-backend build-frontend test clean docker-up docker-down

# Start development environment
dev: dev-deps
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Databases are running. Start backend and frontend separately."

# Start only development dependencies (databases)
dev-deps:
	@echo "Starting development dependencies..."
	docker-compose -f docker-compose.dev.yml up -d

# Start backend in development mode
dev-backend:
	@echo "Starting backend in development mode..."
	cd backend && go run cmd/api/main.go

# Start frontend in development mode
dev-frontend:
	@echo "Starting frontend in development mode..."
	cd frontend && npm run dev

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd backend && go mod tidy
	cd frontend && npm install

# Build applications
build: build-backend build-frontend

build-backend:
	@echo "Building backend..."
	cd backend && go build -o bin/api cmd/api/main.go

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

# Run tests
test:
	@echo "Running tests..."
	cd backend && go test ./...
	cd frontend && npm run test

# Type checking
typecheck:
	@echo "Running type checks..."
	cd frontend && npm run typecheck

# Linting
lint:
	@echo "Running linters..."
	cd backend && go vet ./...
	cd frontend && npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd backend && rm -rf bin/
	cd frontend && rm -rf dist/

# Docker commands
docker-up:
	@echo "Starting all services with Docker..."
	docker-compose up -d

docker-down:
	@echo "Stopping all services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

docker-build:
	@echo "Building Docker images..."
	docker-compose build

# Database commands
db-migrate:
	@echo "Running database migrations..."
	# Add migration commands here

db-seed:
	@echo "Seeding database..."
	# Add seed commands here

# Help
help:
	@echo "Available commands:"
	@echo "  dev              - Start development environment with databases"
	@echo "  dev-deps         - Start only development dependencies"
	@echo "  dev-backend      - Start backend in development mode"
	@echo "  dev-frontend     - Start frontend in development mode"
	@echo "  install          - Install all dependencies"
	@echo "  build            - Build both backend and frontend"
	@echo "  test             - Run all tests"
	@echo "  typecheck        - Run TypeScript type checking"
	@echo "  lint             - Run linters"
	@echo "  clean            - Clean build artifacts"
	@echo "  docker-up        - Start all services with Docker"
	@echo "  docker-down      - Stop all services"
	@echo "  docker-build     - Build Docker images"
	@echo "  help             - Show this help message"