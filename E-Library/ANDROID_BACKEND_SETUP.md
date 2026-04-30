# Android Backend Connection Setup Guide

## Problem
The Android app wasn't connecting to the backend because:
- **Android Emulator:** Needs `10.0.2.2` instead of `localhost`
- **Physical Android Device:** Needs your PC's IP address
- **Web App:** Uses `localhost:8080` (only works locally)

## Solution
A centralized API configuration has been implemented that automatically detects the environment and uses the correct URL.

---

## Quick Setup

### 1. **Run Backend on Your PC**

```bash
cd E-Library/backend
mvn clean install
mvn spring-boot:run
```

Backend will run on: `http://localhost:8080/api`

#### Or use the batch script:
```bash
run_backend.bat
```

---

### 2. **For Android Emulator (Easiest)**

1. **Start Android Emulator** from Android Studio
2. **Build and run the app** in Android Studio
3. **Automatic:** The app will use `http://10.0.2.2:8080/api` automatically

✅ **It should work automatically!**

---

### 3. **For Physical Android Device**

#### Step 1: Find Your PC's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (usually `192.168.x.x`)

**Mac/Linux:**
```bash
ip addr show
# or
ifconfig
```

#### Step 2: Ensure Device & PC Are on Same Network
- Both must be connected to the same WiFi or network

#### Step 3: Update Environment Variables

Create a `.env.local` file in `E-Library/frontend/`:

```
REACT_APP_DEVICE_IP=http://192.168.1.100:8080/api
```

Replace `192.168.1.100` with your PC's actual IP address.

#### Step 4: Build Android App

```bash
cd E-Library/frontend
npm install
npm run build:android
# or use Android Studio to build
```

---

## Testing the Connection

### Option 1: Test from Browser
Visit from Android device: `http://YOUR_PC_IP:8080/api/books`

### Option 2: Enable Debug Logging
The app logs the API URL being used. Check Android Studio Logcat:
```
API Config: Using API URL = http://10.0.2.2:8080/api
```

### Option 3: Check Backend Logs
Backend logs all incoming requests. You should see requests from your Android device IP.

---

## Troubleshooting

### ❌ "Cannot reach server" Error

1. **Check backend is running:**
   ```bash
   # On your PC
   curl http://localhost:8080/api/health
   ```

2. **Check network connectivity:**
   ```bash
   # From Android device, ping your PC
   ping 192.168.1.100
   ```

3. **Check firewall:** Windows Defender firewall might block Java/Spring Boot
   - Go to **Windows Defender Firewall** → Allow app through firewall
   - Add Java/Spring Boot if not listed

4. **MySQL connection issue:** Backend can't reach database
   - Check database is running: `mysql -u root -p`
   - Check credentials in `application.yml`

### ❌ Emulator Can't Reach Server

- Ensure backend is running **before** starting emulator
- Restart emulator
- Try: `adb shell ping 10.0.2.2`

---

## API Configuration Details

### Location
`E-Library/frontend/src/config/ApiConfig.js`

### How It Works

```javascript
// Web Development
→ http://localhost:8080/api

// Android Emulator
→ http://10.0.2.2:8080/api

// Android Physical Device
→ http://192.168.1.X:8080/api (from .env.local)

// Production
→ From REACT_APP_API_URL environment variable
```

---

## Database Connection

Backend connects to MySQL at:
```
Host: localhost:3306
Database: elibrary_db
User: root
Password: Bharana@2004
```

#### Verify database exists:
```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
USE elibrary_db;
SHOW TABLES;
```

---

## Environment Variables Reference

| Variable | Usage | Example |
|----------|-------|---------|
| `REACT_APP_API_URL` | Override for all environments | `http://example.com/api` |
| `REACT_APP_DEVICE_IP` | Physical Android device IP | `http://192.168.1.100:8080/api` |

---

## File Changes Made

1. ✅ **Created:** `src/config/ApiConfig.js` - Environment-aware URL detection
2. ✅ **Created:** `src/services/ApiService.js` - Centralized fetch utility
3. ✅ **Updated:** `src/services/ReaderService.js` - Uses new config
4. ✅ **Updated:** `src/services/FeedbackService.js` - Uses new config
5. ✅ **Updated:** `src/services/ActivityService.js` - Uses new config
6. ⏳ **Next:** Update component-level fetch() calls to use `apiService`

---

## Next Steps

1. **Test in Android Emulator first** (easiest)
2. **If working:** Deploy to physical device
3. **Update any remaining hardcoded API URLs** in components
4. **Update backend security** for production (JWT, CORS, etc.)

---

## Questions?

Check logs using:
- **Windows (PowerShell):** `Get-Content backend_log.txt`
- **Android Studio:** Logcat filter for "API Config"
- **Browser DevTools:** Network tab to see requests
