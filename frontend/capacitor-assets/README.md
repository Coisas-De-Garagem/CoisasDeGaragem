# Capacitor Assets

This directory contains the app icons and splash screens for the mobile application.

## Current Status

✅ **Android assets have been generated** using the `generate-assets.js` script
❌ **iOS assets are not configured** (iOS development not currently supported)

## Android Assets

### Generated Assets

The following placeholder assets have been generated for Android:

#### App Icons (SVG format)
- `mipmap-mdpi/ic_launcher.svg` - 48x48px
- `mipmap-hdpi/ic_launcher.svg` - 72x72px
- `mipmap-xhdpi/ic_launcher.svg` - 96x96px
- `mipmap-xxhdpi/ic_launcher.svg` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.svg` - 192x192px

#### Splash Screen (SVG format)
- `drawable/splash.svg` - 1280x720px

### Converting SVG to PNG

For production builds, you need to convert the SVG files to PNG format:

#### Option 1: Using ImageMagick

```bash
# Install ImageMagick (Windows)
# Download from: https://imagemagick.org/script/download.php#windows

# Convert icons
magick android/app/src/main/res/mipmap-mdpi/ic_launcher.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick android/app/src/main/res/mipmap-hdpi/ic_launcher.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
magick android/app/src/main/res/mipmap-xhdpi/ic_launcher.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
magick android/app/src/main/res/mipmap-xxhdpi/ic_launcher.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
magick android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Convert splash screen
magick android/app/src/main/res/drawable/splash.svg -resize 1280x720 android/app/src/main/res/drawable/splash.png
```

#### Option 2: Online Converters

Use online SVG to PNG converters:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/pt/svg-png/
- https://www.aconvert.com/image/svg-to-png/

#### Option 3: Using Figma or Adobe Illustrator

1. Open the SVG file in Figma or Adobe Illustrator
2. Export as PNG with the appropriate dimensions
3. Replace the SVG file with the PNG

### Regenerating Assets

To regenerate the placeholder assets:

```bash
cd frontend
node generate-assets.js
```

### Custom Assets

For production, replace the placeholder assets with professionally designed icons and splash screens:

#### App Icon Requirements
- Square PNG with transparent background
- Minimum sizes: 48x48px to 512x512px
- Simple, recognizable design
- Good contrast at small sizes

#### Splash Screen Requirements
- High-resolution PNG (minimum 1280x720px)
- Centered content (will be cropped on different screen sizes)
- App name or logo prominently displayed
- Consistent with app branding

## How to Generate Icons and Splash Screens

### Option 1: Use Capacitor Assets CLI (Recommended)

1. Install the Capacitor Assets CLI:
```bash
npm install @capacitor/assets --save-dev
```

2. Place your source icon and splash screen images in this directory:
- `icon.png` - 1024x1024px PNG file for the app icon
- `splash.png` - 2732x2732px PNG file for the splash screen

3. Generate the assets:
```bash
npx capacitor-assets generate
```

### Option 2: Manual Creation

Create the following files manually:

#### Android Icons
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` - 48x48px
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` - 72x72px
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` - 96x96px
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` - 192x192px

#### Android Splash Screen
- `android/app/src/main/res/drawable/splash.png` - 1280x720px (recommended)

#### iOS Icons
- `ios/App/App.xcassets/AppIcon.appiconset/` - Various sizes (use Xcode to generate)

#### iOS Splash Screen
- `ios/App/App.xcassets/LaunchImage.launchimage/` - Various sizes (use Xcode to generate)

## Notes

- For Android development, you need Android Studio installed
- The app icon should be a square PNG with transparent background
- The splash screen should be a high-resolution PNG that will be cropped to fit different screen sizes
- SVG files are used as placeholders and should be converted to PNG for production
- For production, you should replace these with professionally designed icons and splash screens

## Additional Resources

- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design)
- [Android Splash Screen Guidelines](https://developer.android.com/develop/ui/views/launch/splash-screen)
- [Capacitor Assets Documentation](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
