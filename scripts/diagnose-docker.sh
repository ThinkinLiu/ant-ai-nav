#!/bin/sh
# Docker 容器诊断脚本

set -e

echo "🔍 Docker 容器诊断工具"
echo "======================"
echo ""

CONTAINER_NAME="ant-ai-nav"

# 检查容器是否存在
echo "📦 1. 检查容器状态..."
if docker ps -a -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "✅ 容器存在"
    docker ps -f name=$CONTAINER_NAME
    echo ""
else
    echo "❌ 容器不存在"
    exit 1
fi

# 检查容器运行状态
echo "🚀 2. 检查运行状态..."
if docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "✅ 容器正在运行"
    echo ""
else
    echo "⚠️  容器未运行，尝试启动..."
    docker start $CONTAINER_NAME
    sleep 3
    echo ""
fi

# 检查端口映射
echo "🔌 3. 检查端口映射..."
PORT=$(docker port $CONTAINER_NAME 5000 | head -1)
if [ -n "$PORT" ]; then
    echo "✅ 端口已映射: $PORT"
    echo ""
else
    echo "❌ 端口未映射"
    echo ""
fi

# 检查卷挂载
echo "📁 4. 检查卷挂载..."
docker inspect $CONTAINER_NAME | grep -A 10 "Mounts" | head -15
echo ""

# 检查环境变量
echo "🔧 5. 检查环境变量..."
docker exec $CONTAINER_NAME env | grep -E "SUPABASE|DATABASE|NEXT_PUBLIC|NODE_ENV" | sort || echo "⚠️  无法获取环境变量"
echo ""

# 检查配置文件
echo "📄 6. 检查配置文件..."
if docker exec $CONTAINER_NAME ls -la /app/config/ 2>/dev/null; then
    echo ""
    if docker exec $CONTAINER_NAME cat /app/config/.env.local 2>/dev/null; then
        echo ""
        echo "✅ 配置文件存在"
    else
        echo "⚠️  /app/config/.env.local 不存在"
    fi
else
    echo "❌ /app/config 目录不存在"
fi
echo ""

# 检查最近日志（错误信息）
echo "📋 7. 检查最近的错误日志..."
echo "最近 20 行日志："
docker logs --tail 20 $CONTAINER_NAME
echo ""

echo "搜索错误信息："
docker logs --tail 100 $CONTAINER_NAME 2>&1 | grep -iE "error|exception|failed|fatal" | tail -10 || echo "✅ 未发现明显错误"
echo ""

# 检查服务健康状态
echo "💓 8. 检查服务健康状态..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200\|304"; then
    echo "✅ 服务响应正常"
else
    echo "⚠️  服务可能未正常响应"
fi
echo ""

# 检查磁盘空间
echo "💾 9. 检查磁盘空间..."
df -h . | tail -1
echo ""

# 检查内存使用
echo "🧠 10. 检查内存使用..."
docker stats $CONTAINER_NAME --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

echo "========================================"
echo "🎯 诊断建议："
echo ""
echo "如果看到以下错误，请按对应方案处理："
echo ""
echo "1. supabase_url not found / Invalid credentials"
echo "   → 检查数据库配置是否正确"
echo "   → 访问 /settings 页面重新配置"
echo ""
echo "2. permission denied / cannot read file"
echo "   → 检查 ./config 目录权限"
echo "   → 执行: chmod 755 ./config"
echo ""
echo "3. ENOMEM / out of memory"
echo "   → 增加服务器内存或优化应用"
echo ""
echo "4. connection refused"
echo "   → 检查 Supabase URL 是否正确"
echo "   → 检查网络连接"
echo ""
echo "5. 未发现配置文件"
echo "   → 在 ./config 目录下创建 .env.local 文件"
echo "   → 或通过 /settings 页面配置"
echo ""
echo "========================================"
echo ""
echo "📝 查看实时日志："
echo "   docker logs -f $CONTAINER_NAME"
echo ""
echo "📝 查看完整日志（最近 200 行）："
echo "   docker logs --tail 200 $CONTAINER_NAME"
echo ""
echo "📝 进入容器调试："
echo "   docker exec -it $CONTAINER_NAME sh"
echo ""
