@echo off
echo Starting E-Library Backend...
echo.

cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend\target"

if not exist "elibrary-backend-1.0.0.jar" (
    echo ERROR: JAR file not found!
    echo Please run: build.bat first
    pause
    exit /b 1
)

set "JAVA_HOME=C:\Users\user\Downloads\PRGRAM_File\jdk-21_windows-x64_bin\jdk-21.0.9"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo ERROR: Java not found at %JAVA_HOME%
    pause
    exit /b 1
)

echo Backend will start on: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

"%JAVA_HOME%\bin\java.exe" -jar elibrary-backend-1.0.0.jar

pause
