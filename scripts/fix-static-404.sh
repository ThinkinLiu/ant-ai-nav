#!/bin/sh
# 快速修复静态资源 404 问题

set -e

echo "🔧 静态资源 404 快速修复"
echo "======================"
echo ""

# 检查容器状态
if docker ps -q -f name=ant-ai-nav | grep -q .; then
    echo "⚠️  检测到运行中的容器"
    echo ""
    read -p "是否停止并删除旧容器？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 停止并删除旧容器..."
        docker stop ant-ai-nav
        docker rm ant-ai-nav
    else
        echo "❌ 请先手动停止容器再运行此脚本"
        exit 1
    fi
fi

# 检查镜像
if docker images -q ant-ai-nav:latest | grep -q .; then
    echo "🗑️  删除旧镜像..."
    docker rmi ant-ai-nav:latest
fi

# 提示加载新镜像
echo ""
echo "📦 准备加载新镜像..."
echo ""
echo "请执行以下步骤："
echo ""
echo "1. 从 GitHub Actions 下载最新的 docker-image.tar.gz"
echo "2. 运行以下命令加载镜像："
echo "   docker load < docker-image.tar.gz"
echo ""
read -p "镜像已加载完成？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 请先加载镜像"
    exit 1
fi

# 验证镜像
echo "✅ 验证镜像..."
if ! docker images -q ant-ai-nav:latest | grep -q .; then
    echo "❌ 镜像加载失败"
    exit 1
fi

# 运行调试检查
echo ""
echo "🔍 检查镜像内容..."
echo ""

# 创建临时容器检查
docker run --rm -it ant-ai-nav:latest sh -c "
    echo '=== 根目录 ===' && \
    ls -la /app && \
    echo '' && \
    echo '=== .next/static 检查 ===' && \
    if [ -d '/app/.next/static' ]; then \
        echo '✅ .next/static 存在' && \
        ls -la /app/.next/static | head -10; \
    else \
        echo '❌ .next/static 不存在'; \
        exit 1; \
    fi && \
    echo '' && \
    echo '=== public 检查 ===' && \
    if [ -d '/app/public' ]; then \
        echo '✅ public 存在' && \
        ls -la /app/public | head -10; \
    else \
        echo '❌ public 不存在'; \
        exit 1; \
    fi && \
    echo '' && \
    echo '=== server.js 检查 ===' && \
    if [ -f '/app/server.js' ]; then \
        echo '✅ server.js 存在'; \
    else \
        echo '❌ server.js 不存在'; \
        exit 1; \
    fi
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 镜像验证通过"
else
    echo ""
    echo "❌ 镜像验证失败"
    echo ""
    echo "可能的原因："
    echo "1. Dockerfile 配置不正确"
    echo "2. 构建时静态资源未生成"
    echo "3. 需要重新构建镜像"
    echo ""
    echo "建议："
    echo "1. 检查 Dockerfile 配置"
    echo "2. 使用 GitHub Actions 重新构建"
    echo "3. 查看 docs/docker-static-404-fix.md 了解详情"
    exit 1
fi

# 启动容器
echo ""
echo "🚀 启动容器..."
docker run -d \
    -p 5000:5000 \
    --name ant-ai-nav \
    -v ./config:/app/config \
    --restart unless-stopped \
    ant-ai-nav:latest

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务
echo ""
echo "🔍 检查服务状态..."
echo ""

if curl -I http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ 服务启动成功"
    echo ""
    echo "🎉 修复完成！"
    echo ""
    echo "📝 下一步："
    echo "1. 访问 http://localhost:5000 检查页面"
    echo "2. 按下 F12 打开开发者工具"
    echo "3. 查看 Network 标签，确认静态资源是否正常加载"
    echo "4. 访问 http://localhost:5000/settings 配置数据库"
    echo ""
    echo "📚 相关文档："
    echo "- docs/docker-static-404-fix.md - 静态资源 404 修复指南"
    echo "- docs/deployment-quick-reference.md - 部署快速参考"
else
    echo "❌ 服务启动失败"
    echo ""
    echo "查看日志："
    docker logs --tail 20 ant-ai-nav
    exit 1
fi
