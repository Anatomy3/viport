# Viport Android App 📱

A native Android application built with Kotlin and Jetpack Compose that provides the full Viport experience - social media, marketplace, and learning platform.

## 🚀 Features

### ✅ Implemented
- **Authentication System**
  - Email/password login and registration
  - Google OAuth integration
  - Biometric authentication support
  - Secure token storage with DataStore
  - JWT token refresh mechanism

- **Modern UI/UX**
  - Material Design 3 implementation
  - Dark mode support
  - Smooth animations and transitions
  - Responsive layouts for all screen sizes
  - Professional splash screen

- **Architecture**
  - MVVM with Clean Architecture
  - Dependency injection with Hilt
  - Room database for local storage
  - Retrofit for API communication
  - StateFlow for reactive UI

### 🚧 In Progress
- **Social Feed**: Posts, images, videos, comments, likes
- **User Profiles**: Profile management, portfolio showcase
- **Marketplace**: Digital products, purchases, reviews
- **Learning Platform**: Courses, lessons, progress tracking
- **Real-time Chat**: Messaging, notifications
- **Media Handling**: Camera, file upload, image processing

## 📋 Technical Stack

### Core Technologies
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **Dependency Injection**: Dagger Hilt
- **Database**: Room (SQLite)
- **Networking**: Retrofit + OkHttp
- **Image Loading**: Coil
- **Navigation**: Navigation Compose

### Key Libraries
```kotlin
// Core Android
androidx.core:core-ktx
androidx.lifecycle:lifecycle-runtime-ktx
androidx.activity:activity-compose

// Compose
androidx.compose:compose-bom
androidx.compose.material3:material3
androidx.navigation:navigation-compose

// Architecture
androidx.lifecycle:lifecycle-viewmodel-compose
androidx.hilt:hilt-navigation-compose
com.google.dagger:hilt-android

// Database
androidx.room:room-runtime
androidx.room:room-ktx

// Networking
com.squareup.retrofit2:retrofit
com.squareup.retrofit2:converter-gson
com.squareup.okhttp3:logging-interceptor

// Authentication
com.google.android.gms:play-services-auth
androidx.biometric:biometric

// Storage
androidx.datastore:datastore-preferences

// Media
io.coil-kt:coil-compose
androidx.camera:camera-camera2
androidx.media3:media3-exoplayer
```

## 🛠️ Setup Instructions

### Prerequisites
- Android Studio Hedgehog | 2023.1.1 or newer
- JDK 8 or higher
- Android SDK 24+ (Android 7.0)
- Gradle 8.0+

### 1. Clone and Setup
```bash
# Navigate to Android app directory
cd enterprise-monorepo/apps/android

# Open in Android Studio
# File > Open > Select android folder
```

### 2. Configure Environment
Create `local.properties` file in the android root:
```properties
sdk.dir=/path/to/your/Android/Sdk
GOOGLE_CLIENT_ID="your_google_client_id_here.apps.googleusercontent.com"
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
6. Add authorized redirect URIs:
   - `your.package.name://oauth` (for debug)
   - `com.viport.android://oauth` (for release)

### 4. Backend Configuration
Update `BuildConfig.BASE_URL` in `app/build.gradle.kts`:
```kotlin
buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:8080/api/\"") // For emulator
// or
buildConfigField("String", "BASE_URL", "\"http://your-ip:8080/api/\"") // For physical device
```

### 5. Build and Run
```bash
# Clean and build
./gradlew clean build

# Install debug APK
./gradlew installDebug

# Run tests
./gradlew test
```

## 🏗️ Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/viport/android/
│   │   │   ├── data/                    # Data layer
│   │   │   │   ├── local/              # Room database, DAOs
│   │   │   │   ├── remote/             # API services, DTOs
│   │   │   │   └── repository/         # Repository implementations
│   │   │   ├── di/                     # Dependency injection modules
│   │   │   ├── domain/                 # Domain layer
│   │   │   │   ├── model/              # Domain models
│   │   │   │   ├── repository/         # Repository interfaces
│   │   │   │   ├── usecase/            # Use cases
│   │   │   │   └── util/               # Domain utilities
│   │   │   ├── presentation/           # Presentation layer
│   │   │   │   ├── auth/               # Authentication screens
│   │   │   │   ├── home/               # Home screen
│   │   │   │   ├── navigation/         # Navigation setup
│   │   │   │   ├── splash/             # Splash screen
│   │   │   │   └── theme/              # Material Design theme
│   │   │   └── ViportApplication.kt    # Application class
│   │   ├── res/                        # Resources
│   │   │   ├── drawable/               # Icons, images
│   │   │   ├── values/                 # Strings, colors, themes
│   │   │   └── xml/                    # Configuration files
│   │   └── AndroidManifest.xml         # App manifest
│   └── test/                           # Unit tests
└── build.gradle.kts                    # Module build configuration
```

## 🔐 Security Features

### Authentication Security
- **Secure Token Storage**: DataStore with encryption
- **Token Refresh**: Automatic JWT token renewal
- **Biometric Authentication**: Fingerprint/face unlock
- **OAuth State Validation**: CSRF protection
- **Rate Limiting**: Prevents brute force attacks

### Network Security
- **Certificate Pinning**: SSL/TLS validation
- **Request Encryption**: HTTPS enforcement
- **API Key Protection**: Obfuscated in native code
- **User Agent Validation**: Custom headers

### Data Security
- **Local Database Encryption**: SQLCipher integration
- **Secure Preferences**: Encrypted SharedPreferences
- **File System Protection**: Private storage usage
- **Screen Recording Prevention**: Secure flag on sensitive screens

## 📱 UI/UX Features

### Material Design 3
- **Dynamic Colors**: Follows system theme
- **Adaptive Layouts**: Responsive for tablets
- **Motion System**: Smooth transitions
- **Typography Scale**: Consistent text styling

### Accessibility
- **Screen Reader Support**: TalkBack compatibility
- **High Contrast Mode**: Enhanced visibility
- **Large Text Support**: Dynamic font sizing
- **Touch Target Sizing**: Minimum 48dp targets

### Performance
- **Image Loading**: Coil with memory/disk caching
- **Lazy Loading**: Efficient list rendering
- **State Management**: Optimized recomposition
- **Battery Optimization**: Background task management

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
./gradlew testDebugUnitTest

# Generate coverage report
./gradlew jacocoTestReport
```

### UI Tests
```bash
# Run instrumented tests
./gradlew connectedAndroidTest

# Run specific test class
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.viport.android.AuthTest
```

### Test Structure
```
src/test/java/                          # Unit tests
├── com/viport/android/
│   ├── domain/usecase/                 # Use case tests
│   ├── data/repository/                # Repository tests
│   └── presentation/viewmodel/         # ViewModel tests

src/androidTest/java/                   # Integration tests
├── com/viport/android/
│   ├── data/database/                  # Database tests
│   ├── presentation/ui/                # UI tests
│   └── di/                            # DI tests
```

## 📦 Build Variants

### Debug
- **Package**: `com.viport.android.debug`
- **API URL**: Local development server
- **Logging**: Verbose logging enabled
- **Obfuscation**: Disabled for debugging

### Release
- **Package**: `com.viport.android`
- **API URL**: Production server
- **Logging**: Error logging only
- **Obfuscation**: ProGuard enabled

## 🚀 Deployment

### Debug APK
```bash
# Build debug APK
./gradlew assembleDebug

# APK location: app/build/outputs/apk/debug/app-debug.apk
```

### Release APK
```bash
# Build release APK
./gradlew assembleRelease

# APK location: app/build/outputs/apk/release/app-release.apk
```

### Play Store Bundle
```bash
# Build App Bundle for Play Store
./gradlew bundleRelease

# Bundle location: app/build/outputs/bundle/release/app-release.aab
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clean project
./gradlew clean

# Invalidate caches and restart Android Studio
# File > Invalidate Caches and Restart
```

**OAuth Issues**
- Verify Google Client ID is correct
- Check SHA-1 fingerprint matches
- Ensure redirect URIs are properly configured
- Test on physical device if emulator fails

**Network Issues**
- Check backend server is running
- Verify API base URL is correct
- For emulator, use `10.0.2.2` instead of `localhost`
- Check device/emulator network connectivity

**Database Issues**
```bash
# Clear app data
adb shell pm clear com.viport.android.debug

# View database
# Android Studio > App Inspection > Database Inspector
```

### Debug Tools
- **Layout Inspector**: UI debugging
- **Network Inspector**: API call monitoring
- **Database Inspector**: Room database viewing
- **Profiler**: Performance analysis

## 📊 Performance Monitoring

### Metrics Tracked
- **App Startup Time**: Cold/warm start performance
- **Screen Transition Time**: Navigation performance
- **Memory Usage**: Heap and object allocation
- **Network Performance**: API response times
- **Battery Usage**: Background task optimization

### Monitoring Tools
- **Firebase Performance**: Real-time monitoring
- **Crashlytics**: Crash reporting
- **Analytics**: User behavior tracking
- **Custom Metrics**: Business-specific KPIs

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Android CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 11
        uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'temurin'
      - name: Run tests
        run: ./gradlew test
      - name: Build APK
        run: ./gradlew assembleDebug
```

## 📞 Support

### Getting Help
1. **Documentation**: Check this README and inline code comments
2. **Issues**: Report bugs via GitHub Issues
3. **Discussions**: Join team discussions
4. **Stack Overflow**: Tag questions with `viport-android`

### Contributing
1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## 🎯 Future Roadmap

### Phase 1 (Current)
- ✅ Authentication system
- ✅ Basic UI/UX
- 🚧 Social feed functionality

### Phase 2
- 🔲 Complete marketplace
- 🔲 Learning platform
- 🔲 Real-time chat

### Phase 3
- 🔲 Advanced media features
- 🔲 Offline synchronization
- 🔲 Push notifications

### Phase 4
- 🔲 Widget support
- 🔲 Wear OS companion
- 🔲 Tablet optimization

## 📄 License

This project is part of the Viport platform. All rights reserved.

---

**Built with ❤️ using Kotlin and Jetpack Compose**