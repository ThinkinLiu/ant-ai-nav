#!/bin/sh

# Docker 静态资源文件名不一致问题诊断脚本
# 用于诊断和修复页面引用文件名与实际文件名不一致的问题

BASE_URL="${1:-http://localhost:5000}"

printf "=== Docker 静态资源文件名不一致诊断 ===\n\n"

# 1. 检查容器环境
printf "【1】容器环境信息\n"
printf "工作目录: $(pwd)\n"
printf "用户: $(whoami)\n"
printf "NODE_ENV: $NODE_ENV\n"
printf "PORT: $PORT\n\n"

# 2. 检查静态文件是否存在
printf "【2】静态文件检查\n"
if [ -d "/app/.next/static" ]; then
  printf "✅ .next/static 目录存在\n"
  css_count=$(find /app/.next/static -name "*.css" 2>/dev/null | wc -l)
  js_count=$(find /app/.next/static -name "*.js" 2>/dev/null | wc -l)
  printf "   CSS 文件数: %d\n" "$css_count"
  printf "   JS 文件数: %d\n" "$js_count"

  if [ "$css_count" -eq 0 ]; then
    printf "   ❌ 警告：没有 CSS 文件！\n"
  fi
  if [ "$js_count" -eq 0 ]; then
    printf "   ❌ 警告：没有 JS 文件！\n"
  fi
else
  printf "❌ .next/static 目录不存在\n"
  exit 1
fi

printf "\n"

# 3. 获取页面引用的文件名
printf "【3】页面引用的文件名\n"
page_css=$(curl -s "$BASE_URL/" 2>/dev/null | grep -oE 'href="[^"]+\.css"' | sed 's/href="//;s/"//' | head -3)
page_js=$(curl -s "$BASE_URL/" 2>/dev/null | grep -oE 'src="[^"]+\.js"' | sed 's/src="//;s/"//' | head -3)

if [ -n "$page_css" ]; then
  printf "CSS 文件:\n"
  echo "$page_css" | while read -r file; do
    if [ -n "$file" ]; then
      printf "   - %s\n" "$file"
    fi
  done
else
  printf "   ⚠️  未能获取 CSS 文件引用\n"
fi

if [ -n "$page_js" ]; then
  printf "JS 文件:\n"
  echo "$page_js" | while read -r file; do
    if [ -n "$file" ]; then
      printf "   - %s\n" "$file"
    fi
  done
else
  printf "   ⚠️  未能获取 JS 文件引用\n"
fi

printf "\n"

# 4. 检查容器中的实际文件名
printf "【4】容器中的实际文件名（前 10 个）\n"
printf "CSS 文件:\n"
find /app/.next/static -name "*.css" 2>/dev/null | xargs basename 2>/dev/null | head -5 | while read -r file; do
  printf "   - %s\n" "$file"
done

printf "JS 文件:\n"
find /app/.next/static -name "*.js" 2>/dev/null | xargs basename 2>/dev/null | head -5 | while read -r file; do
  printf "   - %s\n" "$file"
done

printf "\n"

# 5. 检查文件名中是否包含路径信息
printf "【5】检查文件名是否包含路径信息\n"
has_path_prefix=0
find /app/.next/static -type f -name "*.css" 2>/dev/null | while read -r file; do
  filename=$(basename "$file")
  if echo "$filename" | grep -qE "(workspace|projects|home|runner|user)"; then
    printf "❌ 发现路径前缀: %s\n" "$filename"
    has_path_prefix=1
  fi
done

if [ "$has_path_prefix" -eq 0 ]; then
  printf "✅ 文件名中未发现路径前缀\n"
fi

printf "\n"

# 6. 检查 BUILD_ID
printf "【6】BUILD_ID 信息\n"
if [ -f "/app/.next/BUILD_ID" ]; then
  build_id=$(cat /app/.next/BUILD_ID)
  printf "BUILD_ID: %s\n" "$build_id"
  printf "构建时间: "
  ls -la /app/.next/BUILD_ID | awk '{print $6, $7, $8, $9}'
else
  printf "❌ BUILD_ID 文件不存在\n"
fi

printf "\n"

# 7. 检查构建时的元数据
printf "【7】构建元数据检查\n"
if [ -f "/app/.next/build-manifest.json" ]; then
  printf "✅ build-manifest.json 存在\n"
  printf "   示例页面（前 3 个）:\n"
  grep -oE '"[a-z/_-]+":\s*\[' /app/.next/build-manifest.json | head -3 | while read -r line; do
    printf "   - %s\n" "$line"
  done
else
  printf "❌ build-manifest.json 不存在\n"
fi

printf "\n"

# 8. 测试页面引用的文件是否存在
printf "【8】测试页面引用的文件是否存在\n"
echo "$page_css" | while read -r file; do
  if [ -n "$file" ]; then
    full_path="/app/.next/$file"
    if [ -f "$full_path" ]; then
      printf "✅ %s 存在\n" "$file"
    else
      printf "❌ %s 不存在\n" "$file"
      printf "   期望路径: %s\n" "$full_path"

      # 尝试查找类似的文件
      basename_only=$(basename "$file")
      similar_files=$(find /app/.next/static -name "*${basename_only##*_}*")
      if [ -n "$similar_files" ]; then
        printf "   可能的匹配文件:\n"
        echo "$similar_files" | head -3 | while read -r similar; do
          printf "   - /_next/static/chunks/%s\n" "$(basename "$similar")"
        done
      fi
    fi
  fi
done

printf "\n"

# 9. 诊断结论
printf "【9】诊断结论\n\n"

# 检查是否有文件名不一致
mismatch=0
echo "$page_css" | while read -r file; do
  if [ -n "$file" ]; then
    full_path="/app/.next/$file"
    if [ ! -f "$full_path" ]; then
      mismatch=1
    fi
  fi
done

if [ "$mismatch" -eq 1 ]; then
  printf "❌ 发现问题：页面引用的文件与实际文件名不一致\n\n"
  printf "可能的原因：\n"
  printf "1. 构建环境和运行环境的工作目录不一致\n"
  printf "2. 使用了旧的构建产物\n"
  printf "3. 浏览器缓存了旧的 HTML\n\n"
  printf "解决方案：\n"
  printf "1. 重新构建 Docker 镜像：docker-compose build --no-cache\n"
  printf "2. 清除浏览器缓存并强制刷新\n"
  printf "3. 检查构建时的工作目录是否为 /app\n"
else
  printf "✅ 未发现文件名不一致问题\n\n"
  printf "如果页面仍然无法加载，请检查：\n"
  printf "1. 浏览器控制台是否有其他错误\n"
  printf "2. 网络标签中的 HTTP 状态码\n"
  printf "3. Nginx 反向代理配置（如果使用）\n"
fi

printf "\n=== 诊断完成 ===\n"
