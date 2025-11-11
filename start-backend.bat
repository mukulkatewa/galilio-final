@echo off
echo =========================================
echo   Starting BACKEND Server
echo =========================================
echo.

cd backend

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run setup.bat first or copy .env.example to .env
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting backend server on http://localhost:5000
echo Press Ctrl+C to stop
echo.

call npm run dev
