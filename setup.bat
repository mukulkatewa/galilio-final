@echo off
echo =========================================
echo   Galilio Application - Setup Script
echo =========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Setup Backend
echo =========================================
echo Setting up BACKEND...
echo =========================================
cd backend

REM Install backend dependencies
echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env file with your:
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo   - Other configuration
    echo.
    pause
)

echo Backend setup complete!
echo.

REM Setup Frontend
cd ..
echo =========================================
echo Setting up FRONTEND...
echo =========================================
cd frontend

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend setup complete!
echo.

cd ..

echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo NEXT STEPS:
echo 1. Ensure PostgreSQL is running
echo 2. Edit backend\.env with your configuration
echo 3. Run: cd backend
echo 4. Run: npm run migrate (setup database)
echo 5. Run: npm run seed (create admin user)
echo 6. Run: npm run dev (start backend)
echo 7. In new terminal, cd frontend
echo 8. Run: npm run dev (start frontend)
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: Admin@123
echo.
pause
