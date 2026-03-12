#!/bin/bash

# 蚂蚁AI导航 - 开发环境启动脚本

echo "🚀 Starting development server..."

# 检查 .env.local 是否存在
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Please edit .env.local with your actual values"
fi

# 启动开发服务器 (端口5000)
pnpm dev --port 5000
