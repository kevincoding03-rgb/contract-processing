@echo off
chcp 65001 >nul 2>&1
title Legal Document Intelligent Processing Platform - Launcher

echo ============================================
echo   Legal Document Intelligent Processing Platform - One-Click Launch
echo ============================================
echo.

set PYTHON=C:\Users\halcy\AppData\Local\Programs\Python\Python313\python.exe

:: Check Python
%PYTHON% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found at %PYTHON%
    pause
    exit /b 1
)
echo [1/7] Python check passed

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js
    pause
    exit /b 1
)
echo [2/7] Node.js check passed

:: Install backend dependencies
echo [3/7] Checking backend dependencies...
cd /d "%~dp0backend"
if not exist "venv" (
    %PYTHON% -m venv venv
)
call venv\Scripts\activate.bat
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found
    pause
    exit /b 1
)
pip install -q -r requirements.txt
echo Backend dependencies ready

:: Check .env file
if not exist ".env" (
    echo [WARNING] .env file not found, creating...
    copy ".env.example" ".env" >nul
    echo [TIP] Please edit backend\.env to configure Supabase settings
)

:: Install frontend dependencies
echo [4/7] Checking frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
)
echo Frontend dependencies ready

:: Kill old processes
echo [5/7] Starting services...
taskkill /f /fi "WINDOWTITLE eq Backend Service - FastAPI" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Frontend Service - React" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Start backend
echo.
echo Starting backend service (FastAPI - Port 8000)...
cd /d "%~dp0backend"
start "Backend Service - FastAPI" cmd /k "call venv\Scripts\activate.bat && %PYTHON% -m uvicorn api.index:app --host 0.0.0.0 --reload --port 8000"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Auto cleanup on startup
echo Auto clearing cloud history...
%PYTHON% "%~dp0backend\_startup_cleanup.py"
echo.

:: Start frontend
echo Starting frontend service (React - Port 3000)...
cd /d "%~dp0frontend"
start "Frontend Service - React" cmd /k "npm run dev"

echo.
echo ============================================
echo   Launch complete!
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo   LAN access (use these addresses from other devices):
echo   Frontend:  http://192.168.0.103:3000
echo   Backend:   http://192.168.0.103:8000
echo   API Docs:  http://192.168.0.103:8000/docs
echo.
echo   Note: Please ensure Windows Firewall allows ports 3000 and 8000
echo.
echo   Closing this window will not affect running services
echo   To stop, close the corresponding command windows
echo.
echo   Tip: Cloud history is automatically cleared on each launch
echo ============================================
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000
