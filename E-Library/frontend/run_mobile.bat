@echo off
setlocal

set JAVA_HOME=C:\Users\user\.jdks\dragonwell-ex-21.0.9
set ANDROID_HOME=C:\Users\user\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%

echo [1/2] Building Android APK...
cd /d "%~dp0android"
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Gradle build failed
    pause
    exit /b 1
)

echo.
echo [2/2] Installing and launching on emulator...
cd /d "%~dp0android"
adb -s emulator-5554 install -r "app\build\outputs\apk\debug\app-debug.apk"
adb -s emulator-5554 shell am start -n "com.elibrary.app/.MainActivity"

echo.
echo App launched on emulator!
