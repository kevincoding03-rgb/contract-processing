@echo off
chcp 65001 >nul 2>&1
title 法律文书智能处理平台 - 启动器

echo ============================================
echo   法律文书智能处理平台 - 一键启动
echo ============================================
echo.

:: 检查 Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)
echo [1/5] Python 检查通过

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo [2/5] Node.js 检查通过

:: 安装后端依赖
echo [3/5] 检查后端依赖...
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat
if not exist "requirements.txt" (
    echo [错误] 未找到 requirements.txt
    pause
    exit /b 1
)
pip install -q -r requirements.txt
echo 后端依赖就绪

:: 检查 .env 文件
if not exist ".env" (
    echo [警告] 未找到 .env 文件，正在创建...
    copy ".env.example" ".env" >nul
    echo [提示] 请编辑 backend\.env 文件，配置 Supabase 信息
)

:: 安装前端依赖
echo [4/5] 检查前端依赖...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
)
echo 前端依赖就绪

:: 关闭旧进程
echo [5/5] 启动服务...
taskkill /f /fi "WINDOWTITLE eq 后端服务 - FastAPI" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq 前端服务 - React" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: 启动后端
echo.
echo 启动后端服务 (FastAPI - 端口 8000)...
cd /d "%~dp0backend"
start "后端服务 - FastAPI" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn api.index:app --reload --port 8000"

:: 启动前端
echo 启动前端服务 (React - 端口 3000)...
cd /d "%~dp0frontend"
start "前端服务 - React" cmd /k "npm run dev"

echo.
echo ============================================
echo   启动完成！
echo.
echo   前端页面: http://localhost:3000
echo   后端API:  http://localhost:8000
echo   API文档:  http://localhost:8000/docs
echo.
echo   关闭此窗口不会影响已启动的服务
echo   如需停止，请关闭对应的命令行窗口
echo ============================================
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000
