#!/bin/bash

echo "🚀 面试复盘助手启动脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到Node.js，请先安装Node.js"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未检测到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本：$(node --version)"
echo "✅ npm版本：$(npm --version)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接或重试"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告：未找到.env.local文件"
    echo "📝 正在创建环境变量示例文件..."
    cp env.example .env.local
    echo "✅ 已创建.env.local文件，请根据实际情况修改配置"
    echo "🔑 豆包API密钥已预配置，可直接使用"
fi

echo ""
echo "🎯 启动开发服务器..."
echo "📱 应用将在 http://localhost:3000 启动"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

npm run dev
