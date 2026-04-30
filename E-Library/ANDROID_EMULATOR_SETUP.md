# Android Emulator Setup Guide

## ✅ What's Already Configured

Your E-Library project is **ready for Android**! Here's what's set up:

- ✅ **Capacitor Framework** - Converts React web app to native Android
- ✅ **Android Project** - Located in `frontend/android/`
- ✅ **API Configuration** - Automatically detects platform and uses correct URLs
- ✅ **Build Scripts** - Batch scripts to automate the build process

---

## 🚀 Quick Start (5 Minutes)

### **Option 1: Automatic (Windows)**

```bash
# From E-Library/frontend folder
build_android.bat
```

Then open Android Studio and run the app.

---

### **Option 2: Manual Setup**

#### **Prerequisites**
1. ✅ **Android Studio** installed
2. ✅ **Backend running** (`http://localhost:8080/api`)
3. ✅ **Node.js** installed

#### **Step 1: Build the Web App**
```bash
cd E-Library/frontend
npm install
npm run build
```

#### **Step 2: Sync to Android**
```bash
npx cap sync android
```

#### **Step 3: Open in Android Studio**
1. Open **Android Studio**
2. Click **File > Open**
3. Navigate to `E-Library/frontend/android`
4. Wait for Gradle to finish syncing
5. Click **AVD Manager** (top-right corner)

#### **Step 4: Launch Emulator**
1. Click **Launch** on any emulator (Pixel 4, API 30+)
2. Wait for it to fully boot (~60 seconds)

#### **Step 5: Run the App**
1. Click **Run** (Shift+F10)
2. Select your running emulator
3. Wait for app to build and deploy

---

## 🔗 API Configuration for Android Emulator

The app **automatically** uses the correct API:

- **Emulator:** `http://10.0.2.2:8080/api` ✅ *Automatic*
- **Web:** `http://localhost:8080/api` ✅ *Automatic*
- **Physical Device:** `http://192.168.8.102:8080/api` (from `.env.android`)

**Why 10.0.2.2?**
- Android emulator runs in a virtual machine
- `10.0.2.2` is the alias for the host machine
- This allows the emulator to reach your backend on `localhost:8080`

---

## ✅ Verify Setup

### **Test 1: Backend Connection**
```bash
# On your PC, test the backend
curl http://localhost:8080/api/books
```

Should return a JSON list of books (not an error).

### **Test 2: Emulator Network**
```bash
# In Android Emulator terminal
adb shell ping 10.0.2.2
```

Should show successful pings (not "destination unreachable").

### **Test 3: App Logs**
Once app is running:
1. Open **Logcat** (bottom panel in Android Studio)
2. Look for `[API Config]` messages
3. Should show: `API Config: Using emulator URL: http://10.0.2.2:8080/api`

---

## 🐛 Troubleshooting

### ❌ "Connection refused" Error

**Solution:**
1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check firewall isn't blocking Java process
3. Restart emulator and backend
4. Check backend logs for errors

### ❌ Gradle Sync Fails

**Solution:**
```bash
cd frontend/android
./gradlew clean
./gradlew build
```

### ❌ "10.0.2.2 unreachable" in Emulator

**Solution:**
1. Restart emulator
2. Check if backend is actually running
3. Try: `adb shell ping 10.0.2.2`

### ❌ App Crashes on Startup

**Solution:**
1. Check **Logcat** for error messages
2. Verify `capacitor.config.ts` has correct `webDir: 'build'`
3. Run: `npm run build && npx cap sync android`

---

## 📱 For Physical Android Device

If you want to test on a real device instead:

1. **Find your PC's IP:**
   ```bash
   ipconfig | findstr /I "IPv4"
   # Look for: 192.168.x.x
   ```

2. **Update `.env.android`:**
   ```
   REACT_APP_DEVICE_IP=http://192.168.8.102:8080/api
   ```

3. **Rebuild and deploy:**
   ```bash
   npm run build
   npx cap sync android
   ```

4. **Connect device via USB** and run from Android Studio

---

## 📚 File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── ApiConfig.js          ← API detection logic
│   └── ... (React components)
├── android/                       ← Native Android project
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           └── ... (Android resources)
│   ├── build.gradle
│   └── gradlew / gradlew.bat
├── capacitor.config.ts            ← Capacitor configuration
├── build_android.bat              ← Build script (Windows)
├── build_android.sh               ← Build script (Mac/Linux)
└── run_android_emulator.bat       ← Quick launch script
```

---

## 🔄 Development Workflow

1. **Make changes to React code** (`src/`)
2. **Rebuild:** `npm run build`
3. **Sync to Android:** `npx cap sync android`
4. **Run in emulator:** `Shift+F10` in Android Studio
5. **View logs:** Check Logcat panel

---

## 📖 Useful Commands

```bash
# Build commands
npm run build                       # Build React web app
npx cap sync android               # Sync to Android
npx cap build android              # Full Capacitor build

# Android commands
adb devices                        # List connected emulators
adb shell                          # Open emulator shell
adb shell ping 10.0.2.2            # Test host connectivity
adb logcat                         # View emulator logs

# Gradle commands (from android/ folder)
./gradlew build                    # Build Android APK
./gradlew clean                    # Clean build artifacts
./gradlew installDebug             # Install debug APK to emulator
```

---

## ✨ Success!

When you see this in Logcat:
```
[API Config] Android Emulator detected - using 10.0.2.2
[API Config] Using emulator URL: http://10.0.2.2:8080/api
```

Then the app is connected and ready to use! 🎉

---

## 💡 Next Steps

- Modify the React app as needed
- Test all features on emulator
- Submit to Google Play Store or APK distribution
- Integrate CI/CD for automated builds
