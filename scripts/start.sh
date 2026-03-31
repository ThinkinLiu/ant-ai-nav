#!/bin/bash

# 蚂蚁AI导航 - 生产环境启动脚本
# 支持 standalone 模式和传统模式

PORT=${PORT:-5000}
HOSTNAME=${HOSTNAME:-"0.0.0.0"}

echo "🚀 Starting production server..."
echo "  Port: $PORT"
echo "  Hostname: $HOSTNAME"
echo ""

# 检测是否在 standalone 模式下运行
if [ -f "server.js" ]; then
  echo "✅ 检测到 standalone 模式（Docker 部署）"
  echo ""
  
  # 检查静态文件是否存在
  if [ ! -d ".next/static" ]; then
    echo "❌ 错误：静态文件目录不存在 (.next/static)"
    echo "   目录结构："
    ls -la
    echo ""
    echo "   .next 目录："
    ls -la .next/ 2>&1 || echo "   .next 目录不存在"
    exit 1
  fi

  if [ ! -d "public" ]; then
    echo "❌ 错误：public 目录不存在"
    echo "   目录结构："
    ls -la
    exit 1
  fi

  echo "✅ 静态资源检查通过"
  echo ""
  echo "📁 目录结构："
  echo "  .next/static:"
  ls -la .next/static | head -10
  echo ""
  echo "  public:"
  ls -la public | head -10
  echo ""

  # 直接运行 server.js（standalone 模式）
  echo "🚀 启动服务器（standalone 模式）..."
  exec node server.js
else
  echo "✅ 检测到传统模式（开发环境或非 Docker 部署）"
  echo ""

  # 检查 node_modules 是否存在
  if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found, installing dependencies..."
    pnpm install
  fi

  # 检查 .next 目录是否存在（构建产物）
  if [ ! -d ".next" ]; then
    echo "⚠️  Build output not found, running build..."
    pnpm run build
  fi

  # 检查是否需要同步数据库
  if [ "$SKIP_DB_SYNC" != "true" ]; then
    echo ""
    echo "🔍 检查数据库状态..."

    # 运行数据库同步检查脚本
    if [ -f "scripts/auto-sync-database.ts" ]; then
      pnpm tsx scripts/auto-sync-database.ts 2>&1 | head -50
    fi

    echo ""
  fi

  # 使用 next start 启动（传统模式）
  echo "🚀 启动服务器（传统模式）..."
  exec pnpm start
fi
