# 🔧 Google OAuth Setup - Fix Error 401: invalid_client

## 📋 Current Error:
```
Error 401: invalid_client
The OAuth client was not found.
```

## ✅ Complete Setup Guide:

### 1. Google Cloud Console Setup

#### Step 1: Create Project
1. Buka https://console.cloud.google.com/
2. Click dropdown project di atas (sebelah logo Google Cloud)
3. Click "New Project" 
4. Project Name: "Viport App"
5. Click "Create"

#### Step 2: Enable Required APIs
1. Menu → APIs & Services → Library
2. Search dan Enable:
   - **Google+ API**
   - **Google Identity API** 
   - **Google Sign-In API**

#### Step 3: Create OAuth 2.0 Client ID
1. APIs & Services → Credentials
2. "+ CREATE CREDENTIALS" → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Name: "Viport Frontend"

#### Step 4: Configure Authorized URLs
```
Authorized JavaScript origins:
- http://localhost:3000
- http://127.0.0.1:3000

Authorized redirect URIs:
- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:3000/login
- http://127.0.0.1:3000/login
```

#### Step 5: Get Client ID
- Click "Create"
- **COPY** the Client ID (ends with .apps.googleusercontent.com)

### 2. Update Frontend Configuration

#### Update .env file:
```bash
# Replace this line in /mnt/d/Viport/frontend/.env:
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com

# Example (use your real one):
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### 3. Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd D:\Viport\frontend
npm run dev
```

### 4. Test OAuth Flow

1. Open http://localhost:3000/login
2. Click "Continue with Google"
3. Should open Google login popup
4. After login → redirect to beranda

## 🔍 Verification Checklist:

- [ ] Google Cloud project created
- [ ] APIs enabled (Google+ API, Google Identity API)
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins configured correctly
- [ ] Client ID copied to .env file
- [ ] Frontend server restarted
- [ ] Test login flow

## 🚨 Common Issues:

### Issue 1: "OAuth client not found"
- Double-check Client ID is correct
- Ensure no extra spaces in .env file
- Verify authorized origins match exactly

### Issue 2: "redirect_uri_mismatch" 
- Add http://localhost:3000 to authorized redirect URIs
- Add http://127.0.0.1:3000 as alternative

### Issue 3: "Access blocked"
- Make sure APIs are enabled
- Check project is selected correctly
- Verify OAuth consent screen is configured

## 💡 Quick Test:

After setup, your Client ID should look like:
```
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
```

## 🎯 Expected Result:

✅ Google login popup opens
✅ User can select Google account  
✅ Redirects to beranda after successful login
✅ User info displays in sidebar