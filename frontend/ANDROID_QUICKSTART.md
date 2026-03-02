# Android Quick Start Guide - Coisas de Garagem

A quick guide to get started with Android development for the Coisas de Garagem app.

## Prerequisites

- Node.js (v18+)
- Android Studio
- Android device or emulator

## Quick Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Sync with Capacitor

```bash
npx cap sync android
```

### 4. Open in Android Studio

```bash
npx cap open android
```

### 5. Run the App

**Option A: Using Android Studio**
1. Click the "Run" button (green triangle)
2. Select your device/emulator
3. Wait for the app to install and launch

**Option B: Using Command Line**
```bash
cd android
./gradlew installDebug
```

## Development Workflow

### Make Changes to Web App

1. Edit files in `src/` directory
2. Start dev server: `npm run dev`
3. Test in browser at http://localhost:5173

### Update Android App

```bash
# Build web app
npm run build

# Sync changes
npx cap sync android

# Reinstall on device
cd android
./gradlew installDebug
```

## Build APK for Testing

```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Sync with Android
npx cap sync android

# Open Android Studio
npx cap open android

# Run on connected device
npx cap run android

# Clean build
cd android
./gradlew clean

# Install debug APK
./gradlew installDebug

# Uninstall app
adb uninstall com.coisasdegaragem.app

# View logs
adb logcat | grep coisasdegaragem
```

## Troubleshooting

### Build Fails

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Sync Issues

```bash
npx cap rm android
npx cap add android
npx cap sync android
```

### App Not Installing

```bash
# Check device connection
adb devices

# Uninstall old version
adb uninstall com.coisasdegaragem.app

# Reinstall
./gradlew installDebug
```

## Project Structure

```
frontend/
├── android/              # Android native project
├── src/                  # React source code
├── dist/                 # Built web assets
├── capacitor.config.ts   # Capacitor configuration
└── package.json          # Dependencies
```

## Next Steps

- Read [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md) for detailed deployment instructions
- Read [capacitor-assets/README.md](./capacitor-assets/README.md) for asset generation
- Configure signing keys for release builds
- Set up Google Play Console for publishing

## Support

For detailed information, see the full [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md) guide.

---

**Quick Reference:**
- App ID: `com.coisasdegaragem.app`
- Package Name: `com.coisasdegaragem.app`
- Min SDK: 24
- Target SDK: 36
