@echo off
echo =========================================
echo   Starting Casino Application
echo =========================================
echo.

REM Start backend in new window
echo Starting backend server...
start "Galilio Backend" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo Starting frontend server...
start "Galilio Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo   Galilio Application Started!
echo =========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close both terminal windows to stop the servers
echo.
pause
