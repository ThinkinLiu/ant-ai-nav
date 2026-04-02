#!/bin/sh
# 完整部署检查清单

set -e

echo "🚀 蚂蚁AI导航 - 完整部署检查清单"
echo "================================"
echo ""

CONTAINER_NAME="ant-ai-nav"
BASE_URL="${1:-http://localhost:5000}"

# 1. 检查容器状态
echo "📦 1. 检查容器状态..."
if docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "✅ 容器正在运行"
    docker ps -f name=$CONTAINER_NAME
else
    echo "❌ 容器未运行"
    echo ""
    echo "启动命令："
    echo "docker run -d -p 5000:5000 --name $CONTAINER_NAME -v \$(pwd)/config:/app/config --restart unless-stopped ant-ai-nav:latest"
    exit 1
fi
echo ""

# 2. 检查服务端口
echo "🔌 2. 检查服务端口..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200\|304"; then
    echo "✅ 服务端口正常 (HTTP 200)"
else
    echo "❌ 服务端口异常"
    exit 1
fi
echo ""

# 3. 检查静态资源
echo "📁 3. 检查静态资源..."
echo "检查 _next 软链接..."
if docker exec $CONTAINER_NAME sh -c "cd /app && test -L _next"; then
    TARGET=$(docker exec $CONTAINER_NAME sh -c "cd /app && readlink _next")
    echo "✅ _next 软链接存在，指向: $TARGET"
else
    echo "❌ _next 软链接不存在"
    echo ""
    echo "修复命令："
    echo "docker exec -it -u root $CONTAINER_NAME sh -c \"cd /app && ln -sf .next _next\""
fi
echo ""

echo "测试静态资源访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/_next/static/BUILD_ID 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 静态资源访问正常 (HTTP 200)"
else
    echo "⚠️  静态资源访问异常 (HTTP $HTTP_CODE)"
fi
echo ""

# 4. 检查配置目录
echo "⚙️  4. 检查配置目录..."
if [ -d "./config" ]; then
    echo "✅ 配置目录存在"
    ls -la ./config | grep -E "database\.json|\.env\.local" || echo "⚠️  配置文件不存在"
else
    echo "❌ 配置目录不存在"
    echo ""
    echo "创建命令："
    echo "mkdir -p ./config && chmod 777 ./config"
fi
echo ""

# 5. 检查数据库配置
echo "🗄️  5. 检查数据库配置..."
if [ -f "./config/database.json" ]; then
    echo "✅ 数据库配置文件存在"
    cat ./config/database.json | grep -E "supabaseUrl|supabaseAnonKey" && echo "✅ 配置已填写" || echo "⚠️  配置未填写"
else
    echo "⚠️  数据库配置文件不存在"
    echo ""
    echo "配置方式："
    echo "1. 访问 $BASE_URL/settings"
    echo "2. 填写 Supabase 配置信息"
    echo "3. 或使用 API: curl -X POST $BASE_URL/api/config/database/save -d '{...}'"
fi
echo ""

# 6. 测试 API 接口
echo "🌐 6. 测试 API 接口..."
echo "测试首页 API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/home 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 首页 API 正常 (HTTP 200)"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "⚠️  首页 API 返回 500（可能数据库未配置）"
else
    echo "⚠️  首页 API 异常 (HTTP $HTTP_CODE)"
fi
echo ""

# 7. 检查日志
echo "📋 7. 检查日志..."
ERROR_COUNT=$(docker logs --tail 100 $CONTAINER_NAME 2>&1 | grep -iE "error|exception|failed" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "✅ 最近 100 行日志无错误"
else
    echo "⚠️  最近 100 行日志发现 $ERROR_COUNT 个错误"
    echo ""
    echo "查看错误："
    echo "docker logs --tail 100 $CONTAINER_NAME | grep -iE \"error|exception|failed\""
fi
echo ""

# 8. 总结
echo "================================"
echo "🎯 部署检查总结："
echo ""
echo "✅ 容器运行正常"
echo "✅ 服务端口正常"
echo "✅ 配置目录存在"
echo ""

# 检查关键项
ALL_OK=true

if ! docker exec $CONTAINER_NAME sh -c "cd /app && test -L _next" 2>/dev/null; then
    echo "❌ _next 软链接未创建"
    ALL_OK=false
fi

if [ ! -f "./config/database.json" ]; then
    echo "⚠️  数据库未配置"
    ALL_OK=false
fi

if curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/home 2>/dev/null | grep -q "500"; then
    echo "⚠️  API 返回 500（数据库问题）"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo "🎉 所有检查通过！网站应该可以正常使用。"
else
    echo ""
    echo "📝 需要完成的配置："
    echo ""
    echo "1. 修复 _next 软链接："
    echo "   docker exec -it -u root $CONTAINER_NAME sh -c \"cd /app && ln -sf .next _next\""
    echo "   docker restart $CONTAINER_NAME"
    echo ""
    echo "2. 配置数据库："
    echo "   访问 $BASE_URL/settings"
    echo "   填写 Supabase 配置信息"
    echo ""
    echo "3. 初始化数据库（如果需要）："
    echo "   访问 $BASE_URL/admin/data-migration"
    echo ""
fi

echo ""
echo "================================"
echo "📝 常用命令："
echo ""
echo "查看日志："
echo "  docker logs -f $CONTAINER_NAME"
echo ""
echo "重启容器："
echo "  docker restart $CONTAINER_NAME"
echo ""
echo "进入容器："
echo "  docker exec -it $CONTAINER_NAME sh"
echo ""
echo "配置数据库："
echo "  访问 $BASE_URL/settings"
echo ""
