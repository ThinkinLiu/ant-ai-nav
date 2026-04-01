#!/bin/sh
# Docker 构建测试脚本

set -e

echo "🐳 Docker 构建测试"
echo "=================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "✅ Docker 运行正常"
echo ""

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker rmi ant-ai-nav:latest 2>/dev/null || true
echo ""

# 构建镜像
echo "🔨 开始构建镜像..."
echo ""
docker build -t ant-ai-nav:latest . 2>&1 | tee /tmp/docker-build.log

# 检查构建结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功！"
    echo ""
    echo "📦 镜像信息："
    docker images ant-ai-nav:latest
    echo ""
    echo "🎉 下一步："
    echo "   1. 运行容器: docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest"
    echo "   2. 查看日志: docker logs -f ant-ai-nav"
    echo "   3. 访问页面: http://localhost:5000"
else
    echo ""
    echo "❌ 构建失败！"
    echo ""
    echo "📋 错误日志："
    tail -100 /tmp/docker-build.log
    exit 1
fi
