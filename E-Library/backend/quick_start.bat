@echo off
REM Quick Start Script for E-Library Backend

echo.
echo ========================================
echo E-Library Backend Quick Start
echo ========================================
echo.

REM Check if Java is installed
echo [1/4] Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java 21 not found! Please install Java 21 LTS
    echo Download from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)
echo ✅ Java found

REM Check if Maven is installed
echo [2/4] Checking Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven not found! Please install Maven 3.8+
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo ✅ Maven found

REM Navigate to backend directory
echo [3/4] Building backend...
cd /d "%~dp0backend"
if not exist "pom.xml" (
    echo ❌ pom.xml not found! Wrong directory.
    pause
    exit /b 1
)

REM Build with Maven
mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful

REM Start the backend
echo [4/4] Starting backend...
echo.
echo ========================================
echo Backend starting on http://localhost:8080/api
echo Health check: http://localhost:8080/api/health
echo ========================================
echo.

mvn spring-boot:run

pause
