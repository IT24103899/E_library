@echo off
echo 🛑 Stopping any processes on port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo Killing process %%a
    taskkill /F /PID %%a
)
echo ✅ Done. You can now start the backend using START_MOBILE_BACKEND.bat
pause
