#!/bin/sh
# 检查静态资源目录内容脚本

echo "=== .next/static 完整结构 ==="
ls -la /app/.next/static/

echo ""
echo "=== 查找所有 JS 文件 ==="
find /app/.next/static -name "*.js" 2>/dev/null | head -10

echo ""
echo "=== 查找所有 CSS 文件 ==="
find /app/.next/static -name "*.css" 2>/dev/null | head -10

echo ""
echo "=== 查找所有图片文件 ==="
find /app/.next/static -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.ico" 2>/dev/null | head -5

echo ""
echo "=== 检查各子目录文件数量 ==="
for dir in /app/.next/static/*/; do
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f | wc -l)
        dirname=$(basename "$dir")
        echo "$dirname: $count 个文件"
    fi
done

echo ""
echo "=== 检查 _next 路径 ==="
if [ -L "/app/_next" ]; then
    TARGET=$(readlink /app/_next)
    echo "_next 是软链接，指向: $TARGET"
    if [ "$TARGET" = "/app/.next" ]; then
        echo "✅ 软链接指向正确（应该指向 .next）"
    else
        echo "❌ 软链接指向错误（应该指向 /app/.next）"
    fi
elif [ -d "/app/_next" ]; then
    echo "_next 是目录"
    ls -la /app/_next
else
    echo "_next 不存在（需要创建软链接）"
fi

echo ""
echo "=== 测试静态资源访问 ==="
if [ -f "/app/.next/static/BUILD_ID" ]; then
    echo "✅ BUILD_ID 存在: $(cat /app/.next/static/BUILD_ID)"
else
    echo "❌ BUILD_ID 不存在"
fi
