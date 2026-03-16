#!/bin/bash

# 蚂蚁AI导航 - 生产环境启动脚本

PORT=${PORT:-3000}

echo "🚀 Starting production server on port $PORT..."

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

# 启动服务
pnpm start
