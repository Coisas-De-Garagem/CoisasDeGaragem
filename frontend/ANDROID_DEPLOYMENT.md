# Android App Deployment Guide - Coisas de Garagem

This guide provides comprehensive instructions for building, testing, and deploying the Coisas de Garagem Android application using Capacitor.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Building the App](#building-the-app)
5. [Testing the App](#testing-the-app)
6. [Signing and Release](#signing-and-release)
7. [Publishing to Google Play Store](#publishing-to-google-play-store)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **Java Development Kit (JDK)** (v21 or higher)
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Set `JAVA_HOME` environment variable

3. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API level 24+)
   - Install Android SDK Build-Tools
   - Install Android SDK Platform-Tools

4. **Gradle** (included with Android Studio)

### Environment Setup

```bash
# Verify Node.js installation
node --version

# Verify Java installation
java -version

# Verify Android SDK
adb version
```

## Project Structure

```
frontend/
├── android/                          # Android native project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/             # Java/Kotlin source files
│   │   │       ├── res/              # Resources (icons, strings, etc.)
│   │   │       └── assets/           # Web assets (from dist/)
│   │   ├── build.gradle              # App module build configuration
│   │   └── proguard-rules.pro        # ProGuard rules
│   ├── build.gradle                  # Project build configuration
│   ├── settings.gradle               # Project settings
│   └── gradle.properties             # Gradle properties
├── dist/                             # Built web assets
├── capacitor.config.ts              # Capacitor configuration
└── package.json                      # Node dependencies
```

## Development Workflow

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

### 2. Make Changes to the Web App

Edit files in `src/` directory. Changes will be hot-reloaded.

### 3. Test in Browser

Open http://localhost:5173 in your browser.

### 4. Build and Sync to Android

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android
```

### 5. Open in Android Studio

```bash
npx cap open android
```

## Building the App

### Debug Build

```bash
# Option 1: Using Gradle command line
cd android
./gradlew assembleDebug

# Option 2: Using Android Studio
# 1. Open Android Studio
# 2. Open the android/ directory
# 3. Build > Build Bundle(s) / APK(s) > Build APK(s)
```

The debug APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build

```bash
# Option 1: Using Gradle command line
cd android
./gradlew assembleRelease

# Option 2: Using Android Studio
# 1. Open Android Studio
# 2. Open the android/ directory
# 3. Build > Build Bundle(s) / APK(s) > Build APK(s)
```

The release APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle (AAB)

For Google Play Store distribution:

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be located at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Testing the App

### Using Android Emulator

1. Start Android Studio
2. Create an AVD (Android Virtual Device)
3. Start the emulator
4. Run the app:

```bash
cd android
./gradlew installDebug
```

### Using Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Verify connection:

```bash
adb devices
```

5. Install the app:

```bash
cd android
./gradlew installDebug
```

### Using Capacitor CLI

```bash
# Run on connected device/emulator
npx cap run android

# Open Android Studio
npx cap open android
```

## Signing and Release

### Creating a Keystore

```bash
keytool -genkey -v -keystore coisasdegaragem.keystore -alias coisasdegaragem -keyalg RSA -keysize 2048 -validity 10000
```

### Configuring Signing in Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('coisasdegaragem.keystore')
            storePassword 'your_store_password'
            keyAlias 'coisasdegaragem'
            keyPassword 'your_key_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Building Signed Release APK

```bash
cd android
./gradlew assembleRelease
```

### Building Signed AAB

```bash
cd android
./gradlew bundleRelease
```

## Publishing to Google Play Store

### 1. Create Google Play Developer Account

- Visit: https://play.google.com/console
- Pay the one-time registration fee ($25)

### 2. Prepare Your App

1. **App Information**
   - App name: Coisas de Garagem
   - Short description
   - Full description
   - Screenshots (at least 2)
   - Feature graphic (1024x500px)
   - App icon (512x512px)

2. **Content Rating**
   - Complete the content rating questionnaire

3. **Store Listing**
   - Provide all required information
   - Upload promotional materials

### 3. Upload Your App

1. Go to Google Play Console
2. Create a new app
3. Upload the AAB file:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

4. Complete the store listing

### 4. Testing

1. **Internal Testing**
   - Upload your APK/AAB
   - Add tester email addresses
   - Test internally

2. **Closed Testing**
   - Create a closed track
   - Add testers
   - Collect feedback

3. **Open Testing**
   - Make available to larger audience
   - Gather more feedback

### 5. Production Release

1. Review all testing feedback
2. Fix any issues
3. Create production release
4. Submit for review
5. Wait for approval (usually 1-3 days)

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem:** Gradle build fails with errors

**Solution:**
```bash
# Clean build
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug
```

#### 2. Sync Issues

**Problem:** Capacitor sync fails

**Solution:**
```bash
# Remove android platform
npx cap rm android

# Add android platform again
npx cap add android

# Sync
npx cap sync android
```

#### 3. Permission Errors

**Problem:** App crashes due to missing permissions

**Solution:** Check `android/app/src/main/AndroidManifest.xml` and ensure all required permissions are declared.

#### 4. Icon/Splash Screen Issues

**Problem:** Icons or splash screens not displaying correctly

**Solution:**
```bash
# Regenerate assets
cd frontend
node generate-assets.js

# Sync with Capacitor
npx cap sync android
```

#### 5. Network Issues

**Problem:** App can't connect to backend API

**Solution:** Check `capacitor.config.ts` and ensure the backend URL is correctly configured in `server.allowNavigation`.

### Debug Mode

Enable debug logging in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ... other config
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*'],
    logging: true  // Enable logging
  }
};
```

### View Logs

```bash
# View Android logs
adb logcat

# Filter by app
adb logcat | grep "coisasdegaragem"
```

## Version Management

### Updating Version Number

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.coisasdegaragem.app"
    minSdkVersion 24
    targetSdkVersion 36
    versionCode 2  // Increment this for each release
    versionName "1.1.0"  // Semantic version
}
```

### Version Code Rules

- Increment versionCode for every release
- versionCode must be an integer
- Once set, versionCode cannot decrease

## Performance Optimization

### 1. Reduce APK Size

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2. Enable App Bundles

Use AAB instead of APK for Google Play Store to reduce download size.

### 3. Optimize Images

- Compress images before adding to project
- Use WebP format where possible
- Remove unused resources

## Security Best Practices

1. **Never commit keystore files** to version control
2. **Use environment variables** for sensitive data
3. **Enable ProGuard/R8** for release builds
4. **Keep dependencies updated**
5. **Review permissions** regularly
6. **Use certificate pinning** for API calls

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console](https://play.google.com/console)
- [Gradle Documentation](https://docs.gradle.org/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Capacitor documentation
3. Check Android Studio logs
4. Consult the project repository

---

**Last Updated:** 2026-03-02
**App Version:** 1.0.0
**Target SDK:** 36
**Min SDK:** 24
