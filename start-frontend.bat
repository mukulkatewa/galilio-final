@echo off
echo =========================================
echo   Starting FRONTEND Server
echo =========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting frontend server on http://localhost:3000
echo Press Ctrl+C to stop
echo.

call npm run dev
