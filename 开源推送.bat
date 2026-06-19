@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo   法律项目 - 一键开源推送到 GitHub
echo ============================================
echo.

set "PROJECT_DIR=C:\Users\halcy\Desktop\code\法律"
set "REPO_URL=https://github.com/kevincoding03-rgb/contract-processing.git"

:: 检查项目目录是否存在
if not exist "%PROJECT_DIR%" (
    echo [错误] 找不到项目目录: %PROJECT_DIR%
    pause
    exit /b 1
)

:: 进入项目目录
cd /d "%PROJECT_DIR%"

echo [1/6] 创建 .gitignore ...
(
echo # === Python ===
echo __pycache__/
echo *.py[cod]
echo *$py.class
echo *.so
echo *.egg-info/
echo dist/
echo build/
echo *.egg
echo.
echo # === 虚拟环境 ===
echo venv/
echo .venv/
echo env/
echo.
echo # === Node.js ===
echo node_modules/
echo.
echo # === 构建产物 ===
echo frontend/dist/
echo frontend/build/
echo.
echo # === 环境变量 / 敏感信息 ===
echo .env
echo .env.local
echo .env.*.local
echo.
echo # === IDE ===
echo .idea/
echo .vscode/
echo *.swp
echo *.swo
echo *~
echo.
echo # === 操作系统 ===
echo .DS_Store
echo Thumbs.db
echo Desktop.ini
echo.
echo # === 日志 ===
echo *.log
echo.
echo # === 其他 ===
echo *.bak
echo *.tmp
) > .gitignore

echo [2/6] 初始化 Git 仓库...
if not exist ".git" (
    git init
)

echo [3/6] 配置远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [4/6] 添加文件（已排除 venv/node_modules/.env 等大文件）...
:: 先清除可能残留的 git 缓存
git rm -r --cached . 2>nul
git add -A

echo [5/6] 提交...
git commit -m "开源：法律文书智能处理平台完整源码"

echo [6/6] 推送到 GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ============================================
echo   完成！项目已推送到 GitHub
echo   仓库地址: %REPO_URL%
echo ============================================
pause
