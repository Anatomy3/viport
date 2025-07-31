#!/bin/bash

echo "🚀 Starting Viport Development Environment"
echo "==========================================="

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Installing Go 1.21..."
    
    # Download and install Go
    wget -q https://go.dev/dl/go1.21.5.linux-amd64.tar.gz -O /tmp/go1.21.5.linux-amd64.tar.gz
    
    echo "📦 Please run the following commands to install Go:"
    echo "sudo tar -C /usr/local -xzf /tmp/go1.21.5.linux-amd64.tar.gz"
    echo "export PATH=\$PATH:/usr/local/go/bin"
    echo "export GOPATH=\$HOME/go"
    echo "export PATH=\$PATH:\$GOPATH/bin"
    echo ""
    echo "Then run this script again: ./run.sh"
    exit 1
fi

echo "✅ Go is installed: $(go version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
go mod tidy
cd ..

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
go run cmd/api/main.go &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Viport is running!"
echo "====================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080/api/users"
echo "Health:   http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "go run cmd/api/main.go" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for services
wait