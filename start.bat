@echo off
chcp 65001 >nul
echo 🚀 面试复盘助手启动脚本
echo ================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到npm，请先安装npm
    pause
    exit /b 1
)

echo ✅ Node.js版本：
node --version
echo ✅ npm版本：
npm --version

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 正在安装项目依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接或重试
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

REM 检查环境变量文件
if not exist ".env.local" (
    echo ⚠️  警告：未找到.env.local文件
    echo 📝 正在创建环境变量示例文件...
    copy env.example .env.local >nul
    echo ✅ 已创建.env.local文件，请根据实际情况修改配置
    echo 🔑 豆包API密钥已预配置，可直接使用
)

echo.
echo 🎯 启动开发服务器...
echo 📱 应用将在 http://localhost:3000 启动
echo 🛑 按 Ctrl+C 停止服务器
echo.

npm run dev
pause
