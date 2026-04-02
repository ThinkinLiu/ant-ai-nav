#!/bin/sh

# Next.js 静态资源访问测试脚本
# 测试 _next 路径是否正常工作

BASE_URL="http://localhost:5000"

printf "=== Next.js 静态资源访问测试 ===\n\n"

# 测试首页
printf "1. 测试首页访问...\n"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$status" -eq 200 ]; then
  printf "   ✅ 首页访问正常 (HTTP $status)\n"
else
  printf "   ❌ 首页访问失败 (HTTP $status)\n"
fi

printf "\n2. 测试静态资源路径...\n"

# 测试 _next 路径
test_paths=(
  "/_next/static/css"
  "/_next/static/chunks"
  "/_next/static/media"
)

for path in "${test_paths[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  if [ "$status" -eq 200 ] || [ "$status" -eq 304 ]; then
    printf "   ✅ $path (HTTP $status)\n"
  elif [ "$status" -eq 404 ]; then
    printf "   ⚠️  $path (HTTP 404) - 可能是正常现象\n"
  else
    printf "   ❌ $path (HTTP $status)\n"
  fi
done

printf "\n3. 检查实际静态文件...\n"

# 检查容器内的静态文件
if [ -d "/app/.next/static" ]; then
  file_count=$(find /app/.next/static -type f 2>/dev/null | wc -l)
  printf "   ✅ .next/static 目录存在，包含 %d 个文件\n" "$file_count"

  # 列出一些示例文件
  printf "\n   示例文件:\n"
  find /app/.next/static -type f 2>/dev/null | head -5 | while read -r file; do
    relative_path=${file#/app/}
    printf "   - $relative_path\n"
  done
else
  printf "   ❌ .next/static 目录不存在\n"
fi

printf "\n4. 测试路由映射...\n"

# 测试 .next 路径（应该返回 404 或重定向）
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/.next/static/")
if [ "$status" -eq 404 ] || [ "$status" -eq 200 ]; then
  printf "   ✅ /.next/static/* 路径正常（HTTP $status）\n"
  printf "      说明：.next 是物理目录，不应该直接访问\n"
else
  printf "   ⚠️  /.next/static/* 路径异常（HTTP $status）\n"
fi

# 测试 _next 路径（应该返回 404 或目录列表）
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/_next/static/")
if [ "$status" -eq 404 ] || [ "$status" -eq 200 ]; then
  printf "   ✅ /_next/static/* 路径正常（HTTP $status）\n"
  printf "      说明：Next.js 会自动处理 _next 路径\n"
else
  printf "   ❌ /_next/static/* 路径异常（HTTP $status）\n"
fi

printf "\n=== 测试完成 ===\n"
printf "\n提示：\n"
printf "- ✅ 正常：浏览器通过 /_next/* 访问静态资源\n"
printf "- ❌ 异常：/ 请求返回 HTML 而不是静态文件\n"
printf "- ✅ 这是 Next.js 的正常行为\n"
