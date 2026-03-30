#!/bin/bash

# Docker 部署静态资源诊断脚本

echo "========================================="
echo "Docker 静态资源诊断工具"
echo "========================================="
echo ""

# 1. 检查当前工作目录
echo "📁 当前工作目录:"
pwd
echo ""

# 2. 检查 server.js 是否存在（standalone 模式）
echo "🔍 检查 standalone 模式:"
if [ -f "server.js" ]; then
  echo "  ✅ server.js 存在（standalone 模式）"
else
  echo "  ❌ server.js 不存在（传统模式或构建失败）"
fi
echo ""

# 3. 检查静态资源目录
echo "📁 检查静态资源目录:"

echo -n "  .next/static: "
if [ -d ".next/static" ]; then
  count=$(find .next/static -type f 2>/dev/null | wc -l)
  echo "✅ 存在（$count 个文件）"
else
  echo "❌ 不存在"
fi

echo -n "  public: "
if [ -d "public" ]; then
  count=$(find public -type f 2>/dev/null | wc -l)
  echo "✅ 存在（$count 个文件）"
else
  echo "❌ 不存在"
fi

echo -n "  node_modules: "
if [ -d "node_modules" ]; then
  echo "✅ 存在"
else
  echo "❌ 不存在"
fi
echo ""

# 4. 检查关键静态文件
echo "📄 检查关键静态文件:"

files=(
  ".next/static/chunks/_app.js"
  ".next/static/chunks/_buildManifest.js"
  ".next/static/chunks/_ssgManifest.js"
)

for file in "${files[@]}"; do
  echo -n "  $file: "
  if [ -f "$file" ]; then
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    echo "✅ ($size)"
  else
    echo "❌"
  fi
done
echo ""

# 5. 列出 .next/static 目录结构（如果存在）
if [ -d ".next/static" ]; then
  echo "📊 .next/static 目录结构:"
  tree -L 2 -h .next/static 2>/dev/null || find .next/static -maxdepth 2 -type d 2>/dev/null | head -20
  echo ""
fi

# 6. 检查文件权限
echo "🔒 检查文件权限:"
if [ -f "server.js" ]; then
  perms=$(ls -ld server.js | awk '{print $1}')
  owner=$(ls -ld server.js | awk '{print $3}')
  echo "  server.js: $perms ($owner)"
fi

if [ -d ".next/static" ]; then
  perms=$(ls -ld .next/static | awk '{print $1}')
  owner=$(ls -ld .next/static | awk '{print $3}')
  echo "  .next/static: $perms ($owner)"
fi
echo ""

# 7. 建议和诊断结果
echo "========================================="
echo "诊断结果:"
echo "========================================="

all_ok=true

if [ ! -f "server.js" ]; then
  echo "❌ server.js 不存在，请检查构建是否成功"
  all_ok=false
fi

if [ ! -d ".next/static" ]; then
  echo "❌ .next/static 不存在，静态资源将返回 404"
  echo "   解决方案：检查 Dockerfile 中的复制命令"
  all_ok=false
fi

if [ ! -d "public" ]; then
  echo "❌ public 不存在，public 目录中的资源将返回 404"
  echo "   解决方案：检查 Dockerfile 中的复制命令"
  all_ok=false
fi

if [ "$all_ok" = true ]; then
  echo "✅ 所有检查通过，静态资源配置正确"
fi

echo ""
echo "========================================="
