#!/bin/bash

# ============================================
# 蚂蚁AI导航 - 数据库同步脚本
# ============================================
# 用途: 在部署时自动同步数据库结构
# 使用: ./scripts/sync-database.sh
# ============================================

set -e

echo "=========================================="
echo "蚂蚁AI导航 - 数据库同步"
echo "=========================================="
echo ""

# 检查环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -z "$COZE_SUPABASE_URL" ]; then
  echo "❌ 错误: 缺少 Supabase URL 配置"
  echo "请设置以下任一环境变量:"
  echo "  - NEXT_PUBLIC_SUPABASE_URL"
  echo "  - COZE_SUPABASE_URL"
  exit 1
fi

# 获取 Supabase 项目信息
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$COZE_SUPABASE_URL}"
SUPABASE_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$COZE_SUPABASE_ANON_KEY}"

# 从 Supabase URL 提取项目 ID
# 例如: https://br-giddy-crow-97a8b86c.supabase.co -> br-giddy-crow-97a8b86c
PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\..*|\1|')

echo "📋 Supabase 项目信息:"
echo "  URL: ${SUPABASE_URL:0:50}..."
echo "  项目 ID: $PROJECT_ID"
echo ""

# 检查是否安装了 psql
if ! command -v psql &> /dev/null; then
  echo "⚠️  psql 未安装，尝试使用 Node.js 脚本同步数据库..."
  
  # 使用 Node.js 脚本同步
  if [ -f "scripts/sync-database.js" ]; then
    node scripts/sync-database.js
    exit $?
  else
    echo "❌ 错误: 未找到 psql 和 sync-database.js 脚本"
    echo ""
    echo "请手动执行数据库同步:"
    echo "  1. 连接到 Supabase 数据库"
    echo "  2. 执行 database/ 目录下的 SQL 文件"
    echo ""
    echo "或使用 Supabase CLI:"
    echo "  supabase db push"
    exit 1
  fi
fi

# 检查数据库连接字符串
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL 未设置，无法直接连接数据库"
  echo ""
  echo "请在 Supabase 控制台获取数据库连接字符串:"
  echo "  1. 打开项目设置 -> Database"
  echo "  2. 复制 Connection string (URI)"
  echo "  3. 设置环境变量: DATABASE_URL=<连接字符串>"
  echo ""
  echo "或使用 Supabase CLI 进行数据库同步:"
  echo "  supabase link --project-ref $PROJECT_ID"
  echo "  supabase db push"
  exit 1
fi

# 执行数据库同步
echo "🔄 开始同步数据库..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_DIR="$SCRIPT_DIR/database"

# 函数: 执行 SQL 文件
execute_sql_file() {
  local file=$1
  local filename=$(basename "$file")
  
  echo "执行: $filename"
  
  if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
    echo "  ✅ 成功"
  else
    echo "  ❌ 失败"
    return 1
  fi
}

# 同步表结构
echo "步骤 1: 同步表结构..."
execute_sql_file "$DATABASE_DIR/00_schema.sql" || echo "  ⚠️  表结构可能已存在"

# 同步基础数据
echo ""
echo "步骤 2: 同步基础数据..."
for file in "$DATABASE_DIR"/*.sql; do
  filename=$(basename "$file")
  # 跳过 schema 文件
  if [ "$filename" != "00_schema.sql" ]; then
    execute_sql_file "$file" || echo "  ⚠️  $filename 执行失败，可能数据已存在"
  fi
done

echo ""
echo "=========================================="
echo "✅ 数据库同步完成！"
echo "=========================================="
