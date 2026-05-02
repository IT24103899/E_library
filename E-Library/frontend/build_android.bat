@echo off
echo ========================================
echo E-Library Android Build Script
echo ========================================
echo.

REM Set environment for Android build
set NODE_ENV=production
set REACT_APP_API_BASE_URL=https://mobile-backend-new.onrender.com/api

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo [2/4] Building React app...
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed
    exit /b 1
)

echo.
echo [3/4] Syncing to Capacitor Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)

echo.
echo [4/4] Building Android APK (app-debug.apk)...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Android build failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Your APK is ready at: android\app\build\outputs\apk\debug\app-debug.apk
echo 2. Transfer this APK to your phone and install it!
echo 3. Or use Android Studio to run it on an emulator.
echo.
