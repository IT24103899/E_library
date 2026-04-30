@echo off
setlocal enabledelayedexpansion

REM Set JAVA_HOME to the Dragonwell JDK installation
set "JAVA_HOME=C:\Users\user\.jdks\dragonwell-ex-21.0.9"

REM Add Java and Maven to PATH
set "PATH=C:\Users\user\.jdks\dragonwell-ex-21.0.9\bin;C:\Program Files\apache-maven-3.9.12\bin;!PATH!"

REM Verify Java is accessible
echo Checking Java installation...
java -version

REM Build the backend JAR
echo.
echo Building backend...
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"
call mvn clean package -DskipTests

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

REM Run the backend JAR on port 8080
echo.
echo Starting backend on port 8080...
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend\target"
java -jar elibrary-backend-1.0.0.jar

pause
