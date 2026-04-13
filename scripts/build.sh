#!/bin/bash
# 构建脚本 - 支持多环境构建，根据可用内存动态调整
# 关键：在构建时注入 NEXT_PUBLIC_* 环境变量

set -e

echo "🚀 开始构建..."
echo ""

# ============================================
# 内存检测和动态配置
# ============================================
detect_memory() {
  # 获取总内存（KB）
  local total_mem=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
  # 获取可用内存（KB）
  local avail_mem=$(grep MemAvailable /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
  
  # 如果无法获取可用内存，尝试计算
  if [ "$avail_mem" -eq 0 ]; then
    local free_mem=$(grep MemFree /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
    local buffers=$(grep Buffers /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
    local cached=$(grep "^Cached" /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
    avail_mem=$((free_mem + buffers + cached))
  fi
  
  echo "total=$total_mem"
  echo "avail=$avail_mem"
}

echo "📊 检测系统内存..."
mem_info=$(detect_memory)
TOTAL_MEM=$(echo "$mem_info" | grep "total=" | cut -d= -f2)
AVAIL_MEM=$(echo "$mem_info" | grep "avail=" | cut -d= -f2)

# 转换为MB便于阅读
TOTAL_MEM_MB=$((TOTAL_MEM / 1024))
AVAIL_MEM_MB=$((AVAIL_MEM / 1024))

echo "  总内存: ${TOTAL_MEM_MB}MB"
echo "  可用内存: ${AVAIL_MEM_MB}MB"
echo ""

# 根据可用内存动态计算 Node.js 内存限制
# 保留至少 256MB 给系统和其他进程
if [ "$AVAIL_MEM" -gt 1500000 ]; then
  # 可用内存 > 1.5GB，使用 1GB
  NODE_MEM=1024
  echo "✅ 内存充足，使用 1024MB"
elif [ "$AVAIL_MEM" -gt 1000000 ]; then
  # 可用内存 > 1GB，使用 768MB
  NODE_MEM=768
  echo "✅ 内存适中，使用 768MB"
elif [ "$AVAIL_MEM" -gt 700000 ]; then
  # 可用内存 > 700MB，使用 512MB
  NODE_MEM=512
  echo "⚠️ 内存有限，使用 512MB（构建可能较慢）"
elif [ "$AVAIL_MEM" -gt 400000 ]; then
  # 可用内存 > 400MB，使用 350MB
  NODE_MEM=350
  echo "⚠️ 内存紧张，使用 350MB（构建会很慢）"
else
  # 可用内存 < 400MB，尝试清理缓存
  echo "⚠️ 内存严重不足，尝试释放缓存..."
  
  # 同步并清理页面缓存、inode和目录项缓存
  sync 2>/dev/null || true
  echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
  
  # 重新检测
  sleep 2
  mem_info=$(detect_memory)
  AVAIL_MEM=$(echo "$mem_info" | grep "avail=" | cut -d= -f2)
  AVAIL_MEM_MB=$((AVAIL_MEM / 1024))
  echo "  清理后可用内存: ${AVAIL_MEM_MB}MB"
  
  if [ "$AVAIL_MEM" -gt 400000 ]; then
    NODE_MEM=350
    echo "✅ 清理后内存可用，使用 350MB"
  else
    NODE_MEM=300
    echo "❌ 内存严重不足，使用 300MB（可能构建失败）"
    echo "   建议：添加 swap 空间或升级服务器内存"
  fi
fi

echo ""

# ============================================
# 检测环境类型
# ============================================
if [ -n "$COZE_WORKSPACE_PATH" ] || [ -n "$COZE_INTEGRATION_BASE_URL" ]; then
  echo "📦 检测到 Coze 环境"
  export BUILD_ENV="coze"
else
  echo "📦 检测到独立服务器环境"
  export BUILD_ENV="standalone"
fi

echo ""

# 加载环境变量文件（按优先级）
# 优先级：.env.local > .env.build > .env.production
# ============================================

# 设置 LANG 以避免编码问题
export LANG=C.UTF-8

if [ -f .env.local ]; then
  echo "📄 加载 .env.local 文件..."
  set -a
  source .env.local 2>/dev/null || true
  set +a
  echo "✅ .env.local 已加载"
  echo ""
fi

if [ -f .env.build ]; then
  echo "📄 加载 .env.build 文件..."
  set -a
  source .env.build 2>/dev/null || true
  set +a
  echo "✅ .env.build 已加载"
  echo ""
fi

if [ -f .env.production ]; then
  echo "📄 加载 .env.production 文件..."
  set -a
  source .env.production 2>/dev/null || true
  set +a
  echo "✅ .env.production 已加载"
  echo ""
fi

echo "📋 环境变量状态:"
echo "  - NEXT_PUBLIC_SUPABASE_URL: $([ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && echo "已设置" || echo "未设置")"
echo "  - COZE_SUPABASE_URL: $([ -n "$COZE_SUPABASE_URL" ] && echo "已设置" || echo "未设置")"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY: $([ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo "已设置" || echo "未设置")"
echo "  - COZE_SUPABASE_ANON_KEY: $([ -n "$COZE_SUPABASE_ANON_KEY" ] && echo "已设置" || echo "未设置")"
echo ""

# ============================================
# 环境变量配置
# ============================================
echo "🔧 配置环境变量..."

# 如果没有 NEXT_PUBLIC_ 前缀的环境变量，尝试从 COZE_ 前缀复制
# 这样可以在 Coze 平台环境中正确构建
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$COZE_SUPABASE_URL" ]; then
  export NEXT_PUBLIC_SUPABASE_URL="$COZE_SUPABASE_URL"
  echo "  ✅ 从 COZE_SUPABASE_URL 复制到 NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ -n "$COZE_SUPABASE_ANON_KEY" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$COZE_SUPABASE_ANON_KEY"
  echo "  ✅ 从 COZE_SUPABASE_ANON_KEY 复制到 NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

# 统一使用 NEXT_PUBLIC_ 前缀
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "  ✅ NEXT_PUBLIC_SUPABASE_URL 已设置"
else
  export NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
  echo "  ⚠️ 使用占位符"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置"
else
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
  echo "  ⚠️ 使用占位符"
fi

echo ""

# 禁用遥测和 source maps
export NEXT_TELEMETRY_DISABLED=1
export NEXT_BUILD_SOURCEMAPS=0

# ============================================
# 安装依赖
# ============================================
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# ============================================
# 执行构建
# ============================================
echo ""
echo "🔨 执行构建..."
echo "  Node.js 内存限制: ${NODE_MEM}MB"
echo ""

NODE_OPTIONS="--max-old-space-size=${NODE_MEM}" pnpm build

echo ""
echo "✅ 构建完成！"
