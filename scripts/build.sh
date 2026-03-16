#!/bin/bash
# 构建脚本 - 支持多环境构建
# 关键：在构建时注入 NEXT_PUBLIC_* 环境变量

set -e

echo "🚀 开始构建..."
echo ""

# 检测环境类型
if [ -n "$COZE_WORKSPACE_PATH" ] || [ -n "$COZE_INTEGRATION_BASE_URL" ]; then
  echo "📦 检测到 Coze 环境"
  export BUILD_ENV="coze"
else
  echo "📦 检测到独立服务器环境"
  export BUILD_ENV="standalone"
fi

echo ""

# ============================================
# 关键步骤：环境变量映射和导出
# 必须在构建前完成，因为 NEXT_PUBLIC_* 变量在构建时内联
# ============================================

echo "🔧 配置环境变量..."

# Supabase URL
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "  ✅ NEXT_PUBLIC_SUPABASE_URL 已设置"
  export NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
elif [ -n "$COZE_SUPABASE_URL" ]; then
  echo "  ✅ 从 COZE_SUPABASE_URL 映射到 NEXT_PUBLIC_SUPABASE_URL"
  export NEXT_PUBLIC_SUPABASE_URL="$COZE_SUPABASE_URL"
elif [ -n "$SUPABASE_URL" ]; then
  echo "  ✅ 从 SUPABASE_URL 映射到 NEXT_PUBLIC_SUPABASE_URL"
  export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
else
  echo "  ❌ 错误: 缺少 Supabase URL 配置"
  echo "  请设置以下任一环境变量:"
  echo "    - NEXT_PUBLIC_SUPABASE_URL"
  echo "    - COZE_SUPABASE_URL"
  echo "    - SUPABASE_URL"
  exit 1
fi

# Supabase Anon Key
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
elif [ -n "$COZE_SUPABASE_ANON_KEY" ]; then
  echo "  ✅ 从 COZE_SUPABASE_ANON_KEY 映射到 NEXT_PUBLIC_SUPABASE_ANON_KEY"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$COZE_SUPABASE_ANON_KEY"
elif [ -n "$SUPABASE_ANON_KEY" ]; then
  echo "  ✅ 从 SUPABASE_ANON_KEY 映射到 NEXT_PUBLIC_SUPABASE_ANON_KEY"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
elif [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "  ✅ 从 SUPABASE_SERVICE_ROLE_KEY 映射到 NEXT_PUBLIC_SUPABASE_ANON_KEY"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_SERVICE_ROLE_KEY"
else
  echo "  ❌ 错误: 缺少 Supabase Anon Key 配置"
  echo "  请设置以下任一环境变量:"
  echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "    - COZE_SUPABASE_ANON_KEY"
  echo "    - SUPABASE_ANON_KEY"
  echo "    - SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo ""
echo "✅ 环境变量配置完成"
echo ""

# 验证环境变量（调试用，可以删除）
echo "🔍 环境变量验证:"
echo "  NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:50}..."
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo ""

# 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 运行构建
echo "🔨 执行构建..."
pnpm run build

echo ""
echo "✅ 构建完成！"
