@echo off
REM ============================================
REM Bookshelf Database Initialization Script
REM ============================================

echo.
echo Initializing Bookshelf Table...
echo.

REM Set database credentials
set DB_USER=root
set DB_PASSWORD=Bharana@2004
set DB_NAME=elibrary_db
set SQL_FILE=database\init_bookshelf.sql

REM Check if database folder exists
if not exist "database" (
    echo Error: database folder not found!
    echo Please run this script from the E-Library root directory.
    pause
    exit /b 1
)

REM Check if SQL file exists
if not exist "%SQL_FILE%" (
    echo Error: %SQL_FILE% not found!
    pause
    exit /b 1
)

REM Execute SQL script
echo Running SQL initialization script...
mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < "%SQL_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo ✓ Bookshelf table initialized successfully!
    echo.
    echo Next steps:
    echo 1. Rebuild backend: mvn clean install
    echo 2. Restart backend and frontend
    echo 3. Test the bookshelf endpoints
    echo.
) else (
    echo.
    echo ✗ Error initializing bookshelf table!
    echo Please check:
    echo  - MySQL is running
    echo  - Database credentials are correct
    echo  - Database '%DB_NAME%' exists
    echo.
)

pause
