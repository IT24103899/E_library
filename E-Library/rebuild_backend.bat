@echo off
REM Build wrapper with proper environment setup
setlocal enabledelayedexpansion

REM Setup Java 21
set "JAVA_HOME=C:\Users\user\Downloads\PRGRAM_File\jdk-21_windows-x64_bin\jdk-21.0.9"

REM Verify Java exists
if not exist "!JAVA_HOME!\bin\java.exe" (
    echo ERROR: Java not found at !JAVA_HOME!
    echo Looking for alternative Java installation...
    for /f "tokens=*" %%A in ('where java 2^>nul') do (
        set "JAVA_FOUND=%%A"
        echo Found Java at: %%A
    )
    if "!JAVA_FOUND!"=="" (
        echo ERROR: No Java found in PATH
        exit /b 1
    )
) else (
    echo Using Java from: !JAVA_HOME!
)

REM Add Java to PATH  
set "PATH=!JAVA_HOME!\bin;%PATH%"

REM Change to backend directory
cd /d "C:\Users\user\ONEDRI~1\DOCUME~1\AI\E-LIBR~1\backend"

echo Current directory: %cd%
echo JAVA_HOME: !JAVA_HOME!
echo.
echo Running Maven build...
echo.

REM Run Maven
C:\PROGRA~1\apache-maven-3.9.12\bin\mvn.cmd clean package -DskipTests

echo.
echo Build completed with exit code: %errorlevel%
pause
