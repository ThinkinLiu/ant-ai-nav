#!/bin/sh
# Docker 镜像更新脚本

set -e

echo "🔄 Docker 镜像更新"
echo "=================="
echo ""

# 检查是否有运行中的容器
if docker ps -q -f name=ant-ai-nav | grep -q .; then
    echo "🛑 停止旧容器..."
    docker stop ant-ai-nav
    echo "✅ 容器已停止"
    echo ""
fi

# 删除旧容器
if docker ps -a -q -f name=ant-ai-nav | grep -q .; then
    echo "🗑️  删除旧容器..."
    docker rm ant-ai-nav
    echo "✅ 容器已删除"
    echo ""
fi

# 删除旧镜像
if docker images -q ant-ai-nav:latest | grep -q .; then
    echo "🗑️  删除旧镜像..."
    docker rmi ant-ai-nav:latest
    echo "✅ 镜像已删除"
    echo ""
fi

echo "📦 准备加载新镜像..."
echo ""
echo "请执行以下步骤："
echo ""
echo "1. 确保代码已推送到 GitHub"
echo "2. 在 GitHub Actions 运行 'Build Docker Image' 工作流"
echo "3. 等待构建完成（约 8-15 分钟）"
echo "4. 下载 docker-image.tar.gz 到当前目录"
echo ""
read -p "镜像文件已下载？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 请先下载镜像文件"
    exit 1
fi

# 检查镜像文件是否存在
if [ ! -f "docker-image.tar.gz" ]; then
    echo "❌ 未找到 docker-image.tar.gz 文件"
    exit 1
fi

# 加载新镜像
echo "⏳ 加载新镜像（这可能需要几分钟）..."
docker load < docker-image.tar.gz

if [ $? -eq 0 ]; then
    echo "✅ 镜像加载成功"
    echo ""
else
    echo "❌ 镜像加载失败"
    exit 1
fi

# 显示镜像信息
echo "📦 镜像信息："
docker images ant-ai-nav:latest
echo ""

# 启动容器
echo "🚀 启动容器..."
docker run -d \
    -p 5000:5000 \
    --name ant-ai-nav \
    -v ./config:/app/config \
    --restart unless-stopped \
    ant-ai-nav:latest

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功"
    echo ""
else
    echo "❌ 容器启动失败"
    docker logs --tail 20 ant-ai-nav
    exit 1
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -I http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ 服务运行正常"
    echo ""
else
    echo "⚠️  服务可能未完全启动，请稍后检查"
    echo ""
fi

# 显示容器信息
echo "📋 容器信息："
docker ps -f name=ant-ai-nav
echo ""

echo "🎉 更新完成！"
echo ""
echo "📝 下一步："
echo "1. 访问 http://localhost:5000 检查网站"
echo "2. 访问 http://localhost:5000/settings 配置数据库（如需要）"
echo "3. 查看日志: docker logs -f ant-ai-nav"
echo ""
echo "💡 其他命令："
echo "   查看日志: docker logs -f ant-ai-nav"
echo "   进入容器: docker exec -it ant-ai-nav sh"
echo "   停止容器: docker stop ant-ai-nav"
echo "   重启容器: docker restart ant-ai-nav"
