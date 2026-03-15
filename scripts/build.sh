#!/bin/bash
# 构建脚本 - 支持多环境构建

set -e

echo "🚀 开始构建..."

# 检测环境类型
if [ -n "$COZE_WORKSPACE_PATH" ] || [ -n "$COZE_INTEGRATION_BASE_URL" ]; then
  echo "📦 Coze 环境构建"
  export BUILD_ENV="coze"
else
  echo "📦 独立服务器环境构建"
  export BUILD_ENV="standalone"
fi

# 检查必需的环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -z "$COZE_SUPABASE_URL" ]; then
  echo "❌ 错误: 缺少 NEXT_PUBLIC_SUPABASE_URL 或 COZE_SUPABASE_URL"
  echo "请设置环境变量后重试"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ -z "$COZE_SUPABASE_ANON_KEY" ]; then
  echo "❌ 错误: 缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY 或 COZE_SUPABASE_ANON_KEY"
  echo "请设置环境变量后重试"
  exit 1
fi

# 设置 Next.js 公共环境变量
# 优先使用标准命名，如果没有则使用 Coze 命名
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$COZE_SUPABASE_URL}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$COZE_SUPABASE_ANON_KEY}"

echo "✅ 环境变量检查通过"

# 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 运行构建
echo "🔨 执行构建..."
pnpm run build

echo "✅ 构建完成！"
