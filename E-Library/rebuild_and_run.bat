@echo off
REM ============================================
REM Build and Run Backend
REM ============================================

setlocal enabledelayedexpansion

echo.
echo Stopping any existing backend processes...
taskkill /F /IM java.exe 2>nul
timeout /t 2 /nobreak

echo.
echo Building backend with Maven...
cd /d "%~dp0backend"

REM Try to find Maven
where /q mvn
if %errorlevel% neq 0 (
    echo Maven not found in PATH. Searching for Maven installation...
    
    REM Check common Maven locations
    if exist "C:\apache-maven\bin\mvn.cmd" (
        set "MVN_CMD=C:\apache-maven\bin\mvn.cmd"
    ) else if exist "C:\Maven\bin\mvn.cmd" (
        set "MVN_CMD=C:\Maven\bin\mvn.cmd"
    ) else (
        echo Error: Maven not found!
        echo Please install Maven or add it to PATH
        pause
        exit /b 1
    )
) else (
    set "MVN_CMD=mvn"
)

echo Using Maven: !MVN_CMD!
echo.

REM Build the project
echo Compiling backend...
call !MVN_CMD! clean package -DskipTests -q

if %errorlevel% equ 0 (
    echo.
    echo ✓ Build successful!
    echo.
    echo Starting backend...
    java -jar "target\elibrary-backend-1.0.0.jar"
) else (
    echo.
    echo ✗ Build failed!
    echo Check the output above for errors.
    pause
    exit /b 1
)

pause
