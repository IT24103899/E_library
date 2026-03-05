@echo off
setlocal enabledelayedexpansion

REM Set JAVA_HOME and Maven paths
set "JAVA_HOME=C:\Users\user\Downloads\jdk-21_windows-x64_bin\jdk-21.0.9"
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.12"
set "PATH=!JAVA_HOME!\bin;!MAVEN_HOME!\bin;!PATH!"

REM Go to backend directory and start it
cd /d "c:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"

echo Starting E-Library Backend...
echo Database: Make sure MySQL is running with elibrary_db database
echo.

"!MAVEN_HOME!\bin\mvn.cmd" spring-boot:run
