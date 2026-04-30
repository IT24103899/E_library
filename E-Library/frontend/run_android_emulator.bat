@echo off
echo ========================================
echo E-Library Android Emulator Builder
echo ========================================
echo.

REM Colors and formatting
echo This script will help you build and run the Android app
echo on an Android emulator.
echo.

REM Step 1: Check pre-requisites
echo [CHECKING] Pre-requisites...
echo.

REM Check if Android SDK is available
if not exist "%ANDROID_HOME%" (
    echo [WARNING] ANDROID_HOME not found. Please install Android Studio first.
    echo Download from: https://developer.android.com/studio
    pause
    exit /b 1
)

echo [OK] Android SDK found at: %ANDROID_HOME%
echo.

REM Step 2: Build the app
echo [BUILDING] React and Capacitor app...
echo.
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build React app
    pause
    exit /b 1
)

call npx cap sync android
if errorlevel 1 (
    echo [ERROR] Failed to sync Capacitor
    pause
    exit /b 1
)

echo [OK] Build successful!
echo.

REM Step 3: Open Android Studio
echo [NEXT] Opening Android Studio with the Android project...
echo.

if exist "%ANDROID_HOME%\studio\bin\studio64.exe" (
    start "" "%ANDROID_HOME%\studio\bin\studio64.exe" "android"
) else (
    echo [INFO] Please open Android Studio manually
    echo [INFO] File > Open > Select the 'android' folder in this directory
)

echo.
echo ========================================
echo Next steps in Android Studio:
echo ========================================
echo 1. Wait for Gradle to sync
echo 2. Click AVD Manager (top right)
echo 3. Click Launch on any emulator
echo 4. Wait for emulator to boot
echo 5. Press Shift+F10 to run the app
echo 6. Or click Run > Run 'app'
echo.
echo ========================================
echo Backend should be running at:
echo http://localhost:8080/api
echo ========================================
echo.
pause
