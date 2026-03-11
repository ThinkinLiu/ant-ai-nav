#!/bin/bash

# 蚂蚁AI导航 - 生产构建脚本

echo "📦 Building for production..."

# 安装依赖
echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

# 构建
echo "🔨 Building..."
pnpm build

echo "✅ Build completed!"
