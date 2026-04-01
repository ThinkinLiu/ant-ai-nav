#!/bin/sh
# 调试 Docker 镜像静态资源问题

echo "🔍 调试 Docker 镜像静态资源问题"
echo "================================"
echo ""

# 检查是否运行着容器
CONTAINER_ID=$(docker ps -q -f name=ant-ai-nav)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ 未找到运行中的 ant-ai-nav 容器"
    echo ""
    echo "请先启动容器："
    echo "  docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest"
    exit 1
fi

echo "✅ 找到容器: $CONTAINER_ID"
echo ""

# 检查文件结构
echo "📁 检查容器内文件结构："
echo ""

echo "=== 根目录 ==="
docker exec $CONTAINER_ID ls -la /app
echo ""

echo "=== .next 目录 ==="
docker exec $CONTAINER_ID ls -la /app/.next 2>/dev/null || echo "❌ .next 目录不存在"
echo ""

echo "=== .next/static 目录 ==="
if docker exec $CONTAINER_ID [ -d "/app/.next/static" ]; then
    echo "✅ .next/static 存在"
    docker exec $CONTAINER_ID ls -la /app/.next/static | head -15
else
    echo "❌ .next/static 不存在"
fi
echo ""

echo "=== public 目录 ==="
if docker exec $CONTAINER_ID [ -d "/app/public" ]; then
    echo "✅ public 存在"
    docker exec $CONTAINER_ID ls -la /app/public | head -15
else
    echo "❌ public 不存在"
fi
echo ""

echo "=== node_modules 目录 ==="
if docker exec $CONTAINER_ID [ -d "/app/node_modules" ]; then
    echo "✅ node_modules 存在"
    docker exec $CONTAINER_ID ls /app/node_modules | head -10
else
    echo "❌ node_modules 不存在"
fi
echo ""

echo "=== server.js 文件 ==="
if docker exec $CONTAINER_ID [ -f "/app/server.js" ]; then
    echo "✅ server.js 存在"
    docker exec $CONTAINER_ID ls -la /app/server.js
else
    echo "❌ server.js 不存在"
fi
echo ""

# 检查关键静态资源
echo "🔍 检查关键静态资源："
echo ""

echo "=== 检查 _next 静态文件 ==="
STATIC_FILES=$(docker exec $CONTAINER_ID find /app -name "*.css" -o -name "*.js" 2>/dev/null | grep -E "(chunks|static)" | head -10)
if [ -n "$STATIC_FILES" ]; then
    echo "✅ 找到静态文件："
    echo "$STATIC_FILES"
else
    echo "❌ 未找到静态文件"
fi
echo ""

# 检查端口和访问
echo "🌐 检查服务访问："
echo ""

echo "=== 容器端口映射 ==="
docker port $CONTAINER_ID
echo ""

echo "=== 检查服务响应 ==="
curl -I http://localhost:5000 2>/dev/null | head -5
echo ""

# 检查日志
echo "📋 检查容器日志（最后 20 行）："
echo ""
docker logs --tail 20 $CONTAINER_ID
echo ""

# 建议
echo "💡 建议："
echo ""
echo "1. 如果 .next/static 不存在，需要修改 Dockerfile"
echo "2. 如果 public 不存在，需要修改 Dockerfile"
echo "3. 检查 next.config.ts 的 output: 'standalone' 配置"
echo "4. 确保构建时静态文件被正确生成"
echo ""

# 常见问题检查
echo "🔧 常见问题检查："
echo ""

# 检查是否是路径问题
echo "=== 检查 standalone 输出路径 ==="
docker exec $CONTAINER_ID sh -c "if [ -f '/app/package.json' ]; then echo '✅ package.json 存在'; cat /app/package.json | grep -E '(name|version)' | head -2; else echo '❌ package.json 不存在'; fi"
echo ""
