@echo off
echo ========================================
echo E-Library Android Build Script
echo ========================================
echo.

REM Set environment for Android build
set NODE_ENV=production
set REACT_APP_API_BASE_URL=http://10.0.2.2:4000/api

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
echo [4/4] Building Android app...
cd android
call gradlew.bat build
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
echo 1. Open Android Studio
echo 2. Open the 'android' folder as a project
echo 3. Start Android Emulator (AVD Manager)
echo 4. Click Run or press Shift+F10
echo.
