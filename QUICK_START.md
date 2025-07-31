# 🚀 Quick Start Guide - Viport

## Opsi 1: Automatic Setup (Recommended)

Jalankan script otomatis:

```bash
./run.sh
```

Script ini akan:
1. ✅ Check dependencies (Node.js ✓, Go ❓)
2. 📦 Install Go jika belum ada
3. 🔧 Setup backend & frontend
4. 🚀 Start semua services

## Opsi 2: Manual Setup

### Step 1: Install Go (jika belum ada)

```bash
# Download Go 1.21
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# Install (butuh sudo)
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# Add to PATH (masukkan ke ~/.bashrc)
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# Reload shell
source ~/.bashrc
```

### Step 2: Start Backend

```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

### Step 3: Start Frontend (terminal baru)

```bash
cd frontend
npm run dev
```

## 🎯 Hasil

Setelah berhasil, akses:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/users  
- **Health Check**: http://localhost:8080/health

## 🔧 Troubleshooting

**Error: "go: command not found"**
→ Install Go dengan panduan di atas

**Error 500 di frontend**
→ Backend belum jalan, pastikan port 8080 terbuka

**Port conflict**
→ Ganti port di `backend/.env` atau `frontend/vite.config.ts`

## 🐳 Docker Alternative (Jika ada Docker)

```bash
# Build dan start semua services
docker-compose up --build

# Atau hanya databases
docker-compose -f docker-compose.dev.yml up
```

---

**Status saat ini:**
- ✅ Frontend dependencies installed
- ✅ Backend code ready (dummy API)
- ⏳ Perlu install Go untuk backend
- ⏳ Database optional (pakai dummy data dulu)