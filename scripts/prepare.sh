#!/bin/bash
# 准备脚本 - 在构建前运行

set -e

echo "🔍 检查环境配置..."

# 检查是否存在 .env.local 文件
if [ ! -f .env.local ]; then
  echo "⚠️  未找到 .env.local 文件"
  
  # 检查是否在 Coze 环境
  if [ -n "$COZE_WORKSPACE_PATH" ] || [ -n "$COZE_INTEGRATION_BASE_URL" ]; then
    echo "📦 检测到 Coze 环境"
    
    # 检查 Coze 环境变量（改为警告而非错误）
    if [ -z "$COZE_SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
      echo "⚠️  警告: 缺少 Supabase URL 配置"
      echo "请在 Coze 平台设置环境变量:"
      echo "  - COZE_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_URL"
      echo "  - COZE_SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY"
      echo "构建将继续，但某些功能可能不可用"
    else
      echo "✅ Coze 环境变量检查通过"
    fi
  else
    echo "📦 检测到独立服务器环境"
    
    # 如果 .env.example 存在，创建 .env.local
    if [ -f .env.example ]; then
      echo "📝 从 .env.example 创建 .env.local"
      cp .env.example .env.local
      echo "⚠️  请编辑 .env.local 文件并填写实际的配置值"
    fi
  fi
else
  echo "✅ 找到 .env.local 文件"
fi

# ============================================
# 关键步骤：安装依赖
# 确保在开发环境启动前依赖已安装
# ============================================

echo ""
echo "📦 安装依赖..."

# 检查 pnpm-lock.yaml 是否存在
if [ -f "pnpm-lock.yaml" ]; then
  echo "  使用 pnpm-lock.yaml 安装依赖..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  echo "  安装依赖..."
  pnpm install
fi

echo "✅ 依赖安装完成"

# 运行环境变量检查脚本（仅在开发环境）
if [ -z "$COZE_WORKSPACE_PATH" ] && [ -z "$COZE_INTEGRATION_BASE_URL" ]; then
  echo ""
  echo "🔍 运行环境变量验证..."
  pnpm tsx scripts/check-env.ts || true
fi

echo ""
echo "✅ 环境准备完成！"
