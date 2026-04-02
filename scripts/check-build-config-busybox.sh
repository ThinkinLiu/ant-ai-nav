#!/bin/sh

# 兼容 BusyBox 的构建配置检查脚本

echo "=== 兼容 BusyBox 的数据库配置检查 ==="
echo ""

# 1. 检查环境变量
echo "【1】环境变量"
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "✅ NEXT_PUBLIC_SUPABASE_URL 已设置"
  echo "   ${NEXT_PUBLIC_SUPABASE_URL:0:50}..."
else
  echo "❌ NEXT_PUBLIC_SUPABASE_URL 未设置"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置"
  echo "   ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:50}..."
else
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置"
fi
echo ""

# 2. 搜索构建产物中的 Supabase URL
echo "【2】搜索构建产物中的 Supabase URL"
supabase_url=""
for file in $(find /app/.next -name "*.js" -type f 2>/dev/null | head -100); do
  if grep -q "https://.*\.supabase" "$file" 2>/dev/null; then
    supabase_url=$(grep "https://.*\.supabase" "$file" 2>/dev/null | head -1)
    break
  fi
done

if [ -n "$supabase_url" ]; then
  echo "✅ 在构建产物中找到 Supabase URL"
  echo "   ${supabase_url:0:100}..."
else
  echo "❌ 在构建产物中未找到 Supabase URL"
  echo "   说明：构建时未正确设置环境变量"
fi
echo ""

# 3. 检查是否有空值
echo "【3】检查空值"
empty_found=0
for file in $(find /app/.next -name "*.js" -type f 2>/dev/null | head -100); do
  if grep -q 'NEXT_PUBLIC_SUPABASE_URL.*""' "$file" 2>/dev/null; then
    echo "❌ 发现空字符串在: $file"
    empty_found=1
    break
  fi
done

if [ "$empty_found" -eq 0 ]; then
  echo "✅ 未发现空字符串"
fi
echo ""

# 4. 检查是否有 undefined
echo "【4】检查 undefined"
undefined_found=0
for file in $(find /app/.next -name "*.js" -type f 2>/dev/null | head -100); do
  if grep -q "NEXT_PUBLIC_SUPABASE_URL.*undefined" "$file" 2>/dev/null; then
    echo "❌ 发现 undefined 在: $file"
    undefined_found=1
    break
  fi
done

if [ "$undefined_found" -eq 0 ]; then
  echo "✅ 未发现 undefined 值"
fi
echo ""

# 5. 检查 BUILD_ID
echo "【5】构建信息"
if [ -f "/app/.next/BUILD_ID" ]; then
  build_id=$(cat /app/.next/BUILD_ID)
  echo "BUILD_ID: $build_id"

  # 检查文件信息
  if [ -x "/usr/bin/stat" ] || [ -x "/bin/stat" ]; then
    stat -c "%y" /app/.next/BUILD_ID 2>/dev/null || stat -f "%Sm" /app/.next/BUILD_ID 2>/dev/null || echo "构建时间: 未知"
  else
    ls -la /app/.next/BUILD_ID | awk '{print "构建时间: " $6, $7, $8}'
  fi
else
  echo "❌ BUILD_ID 文件不存在"
fi
echo ""

# 6. 文件统计
echo "【6】文件统计"
total_js=$(find /app/.next -name "*.js" -type f 2>/dev/null | wc -l)
static_css=$(find /app/.next/static -name "*.css" -type f 2>/dev/null | wc -l)
static_js=$(find /app/.next/static -name "*.js" -type f 2>/dev/null | wc -l)
server_files=$(find /app/.next/server -type f 2>/dev/null | wc -l)

echo "总 JS 文件数: $total_js"
echo "static CSS 文件: $static_css"
echo "static JS 文件: $static_js"
echo "server 文件数: $server_files"

if [ "$static_css" -eq 0 ] && [ "$static_js" -eq 0 ]; then
  echo "⚠️  警告：static 目录中没有文件！"
fi
echo ""

# 7. 目录大小
echo "【7】目录大小"
if command -v du >/dev/null 2>&1; then
  echo ".next/: $(du -sh /app/.next 2>/dev/null | cut -f1)"
  echo ".next/static/: $(du -sh /app/.next/static 2>/dev/null | cut -f1)"
  echo ".next/server/: $(du -sh /app/.next/server 2>/dev/null | cut -f1)"
else
  echo "du 命令不可用，跳过"
fi
echo ""

# 8. 列出关键文件
echo "【8】关键文件"
ls -la /app/.next/BUILD_ID
ls -la /app/server.js
echo ""

# 9. 综合诊断
echo "【9】综合诊断结论"
issues=0

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ 运行时环境变量缺失"
  issues=$((issues + 1))
fi

if [ -z "$supabase_url" ]; then
  echo "❌ 构建产物中缺少 Supabase URL"
  issues=$((issues + 1))
fi

if [ "$empty_found" -eq 1 ]; then
  echo "❌ 发现空字符串"
  issues=$((issues + 1))
fi

if [ "$undefined_found" -eq 1 ]; then
  echo "❌ 发现 undefined 值"
  issues=$((issues + 1))
fi

if [ "$static_css" -eq 0 ] && [ "$static_js" -eq 0 ]; then
  echo "❌ static 目录为空"
  issues=$((issues + 1))
fi

echo ""
if [ "$issues" -eq 0 ]; then
  echo "✅ 所有检查通过，构建配置正确"
  echo ""
  echo "下一步："
  echo "1. 在宿主机上测试 API: curl http://你的服务器IP:5000/api/home"
  echo "2. 在浏览器中访问网站"
else
  echo "❌ 发现 $issues 个问题，需要修复"
  echo ""
  echo "解决方案："
  echo "1. 确保 .env 文件包含正确的配置"
  echo "2. 重新构建: docker-compose build --no-cache"
  echo "3. 重启容器: docker-compose down && docker-compose up -d"
fi

echo ""
echo "=== 检查完成 ==="
