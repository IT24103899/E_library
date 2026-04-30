@echo off
echo Checking if backend is running...
echo.

REM Check if port 8080 is listening
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ✓ Backend appears to be running on port 8080
) else (
    echo ✗ Backend is NOT running on port 8080
    echo Please run: START_BACKEND.bat
    echo.
    pause
    exit /b 1
)

echo.
echo Testing search history API with user ID 10...
echo.

REM Test the API
python -c "^
import requests, json; ^
try: ^
    r = requests.get('http://localhost:8080/api/search-history/10', timeout=5); ^
    print(f'GET /api/search-history/10: Status {r.status_code}'); ^
    if r.status_code == 200: ^
        print(f'Response: {r.json()}'); ^
    else: ^
        print(f'Response: {r.text}'); ^
except Exception as e: ^
    print(f'Error: {e}'); ^
"

echo.
echo Testing POST search history...
echo.

python -c "^
import requests, json; ^
try: ^
    r = requests.post('http://localhost:8080/api/search-history', ^
        json={'userId': 10, 'searchQuery': 'test search'}, ^
        headers={'Content-Type': 'application/json'}, ^
        timeout=5); ^
    print(f'POST /api/search-history: Status {r.status_code}'); ^
    if r.status_code == 200: ^
        print(f'Response: {r.json()}'); ^
    else: ^
        print(f'Response: {r.text}'); ^
except Exception as e: ^
    print(f'Error: {e}'); ^
"

pause
