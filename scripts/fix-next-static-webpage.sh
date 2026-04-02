#!/bin/sh
# 修复 Next.js 静态资源返回网页问题

set -e

CONTAINER_NAME="ant-ai-nav"

echo "🔧 Next.js 静态资源返回网页问题修复工具"
echo "========================================"
echo ""

# 检查容器是否运行
if ! docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "❌ 容器未运行"
    exit 1
fi

echo "✅ 容器运行中"
echo ""

# 1. 检查当前 _next 软链接状态
echo "🔍 1. 检查当前 _next 软链接状态..."
if docker exec $CONTAINER_NAME test -L "/app/_next"; then
    TARGET=$(docker exec $CONTAINER_NAME readlink /app/_next)
    echo "✅ _next 软链接存在"
    echo "   指向: $TARGET"

    if [ "$TARGET" = ".next" ] || [ "$TARGET" = "/app/.next" ]; then
        echo "✅ 软链接指向正确"
    else
        echo "⚠️  软链接指向错误，需要修复"
    fi
elif docker exec $CONTAINER_NAME test -d "/app/_next"; then
    echo "⚠️  _next 是实际目录（不是软链接）"
    echo "   需要删除并重建软链接"
else
    echo "❌ _next 软链接不存在"
    echo "   需要创建软链接"
fi
echo ""

# 2. 测试当前静态资源访问
echo "🌐 2. 测试静态资源访问..."
echo "测试: curl -I http://localhost:5000/_next/static/BUILD_ID"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/_next/static/BUILD_ID 2>/dev/null)
CONTENT_TYPE=$(curl -s -o /dev/null -w "%{content_type}" http://localhost:5000/_next/static/BUILD_ID 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$CONTENT_TYPE" | grep -q "text/plain"; then
        echo "✅ 静态资源访问正常 (HTTP 200, Content-Type: $CONTENT_TYPE)"
    else
        echo "⚠️  返回 200 但 Content-Type 不正确: $CONTENT_TYPE"
    fi
else
    echo "❌ 静态资源访问失败 (HTTP $HTTP_CODE)"
fi
echo ""

# 3. 修复软链接
echo "🔧 3. 修复 _next 软链接..."
echo "删除旧的软链接（如果存在）..."
docker exec -it -u root $CONTAINER_NAME sh -c "rm -f /app/_next" 2>/dev/null

echo "创建新的软链接..."
docker exec -it -u root $CONTAINER_NAME sh -c "cd /app && ln -sf .next _next"

if [ $? -eq 0 ]; then
    echo "✅ 软链接创建成功"
else
    echo "❌ 软链接创建失败"
    exit 1
fi
echo ""

# 4. 验证软链接
echo "✅ 4. 验证软链接..."
docker exec $CONTAINER_NAME sh -c "ls -la /app/_next"
echo ""

# 5. 重启容器
echo "🔄 5. 重启容器..."
docker restart $CONTAINER_NAME

echo "等待容器启动..."
sleep 5
echo ""

# 6. 重新测试
echo "🌐 6. 重新测试静态资源访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/_next/static/BUILD_ID 2>/dev/null)
CONTENT_TYPE=$(curl -s -o /dev/null -w "%{content_type}" http://localhost:5000/_next/static/BUILD_ID 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$CONTENT_TYPE" | grep -q "text/plain"; then
        echo "✅ 静态资源访问成功！"
        echo "   HTTP Code: $HTTP_CODE"
        echo "   Content-Type: $CONTENT_TYPE"
        echo ""
        echo "🎉 修复成功！"
    else
        echo "⚠️  返回 200 但 Content-Type 仍不正确: $CONTENT_TYPE"
        echo "   可能需要检查其他配置"
    fi
else
    echo "❌ 静态资源访问仍然失败 (HTTP $HTTP_CODE)"
    echo ""
    echo "请检查日志："
    echo "docker logs $CONTAINER_NAME"
fi
echo ""

# 7. 显示下一步建议
echo "================================"
echo "📝 下一步："
echo ""
echo "1. 清除浏览器缓存"
echo "2. 刷新页面（Ctrl + Shift + R 强制刷新）"
echo "3. 检查静态资源是否正常加载"
echo ""
echo "如果问题仍然存在，请检查："
echo "- Docker 日志: docker logs $CONTAINER_NAME"
echo "- 静态资源目录: docker exec $CONTAINER_NAME ls -la /app/_next/static"
echo ""
