@echo off
echo Starting Mobile AI Engine (Flask + FAISS)...
echo.

cd /d "%~dp0Python-ranker"

if exist ".venv\Scripts\activate.bat" (
    echo Activating Virtual Environment...
    call .venv\Scripts\activate.bat
)

echo.
echo AI Engine will start on: http://localhost:5001
echo Press Ctrl+C to stop
echo.

python mobile_app.py

pause
