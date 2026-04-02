#!/bin/sh
# 静态资源 404 问题诊断脚本

set -e

echo "🔍 静态资源 404 问题诊断工具"
echo "================================"
echo ""

CONTAINER_NAME="ant-ai-nav"

# 检查容器是否运行
if ! docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "❌ 容器未运行"
    exit 1
fi

echo "✅ 容器运行中"
echo ""

# 1. 检查 .next/static 目录
echo "📁 1. 检查 .next/static 目录..."
if docker exec $CONTAINER_NAME test -d "/app/.next/static"; then
    echo "✅ .next/static 目录存在"
    echo ""
    echo "目录内容："
    docker exec $CONTAINER_NAME ls -la /app/.next/static | head -15
    echo ""

    # 统计文件数量
    JS_COUNT=$(docker exec $CONTAINER_NAME find /app/.next/static -name "*.js" 2>/dev/null | wc -l)
    CSS_COUNT=$(docker exec $CONTAINER_NAME find /app/.next/static -name "*.css" 2>/dev/null | wc -l)
    echo "✅ 发现 $JS_COUNT 个 JS 文件"
    echo "✅ 发现 $CSS_COUNT 个 CSS 文件"
    echo ""
else
    echo "❌ .next/static 目录不存在"
    echo ""
fi

# 2. 检查 _next 路径
echo "🔗 2. 检查 _next 路径..."
if docker exec $CONTAINER_NAME test -L "/app/_next"; then
    TARGET=$(docker exec $CONTAINER_NAME readlink /app/_next)
    echo "✅ _next 是软链接"
    echo "   指向: $TARGET"
    echo ""

    # 验证软链接是否有效
    if docker exec $CONTAINER_NAME test -d "/app/_next"; then
        echo "✅ 软链接有效，可以访问"
    else
        echo "❌ 软链接无效，指向的目录不存在"
    fi
    echo ""
elif docker exec $CONTAINER_NAME test -d "/app/_next"; then
    echo "⚠️  _next 是实际目录（不是软链接）"
    echo "   这可能导致路径映射问题"
    echo ""
else
    echo "❌ _next 不存在（需要创建软链接）"
    echo ""
fi

# 3. 检查 BUILD_ID
echo "🆔 3. 检查 BUILD_ID..."
if docker exec $CONTAINER_NAME test -f "/app/.next/static/BUILD_ID"; then
    BUILD_ID=$(docker exec $CONTAINER_NAME cat /app/.next/static/BUILD_ID)
    echo "✅ BUILD_ID 存在: $BUILD_ID"
    echo ""
else
    echo "⚠️  BUILD_ID 不存在"
    echo ""
fi

# 4. 测试静态资源访问
echo "🌐 4. 测试静态资源访问..."
if docker exec $CONTAINER_NAME test -f "/app/.next/static/BUILD_ID"; then
    echo "测试: curl -I http://localhost:5000/_next/static/BUILD_ID"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/_next/static/BUILD_ID)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ 静态资源访问正常 (HTTP 200)"
    else
        echo "❌ 静态资源访问失败 (HTTP $HTTP_CODE)"
    fi
    echo ""
else
    echo "⚠️  无法测试（BUILD_ID 不存在）"
    echo ""
fi

# 5. 检查 public 目录
echo "📂 5. 检查 public 目录..."
if docker exec $CONTAINER_NAME test -d "/app/public"; then
    PUBLIC_FILES=$(docker exec $CONTAINER_NAME find /app/public -type f | wc -l)
    echo "✅ public 目录存在"
    echo "   包含 $PUBLIC_FILES 个文件"
    echo ""
else
    echo "❌ public 目录不存在"
    echo ""
fi

# 6. 诊断结论
echo "================================"
echo "🎯 诊断结论："
echo ""

HAS_STATIC=$(docker exec $CONTAINER_NAME test -d "/app/.next/static" && echo "yes" || echo "no")
HAS_NEXT_LINK=$(docker exec $CONTAINER_NAME test -L "/app/_next" && echo "yes" || echo "no")
HAS_STATIC_FILES=$(docker exec $CONTAINER_NAME find /app/.next/static -name "*.js" 2>/dev/null | wc -l)

if [ "$HAS_STATIC" = "no" ]; then
    echo "❌ 问题：.next/static 目录不存在"
    echo ""
    echo "📋 解决方案："
    echo "   需要重新构建 Docker 镜像"
    echo "   参考: docs/docker-build-fix.md"
elif [ "$HAS_STATIC_FILES" -eq 0 ]; then
    echo "❌ 问题：.next/static 目录为空"
    echo ""
    echo "📋 解决方案："
    echo "   需要重新构建 Docker 镜像"
    echo "   检查构建日志，确认静态资源是否正确生成"
elif [ "$HAS_NEXT_LINK" = "no" ]; then
    echo "❌ 问题：_next 软链接不存在"
    echo ""
    echo "📋 解决方案："
    echo "   执行以下命令创建软链接："
    echo ""
    echo "   docker exec -it -u root $CONTAINER_NAME sh -c \"ln -sf /app/.next/static /app/_next\""
    echo "   docker restart $CONTAINER_NAME"
else
    LINK_TARGET=$(docker exec $CONTAINER_NAME readlink /app/_next 2>/dev/null)
    if [ "$LINK_TARGET" = "/app/.next/static" ]; then
        echo "✅ 静态资源配置正常"
        echo ""
        echo "📋 如果仍然出现 404，请检查："
        echo "   1. 浏览器缓存是否清除"
        echo "   2. Nginx/反向代理配置"
        echo "   3. Docker 日志: docker logs $CONTAINER_NAME"
    else
        echo "⚠️  _next 软链接指向错误: $LINK_TARGET"
        echo ""
        echo "📋 解决方案："
        echo "   删除并重新创建软链接："
        echo ""
        echo "   docker exec -it -u root $CONTAINER_NAME sh -c \"rm -f /app/_next && ln -sf /app/.next/static /app/_next\""
        echo "   docker restart $CONTAINER_NAME"
    fi
fi

echo ""
echo "================================"
echo "📝 常用命令："
echo ""
echo "   查看静态资源结构："
echo "   docker exec $CONTAINER_NAME find /app/.next/static -type f | head -20"
echo ""
echo "   手动创建软链接："
echo "   docker exec -it -u root $CONTAINER_NAME sh -c \"ln -sf /app/.next/static /app/_next\""
echo ""
echo "   重启容器："
echo "   docker restart $CONTAINER_NAME"
echo ""
echo "   查看日志："
echo "   docker logs -f $CONTAINER_NAME"
echo ""
