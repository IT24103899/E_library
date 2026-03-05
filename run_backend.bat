@echo off
setlocal enabledelayedexpansion

REM Set JAVA_HOME and Maven paths
set "JAVA_HOME=C:\Users\user\Downloads\jdk-21_windows-x64_bin\jdk-21.0.9"
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.12"
set "PATH=!JAVA_HOME!\bin;!MAVEN_HOME!\bin;!PATH!"

REM Verify Java installation
if not exist "!JAVA_HOME!\bin\java.exe" (
    echo ERROR: Java not found at !JAVA_HOME!
    exit /b 1
)

echo Java version:
"!JAVA_HOME!\bin\java.exe" -version

REM Go to backend directory
cd /d "c:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"

echo.
echo Compiling backend...
"!MAVEN_HOME!\bin\mvn.cmd" clean compile
if errorlevel 1 (
    echo Compilation failed!
    exit /b 1
)

echo.
echo Running backend...
"!MAVEN_HOME!\bin\mvn.cmd" spring-boot:run
