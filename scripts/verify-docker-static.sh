#!/bin/sh

# 静态资源验证脚本
# 用于 Docker 容器内验证静态资源是否正确部署

printf "=== 静态资源验证脚本 ===\n\n"

# 检查工作目录
current_dir=$(pwd)
printf "当前工作目录: %s\n" "$current_dir"

# 检查关键目录
printf "\n=== 检查关键目录 ===\n"

check_dir() {
  if [ -d "$1" ]; then
    file_count=$(find "$1" -type f 2>/dev/null | wc -l)
    printf "✅ %s 存在 (包含 %d 个文件)\n" "$1" "$file_count"
  else
    printf "❌ %s 不存在\n" "$1"
  fi
}

check_dir ".next"
check_dir ".next/static"
check_dir ".next/static/chunks"
check_dir ".next/static/media"
check_dir "public"
check_dir "node_modules"

# 检查关键文件
printf "\n=== 检查关键文件 ===\n"

check_file() {
  if [ -f "$1" ]; then
    size=$(stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null)
    printf "✅ %s 存在 (大小: %d 字节)\n" "$1" "$size"
  else
    printf "❌ %s 不存在\n" "$1"
  fi
}

check_file "server.js"
check_file "package.json"
check_file ".next/BUILD_ID"
check_file ".next/static/chunks/main.js"

# 检查静态资源文件数
printf "\n=== 静态资源统计 ===\n"

if [ -d ".next/static" ]; then
  total=$(find .next/static -type f | wc -l)
  printf "静态文件总数: %d\n" "$total"

  printf "\n按目录统计:\n"
  for dir in .next/static/*; do
    if [ -d "$dir" ]; then
      count=$(find "$dir" -type f | wc -l)
      printf "  - $(basename "$dir"): %d 个文件\n" "$count"
    fi
  done
else
  printf "❌ .next/static 目录不存在，无法统计\n"
fi

# 检查 public 目录
if [ -d "public" ]; then
  public_count=$(find public -type f | wc -l)
  printf "\npublic 目录文件数: %d\n" "$public_count"
else
  printf "❌ public 目录不存在\n"
fi

# 诊断结果
printf "\n=== 诊断结果 ===\n"

errors=0

if [ ! -f "server.js" ]; then
  printf "❌ server.js 缺失，应用无法启动\n"
  errors=$((errors + 1))
fi

if [ ! -d ".next/static" ]; then
  printf "❌ .next/static 缺失，页面样式和脚本将 404\n"
  errors=$((errors + 1))
fi

if [ ! -d "public" ]; then
  printf "❌ public 缺失，静态资源将 404\n"
  errors=$((errors + 1))
fi

if [ "$errors" -eq 0 ]; then
  printf "✅ 所有关键文件检查通过\n"
else
  printf "❌ 发现 %d 个错误，请检查 Dockerfile 的复制路径\n" "$errors"
fi

exit $errors
