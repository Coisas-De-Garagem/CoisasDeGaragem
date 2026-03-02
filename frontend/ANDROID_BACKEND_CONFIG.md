# Android Backend Configuration Guide

This guide explains how to configure the Android app to connect to the backend API and database.

## Overview

The Coisas de Garagem Android app is a **full-stack application** that connects to:
- **Backend API**: NestJS server running on port 3000
- **Database**: PostgreSQL database (hosted on Neon)

The app does **NOT** work with just the frontend - it requires the backend to be running.

## Architecture

```
Android App (Capacitor)
    ↓
Frontend (React)
    ↓
API Service (api.ts)
    ↓
Backend API (NestJS) - http://localhost:3000/api/v1
    ↓
Database (PostgreSQL on Neon)
```

## Current Configuration

### Backend API
- **URL**: `http://localhost:3000/api/v1` (default)
- **Port**: 3000
- **Technology**: NestJS
- **Database**: PostgreSQL (Neon)

### Frontend API Configuration
The frontend uses the [`api.ts`](./src/services/api.ts:26) service to communicate with the backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
```

## Configuration Scenarios

### 1. Development on Desktop Browser

For testing in the browser (localhost):

```bash
# Create .env file in frontend directory
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > frontend/.env
```

### 2. Android Emulator

When running on Android emulator, `localhost` refers to the emulator itself, not your development machine. Use `10.0.2.2` instead:

```bash
# Create .env file for emulator
echo "VITE_API_BASE_URL=http://10.0.2.2:3000/api/v1" > frontend/.env
```

### 3. Physical Android Device

When running on a physical device on the same network, use your computer's IP address:

```bash
# Find your computer's IP address
# Windows:
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)

# Create .env file with your IP
echo "VITE_API_BASE_URL=http://192.168.1.100:3000/api/v1" > frontend/.env
```

### 4. Production Backend

For production deployment:

```bash
# Create .env file with production URL
echo "VITE_API_BASE_URL=https://api.coisasdegaragem.com/api/v1" > frontend/.env
```

## Step-by-Step Setup

### Prerequisites

1. **Backend must be running**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Database must be accessible**
   - The backend is configured to use Neon PostgreSQL
   - Database URL is in [`backend/.env`](../backend/.env:1)

### For Android Emulator

1. **Start the backend**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Configure frontend for emulator**
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=http://10.0.2.2:3000/api/v1" > .env
   ```

3. **Build and sync**
   ```bash
   npm run build
   npx cap sync android
   ```

4. **Run on emulator**
   ```bash
   npx cap run android
   ```

### For Physical Device

1. **Start the backend**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Find your computer's IP**
   ```bash
   # Windows
   ipconfig
   
   # Look for IPv4 Address, e.g., 192.168.1.100
   ```

3. **Configure frontend with your IP**
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=http://192.168.1.100:3000/api/v1" > .env
   ```

4. **Build and sync**
   ```bash
   npm run build
   npx cap sync android
   ```

5. **Connect device and run**
   ```bash
   # Enable USB debugging on device
   # Connect device via USB
   npx cap run android
   ```

## Testing the Connection

### 1. Test Backend is Running

```bash
# Test backend API directly
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 2. Test from Android App

1. Open the app on device/emulator
2. Try to login or register
3. If successful, the connection is working
4. If you see network errors, check:
   - Backend is running
   - Correct API URL is configured
   - Device/emulator can reach the backend

### 3. Debug Network Issues

**Check Android logs:**
```bash
adb logcat | grep coisasdegaragem
```

**Common issues:**

| Issue | Solution |
|-------|----------|
| Connection refused | Backend not running - start it |
| Connection timeout | Wrong IP address - check your IP |
| Network error | Device not on same network - use WiFi |
| CORS error | Check backend CORS configuration |

## Using Mock Data

For testing without the backend, you can enable mock data:

```bash
# Create .env file
echo "VITE_ENABLE_MOCK_DATA=true" > frontend/.env
```

This will use the mock API in [`src/services/mock/mockApi.ts`](./src/services/mock/mockApi.ts:1) instead of the real backend.

**Note:** Mock data is limited and doesn't provide full functionality. Use only for UI testing.

## Backend API Endpoints

The app uses the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List all products
- `GET /products/my-products` - List user's products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `PATCH /products/:id/reserve` - Reserve product
- `PATCH /products/:id/unreserve` - Unreserve product
- `PATCH /products/:id/sold` - Mark product as sold

### QR Codes
- `GET /qr-codes/:productId` - Get QR code
- `POST /qr-codes/scan` - Scan QR code

### Purchases
- `GET /purchases` - List purchases
- `GET /purchases/sales` - List sales
- `GET /purchases/:id` - Get purchase details
- `POST /purchases` - Create purchase

### Analytics
- `GET /analytics/seller` - Get seller analytics

## Production Deployment

### Backend Deployment

1. Deploy backend to a cloud provider (Vercel, Railway, AWS, etc.)
2. Update backend environment variables
3. Ensure database is accessible
4. Get the production API URL

### Frontend Configuration

```bash
# Update .env with production URL
echo "VITE_API_BASE_URL=https://api.coisasdegaragem.com/api/v1" > frontend/.env

# Build for production
npm run build

# Sync with Android
npx cap sync android

# Build release APK/AAB
cd android
./gradlew assembleRelease  # APK
./gradlew bundleRelease    # AAB
```

### Security Considerations

1. **Never commit `.env` files** to version control
2. **Use HTTPS** for production backend
3. **Implement proper authentication** (JWT tokens)
4. **Enable CORS** on backend for your frontend domain
5. **Use environment variables** for sensitive data

## Troubleshooting

### Backend Not Responding

```bash
# Check if backend is running
curl http://localhost:3000/api/v1/health

# If not responding, start backend
cd backend
npm run start:dev
```

### Android Can't Connect

```bash
# Check device can reach backend
# Replace with your IP
adb shell ping 192.168.1.100

# Check firewall settings
# Ensure port 3000 is not blocked
```

### CORS Errors

If you see CORS errors in the browser console, check the backend CORS configuration in [`backend/src/main.ts`](../backend/src/main.ts:1):

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

For Android, you may need to add your device IP or use `*` for development.

## Network Configuration

### Firewall Settings

Ensure your firewall allows incoming connections on port 3000:

**Windows:**
```powershell
# Allow port 3000
New-NetFirewallRule -DisplayName "Allow Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Router Configuration

If using a physical device on WiFi:
1. Ensure both computer and device are on the same network
2. Disable any VPNs that might block local network access
3. Check router settings for any firewall rules

## Additional Resources

- [Backend Documentation](../backend/README.md)
- [API Service](./src/services/api.ts:1)
- [Capacitor Configuration](./capacitor.config.ts:1)
- [Android Deployment Guide](./ANDROID_DEPLOYMENT.md:1)

## Summary

✅ **The app DOES connect to the backend and database**
- Backend: NestJS API on port 3000
- Database: PostgreSQL on Neon
- Frontend: React app communicating via API

❌ **The app DOES NOT work with just frontend**
- Backend must be running
- Database must be accessible
- Correct API URL must be configured

📱 **For Android testing:**
- Emulator: Use `http://10.0.2.2:3000/api/v1`
- Physical device: Use your computer's IP address
- Production: Use your production API URL

---

**Last Updated:** 2026-03-02
**Backend Port:** 3000
**Database:** PostgreSQL (Neon)
