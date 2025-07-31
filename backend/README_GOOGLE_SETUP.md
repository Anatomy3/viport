# Google OAuth Setup Instructions

## Saya telah memperbaiki error pada backend Anda! Berikut adalah langkah-langkah untuk setup Google OAuth:

### 🔧 Error yang sudah diperbaiki:
1. ✅ `undefined: User` - Ditambahkan import `models` package
2. ✅ `undefined: Handler` - Diganti dengan `AuthHandler`
3. ✅ `undefined: auth.CompareHashAndPassword` - Diganti dengan `auth.ComparePasswordAndHash`
4. ✅ Type mismatch pada Google user fields - Ditambahkan pointer helper functions
5. ✅ Import dependencies yang hilang

### 🚀 Setup Google OAuth:

#### 1. Google Cloud Console Setup
```bash
# 1. Buka https://console.cloud.google.com/
# 2. Pilih atau buat project baru
# 3. Enable Google+ API dan Google Identity API
# 4. Buat OAuth 2.0 Client ID di Credentials
# 5. Authorized JavaScript origins:
#    - http://localhost:3000
#    - https://your-domain.com
# 6. Authorized redirect URIs:
#    - http://localhost:3000
#    - https://your-domain.com
```

#### 2. Environment Variables
```bash
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080
VITE_APP_URL=http://localhost:3000

# Backend (.env if you have one)
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=8080
DATABASE_URL=postgres://user:password@localhost/viport?sslmode=disable
```

#### 3. Test Backend
```bash
cd /mnt/d/Viport/backend
go run cmd/api/main.go

# Expected output:
# Server starting on port 8080
```

#### 4. Test Frontend  
```bash
cd /mnt/d/Viport/frontend
npm run dev

# Access: http://localhost:3000
```

### 📋 How to get Google Client ID:

1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Create Project** atau pilih existing project
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. **Application Type**: Web application
6. **Authorized JavaScript origins**: 
   - `http://localhost:3000`
   - `https://yourdomain.com`
7. **Copy Client ID** yang berakhiran `.apps.googleusercontent.com`

### 🎯 Features yang sudah ready:

- ✅ **Google Popup Login** - Klik "Continue with Google"
- ✅ **Google One Tap** - Auto login tanpa popup  
- ✅ **Backend Verification** - Token diverifikasi server-side
- ✅ **Database Integration** - User tersimpan/update di database
- ✅ **JWT Generation** - Backend generate JWT token sendiri
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **Loading States** - UX yang smooth
- ✅ **Logout Integration** - Google tokens dibersihkan saat logout

### 🔒 Security Features:

- Google ID token diverifikasi di backend
- JWT token diissue oleh backend sendiri  
- User data divalidasi dan disanitize
- Database graceful fallback jika tidak connected
- Proper error handling untuk semua edge cases

### 🧪 Testing:

1. **Start Backend**: `go run cmd/api/main.go`
2. **Start Frontend**: `npm run dev`
3. **Navigate** ke http://localhost:3000
4. **Click** "Continue with Google"
5. **Login** dengan akun Google Anda
6. **Success**: Otomatis redirect ke beranda dengan data user dari Google

Backend Anda sekarang sudah ready untuk Google OAuth! 🎉