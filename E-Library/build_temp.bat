@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"

REM Try to find Maven
set "MVN_PATH="
if exist "C:\Program Files\Maven\apache-maven-3.9.6\bin\mvn.cmd" set "MVN_PATH=C:\Program Files\Maven\apache-maven-3.9.6\bin\mvn.cmd"
if exist "C:\Program Files (x86)\Maven\apache-maven-3.9.6\bin\mvn.cmd" set "MVN_PATH=C:\Program Files (x86)\Maven\apache-maven-3.9.6\bin\mvn.cmd"

if "!MVN_PATH!"=="" (
    echo Maven not found, attempting to use 'mvn' from PATH...
    call mvn clean install -DskipTests
) else (
    call "!MVN_PATH!" clean install -DskipTests
)

echo Build completed
pause
