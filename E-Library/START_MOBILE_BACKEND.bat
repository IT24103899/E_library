@echo off
echo Starting Mobile Backend (Node.js + MongoDB)...
echo.

cd /d "%~dp0mobile-backend"

if not exist "node_modules" (
    echo ERROR: node_modules not found!
    echo Running npm install...
    call npm install
)

echo.
echo Starting AI Engine microservice...
start "Mobile AI Engine" /d "%~dp0" call START_AI_ENGINE.bat

echo.
echo Server will start on: http://localhost:4000
echo Press Ctrl+C to stop the server
echo.

npm start

pause
