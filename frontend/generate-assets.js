import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG for the app icon
function createIconSVG(size, color = '#3B82F6') {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.2}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
          font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">CG</text>
</svg>`;
}

// Create a simple SVG for the splash screen
function createSplashSVG(width, height, color = '#3B82F6') {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${color}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${height * 0.1}" 
          font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">Coisas de Garagem</text>
</svg>`;
}

// Generate icon files
const iconSizes = [
    { size: 48, path: 'mipmap-mdpi' },
    { size: 72, path: 'mipmap-hdpi' },
    { size: 96, path: 'mipmap-xhdpi' },
    { size: 144, path: 'mipmap-xxhdpi' },
    { size: 192, path: 'mipmap-xxxhdpi' }
];

const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Create icon directories and files
iconSizes.forEach(({ size, path: dirPath }) => {
    const iconDir = path.join(androidResPath, dirPath);
    if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
    }
    
    const iconSVG = createIconSVG(size);
    fs.writeFileSync(path.join(iconDir, 'ic_launcher.svg'), iconSVG);
    
    // Also create a round icon
    fs.writeFileSync(path.join(iconDir, 'ic_launcher_round.svg'), iconSVG);
    
    console.log(`Created ${size}x${size} icon in ${dirPath}`);
});

// Create splash screen
const splashDir = path.join(androidResPath, 'drawable');
if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
}

const splashSVG = createSplashSVG(1280, 720);
fs.writeFileSync(path.join(splashDir, 'splash.svg'), splashSVG);
console.log('Created splash screen');

console.log('\nNote: These are SVG placeholder files. To convert them to PNG for production:');
console.log('1. Install ImageMagick or use an online converter');
console.log('2. Convert each SVG to PNG with the appropriate dimensions');
console.log('3. Alternatively, use @capacitor/assets CLI with proper PNG source files');
console.log('\nFor production, you should replace these with professionally designed icons and splash screens.');
