# Viport Android App

Modern Android application built with Kotlin and Jetpack Compose for the Viport social media platform.

## 🚀 Quick Setup for Android Studio

### Opening the Project

1. **Open Android Studio**
2. **Select "Open an Existing Project"**
3. **Navigate to this exact folder**: 
   - **Windows Path**: `D:\Viport\apps\android`
   - **Or wherever your Viport project is located**: `[your-path]\Viport\apps\android`
4. **Click "OK"**

Android Studio will automatically detect this as a Gradle project and sync dependencies.

### Prerequisites

- **Android Studio**: Hedgehog (2023.1.1) or newer
- **JDK**: OpenJDK 11 or newer  
- **Android SDK**: API 26+ (Android 8.0+)
- **Gradle**: 8.2+ (included with Android Studio)

### First Build

1. **Wait for Gradle Sync** to complete (may take a few minutes)
2. **Download any missing SDK components** when prompted
3. **Click "Build > Make Project"** or use `Ctrl+F9`
4. **Run on device/emulator** using the green "Run" button

## 📱 Features

- **Modern UI**: Jetpack Compose with Material Design 3
- **Authentication**: Login, registration, Google Sign-In
- **Social Feed**: Instagram-like feed with posts and interactions  
- **Clean Architecture**: MVVM pattern with Hilt dependency injection
- **Type Safe**: 100% Kotlin with modern coroutines

## 🛠️ Tech Stack

- **Language**: Kotlin 100%
- **UI**: Jetpack Compose + Material 3
- **Architecture**: MVVM + Clean Architecture
- **DI**: Dagger Hilt
- **Networking**: Retrofit + OkHttp
- **Navigation**: Navigation Compose
- **State**: StateFlow + Compose State

## 🏗️ Project Structure

```
app/src/main/
├── java/com/viport/android/
│   ├── ViportApplication.kt          # App entry point
│   ├── di/                           # Dependency injection
│   │   └── NetworkModule.kt         # Network setup
│   └── presentation/                 # UI layer
│       ├── MainActivity.kt          # Main activity
│       ├── auth/                    # Login/Register screens
│       ├── home/                    # Home feed
│       ├── navigation/              # App navigation
│       ├── splash/                  # Splash screen
│       └── theme/                   # Material theme
├── res/                             # Android resources
│   ├── values/                     # Strings, colors, themes
│   ├── drawable/                   # Vector graphics
│   ├── font/                       # Custom fonts
│   └── xml/                        # Configurations
└── AndroidManifest.xml             # App manifest
```

## 🚀 Running the App

### Debug Build

1. **Connect Android device** or **start emulator**
2. **Click "Run" button** (green play icon) in Android Studio
3. **Select target device** and click "OK"

### API Configuration

- **Debug**: Connects to `http://10.0.2.2:8080/api` (local backend)
- **Release**: Connects to `https://api.viport.com/api` (production)

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password123`

## 🔧 Development

### Common Gradle Commands

```bash
# Clean build
./gradlew clean

# Build debug APK  
./gradlew assembleDebug

# Install on connected device
./gradlew installDebug

# Run tests
./gradlew test
```

### Troubleshooting

1. **Sync Issues**: File → Invalidate Caches and Restart
2. **Build Errors**: Build → Clean Project, then Rebuild
3. **Missing Dependencies**: Check internet connection and retry sync
4. **Emulator Issues**: Use API 26+ with hardware acceleration enabled

## 📦 Dependencies

Key libraries used in this project:

- **Compose**: `androidx.compose.*` - Modern UI toolkit
- **Hilt**: `com.google.dagger.hilt.*` - Dependency injection
- **Retrofit**: `com.squareup.retrofit2.*` - HTTP client
- **Navigation**: `androidx.navigation.*` - In-app navigation
- **Coroutines**: `org.jetbrains.kotlinx.*` - Async programming

## 🔄 Integration

This Android app integrates with:

- **Go Backend**: REST API at `/api/*` endpoints
- **Next.js Web App**: Shared design system and user experience
- **Shared Types**: Common data models across platforms

## 📝 Next Steps

1. **Build and run** the app in Android Studio
2. **Test login flow** with demo credentials
3. **Explore the feed** and UI components
4. **Review code structure** for development patterns

---

**Note**: This is part of the Viport monorepo. The Android app shares design patterns and API contracts with the web application and backend services.