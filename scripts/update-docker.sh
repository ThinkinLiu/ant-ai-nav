#!/bin/bash

# 蚂蚁AI导航 - Docker 部署更新脚本
# 使用方法: ./scripts/update-docker.sh

set -e

echo "=========================================="
echo "蚂蚁AI导航 - Docker 更新脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 检查容器是否在运行
if docker-compose ps | grep -q "Up"; then
    echo "📦 检测到容器正在运行..."
    RUNNING=true
else
    echo "📦 未检测到运行中的容器"
    RUNNING=false
fi

if [ "$RUNNING" = true ]; then
    echo ""
    echo "⏹️  停止当前容器..."
    docker-compose down
fi

echo ""
echo "🗑️  清理旧镜像（可选）..."
read -p "是否删除旧镜像？这将释放磁盘空间 (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if docker images | grep -q "ant-ai-nav"; then
        docker rmi ant-ai-nav:latest || true
        echo "✅ 旧镜像已删除"
    else
        echo "ℹ️  未找到旧镜像"
    fi
fi

echo ""
echo "📥 加载新镜像..."
if [ ! -f "ant-ai-nav.tar.gz" ]; then
    echo "❌ 错误: 未找到 ant-ai-nav.tar.gz 文件"
    echo ""
    echo "请先从 GitHub Actions 下载构建产物："
    echo "1. 访问 https://github.com/ThinkinLiu/ant-ai-nav/actions"
    echo "2. 点击 'Build and Export Docker Image' 工作流"
    echo "3. 点击 'Run workflow' 触发构建"
    echo "4. 等待构建完成后下载 'docker-image' 产物"
    echo "5. 将下载的文件重命名为 ant-ai-nav.tar.gz"
    echo "6. 将文件上传到服务器"
    exit 1
fi

docker load < ant-ai-nav.tar.gz
echo "✅ 镜像加载成功"

echo ""
echo "🚀 启动容器..."
docker-compose up -d

echo ""
echo "=========================================="
echo "等待服务启动..."
echo "=========================================="
sleep 5

echo ""
echo "📊 检查容器状态..."
docker-compose ps

echo ""
echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo ""
echo "访问地址: http://localhost:5000"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose stop"
echo "重启服务: docker-compose restart"
echo ""
