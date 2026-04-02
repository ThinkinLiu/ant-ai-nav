#!/bin/sh
# 蚂蚁AI导航 - 一键部署脚本

set -e

echo "🚀 蚂蚁AI导航 - 一键部署脚本"
echo "================================"
echo ""

CONTAINER_NAME="ant-ai-nav"
IMAGE_NAME="ant-ai-nav:latest"
MIRROR_FILE="docker-image.tar.gz"

# 检查镜像文件
if [ ! -f "$MIRROR_FILE" ]; then
    echo "❌ 未找到镜像文件: $MIRROR_FILE"
    echo "请先下载镜像文件到当前目录"
    exit 1
fi

echo "✅ 找到镜像文件: $MIRROR_FILE"
echo ""

# 1. 加载镜像
echo "📦 1. 加载 Docker 镜像..."
echo "这可能需要几分钟，请稍候..."
docker load < "$MIRROR_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 镜像加载成功"
else
    echo "❌ 镜像加载失败"
    exit 1
fi
echo ""

# 2. 停止并删除旧容器
echo "🛑 2. 停止并删除旧容器..."
if docker ps -a -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "停止旧容器..."
    docker stop $CONTAINER_NAME
    echo "删除旧容器..."
    docker rm $CONTAINER_NAME
    echo "✅ 旧容器已清理"
else
    echo "✅ 无旧容器需要清理"
fi
echo ""

# 3. 创建配置目录
echo "⚙️  3. 创建配置目录..."
mkdir -p ./config
chmod 777 ./config
echo "✅ 配置目录已创建: ./config"
echo ""

# 4. 启动容器
echo "🚀 4. 启动容器..."
docker run -d \
    -p 5000:5000 \
    --name $CONTAINER_NAME \
    -v $(pwd)/config:/app/config \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功"
else
    echo "❌ 容器启动失败"
    exit 1
fi
echo ""

# 5. 等待容器启动
echo "⏳ 5. 等待容器启动..."
echo "等待 10 秒..."
sleep 10
echo ""

# 6. 检查容器状态
echo "🔍 6. 检查容器状态..."
if docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "✅ 容器正在运行"
    docker ps -f name=$CONTAINER_NAME
else
    echo "❌ 容器未运行"
    echo ""
    echo "查看日志："
    echo "docker logs $CONTAINER_NAME"
    exit 1
fi
echo ""

# 7. 检查服务
echo "🌐 7. 检查服务..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo "✅ 服务正常运行 (HTTP $HTTP_CODE)"
else
    echo "⚠️  服务响应异常 (HTTP $HTTP_CODE)"
    echo ""
    echo "查看日志："
    echo "docker logs --tail 50 $CONTAINER_NAME"
fi
echo ""

# 8. 修复静态资源（如果需要）
echo "📁 8. 检查静态资源..."
if ! docker exec $CONTAINER_NAME sh -c "cd /app && test -L _next" 2>/dev/null; then
    echo "_next 软链接不存在，正在创建..."
    docker exec -it -u root $CONTAINER_NAME sh -c "cd /app && ln -sf .next _next"
    echo "✅ _next 软链接已创建"
    echo ""
    echo "重启容器..."
    docker restart $CONTAINER_NAME
    sleep 5
else
    TARGET=$(docker exec $CONTAINER_NAME sh -c "cd /app && readlink _next")
    echo "✅ _next 软链接存在，指向: $TARGET"
fi
echo ""

# 9. 显示日志
echo "📋 9. 显示最新日志..."
echo "================================"
docker logs --tail 20 $CONTAINER_NAME
echo "================================"
echo ""

# 10. 总结
echo "🎉 部署完成！"
echo ""
echo "📝 下一步："
echo ""
echo "1. 访问网站首页："
echo "   http://localhost:5000"
echo "   或"
echo "   http://mayiai.itlao5.com"
echo ""
echo "2. 配置数据库（必须）："
echo "   访问: http://mayiai.itlao5.com/settings"
echo "   填写 Supabase 配置信息"
echo ""
echo "3. 初始化数据库（如果需要）："
echo "   访问: http://mayiai.itlao5.com/admin/data-migration"
echo ""
echo "4. 运行部署检查："
echo "   chmod +x scripts/deploy-checklist.sh"
echo "   ./scripts/deploy-checklist.sh"
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
echo "  访问 http://mayiai.itlao5.com/settings"
echo ""
echo "================================"
echo ""
echo "✨ 祝你使用愉快！"
