#!/bin/sh

# 检查构建代码中的数据库配置
# 用于验证构建时是否正确注入了环境变量

echo "=== 检查构建代码中的数据库配置 ==="
echo ""

# 1. 检查环境变量
echo "【1】检查运行时环境变量"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:50}..."
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:50}..."
echo ""

# 2. 检查构建产物中的 URL
echo "【2】检查构建产物中的 Supabase URL"
found_urls=$(grep -rh "https://.*\.supabase" /app/.next/ --include="*.js" 2>/dev/null | head -3)
if [ -n "$found_urls" ]; then
  echo "✅ 在构建产物中找到 Supabase URL："
  echo "$found_urls"
else
  echo "❌ 在构建产物中未找到 Supabase URL"
  echo "   说明：构建时未正确设置环境变量"
fi
echo ""

# 3. 检查是否有空值或 undefined
echo "【3】检查是否有空值或 undefined"
empty_check=$(grep -r "NEXT_PUBLIC_SUPABASE_URL.*undefined" /app/.next/ --include="*.js" 2>/dev/null | head -3)
if [ -n "$empty_check" ]; then
  echo "❌ 发现 undefined 值："
  echo "$empty_check"
else
  echo "✅ 未发现 undefined 值"
fi

null_check=$(grep -r 'NEXT_PUBLIC_SUPABASE_URL.*""' /app/.next/ --include="*.js" 2>/dev/null | head -3)
if [ -n "$null_check" ]; then
  echo "❌ 发现空字符串："
  echo "$null_check"
else
  echo "✅ 未发现空字符串"
fi
echo ""

# 4. 检查特定文件
echo "【4】检查关键配置文件"
if [ -f "/app/.next/server/app-build-manifest.json" ]; then
  echo "✅ app-build-manifest.json 存在"
else
  echo "❌ app-build-manifest.json 不存在"
fi

if [ -f "/app/.next/build-manifest.json" ]; then
  echo "✅ build-manifest.json 存在"
else
  echo "❌ build-manifest.json 不存在"
fi
echo ""

# 5. 测试实际的 API 调用
echo "【5】测试 API 调用"
api_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:5000/api/home 2>&1)
http_code=$(echo "$api_response" | tail -1 | grep -oE "HTTP_CODE:[0-9]+" | cut -d: -f2)
response_body=$(echo "$api_response" | sed '/HTTP_CODE:/d' | head -c 200)

if [ "$http_code" = "200" ]; then
  echo "✅ API 调用成功 (HTTP 200)"
  echo "   响应预览: $response_body..."
else
  echo "❌ API 调用失败 (HTTP $http_code)"
  echo "   响应: $response_body"
fi
echo ""

# 6. 检查 BUILD_ID
echo "【6】检查构建信息"
if [ -f "/app/.next/BUILD_ID" ]; then
  build_id=$(cat /app/.next/BUILD_ID)
  echo "BUILD_ID: $build_id"

  # 检查构建时间
  if command -v stat >/dev/null 2>&1; then
    build_time=$(stat -c "%y" /app/.next/BUILD_ID 2>/dev/null || stat -f "%Sm" /app/.next/BUILD_ID 2>/dev/null)
    echo "构建时间: $build_time"
  fi
else
  echo "❌ BUILD_ID 文件不存在"
fi
echo ""

# 7. 综合诊断
echo "【7】综合诊断结论"
supabase_url_found=0
empty_found=0
undefined_found=0

if [ -n "$found_urls" ]; then
  supabase_url_found=1
fi

if [ -n "$null_check" ]; then
  empty_found=1
fi

if [ -n "$empty_check" ]; then
  undefined_found=1
fi

if [ "$supabase_url_found" -eq 1 ] && [ "$empty_found" -eq 0 ] && [ "$undefined_found" -eq 0 ]; then
  echo "✅ 构建代码中包含正确的数据库配置"
  echo "   建议：API 测试也应该成功"
else
  echo "❌ 构建代码中缺少或包含错误的数据库配置"
  echo ""
  echo "问题分析："
  if [ "$supabase_url_found" -eq 0 ]; then
    echo "   - ❌ 构建产物中未找到 Supabase URL"
    echo "   - 原因：构建时未设置 NEXT_PUBLIC_SUPABASE_URL 环境变量"
  fi
  if [ "$empty_found" -eq 1 ]; then
    echo "   - ❌ 发现空字符串"
    echo "   - 原因：构建时环境变量为空"
  fi
  if [ "$undefined_found" -eq 1 ]; then
    echo "   - ❌ 发现 undefined 值"
    echo "   - 原因：构建时环境变量未定义"
  fi
  echo ""
  echo "解决方案："
  echo "   1. 确保 .env 文件包含正确的配置"
  echo "   2. 重新构建：docker-compose build --no-cache"
  echo "   3. 如果使用 GitHub Actions，确保 Secrets 已正确配置"
fi

echo ""
echo "=== 检查完成 ==="
