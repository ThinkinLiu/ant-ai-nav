#!/bin/sh
# 快速部署脚本 - 帮助将代码推送到 GitHub

set -e

echo "🚀 蚂蚁AI导航 - 快速部署脚本"
echo "================================"
echo ""

# 检查 Git 是否初始化
if [ ! -d .git ]; then
    echo "❌ Git 未初始化，请先初始化 Git"
    echo "   运行: git init"
    exit 1
fi

# 检查是否已配置远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "📡 未配置远程仓库"
    echo ""
    read -p "请输入你的 GitHub 用户名: " GITHUB_USERNAME

    if [ -z "$GITHUB_USERNAME" ]; then
        echo "❌ 用户名不能为空"
        exit 1
    fi

    REPO_URL="https://github.com/$GITHUB_USERNAME/ant-ai-nav.git"
    echo "   将配置远程仓库: $REPO_URL"
    git remote add origin "$REPO_URL"

    echo ""
    echo "💡 提示: 推送时需要配置 Git 认证"
    echo "   方法 1: 使用 Token - git remote set-url origin https://TOKEN@github.com/$GITHUB_USERNAME/ant-ai-nav.git"
    echo "   方法 2: 使用 SSH - git remote set-url origin git@github.com:$GITHUB_USERNAME/ant-ai-nav.git"
    echo ""
fi

# 显示当前状态
echo "📋 当前 Git 状态:"
git status --short || echo "   (无改动)"
echo ""

# 显示远程仓库
echo "🌐 远程仓库:"
git remote -v || echo "   (无远程仓库)"
echo ""

# 显示当前分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "🌿 当前分支: $CURRENT_BRANCH"
echo ""

# 询问是否继续
read -p "是否提交并推送代码到 GitHub? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 0
fi

# 添加所有文件
echo "📦 添加文件..."
git add .

# 检查是否有改动
if git diff --cached --quiet; then
    echo "✅ 没有需要提交的改动"
    exit 0
fi

# 提交
echo "💾 提交代码..."
git commit -m "feat: Update AI navigation platform $(date +%Y-%m-%d)"

# 推送
echo "📤 推送到 GitHub..."
if git push -u origin "$CURRENT_BRANCH" 2>&1; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🎉 下一步 - 选择构建方式："
    echo ""
    echo "   方案 A: 使用 Build Docker Image（推荐 - 最简单）"
    echo "   1. 访问 GitHub Actions: https://github.com/$(git remote get-url origin | sed 's|.*github.com/||' | sed 's|\.git$||')/actions"
    echo "   2. 运行 'Build Docker Image' 工作流"
    echo "   3. 下载构建产物 docker-image.tar.gz"
    echo "   4. 在服务器上执行: docker load < docker-image.tar.gz"
    echo "   5. 运行容器: docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest"
    echo ""
    echo "   方案 B: 使用 Build Static Export（灵活 - 文件小）"
    echo "   1. 访问 GitHub Actions: https://github.com/$(git remote get-url origin | sed 's|.*github.com/||' | sed 's|\.git$||')/actions"
    echo "   2. 运行 'Build Static Export' 工作流"
    echo "   3. 下载构建产物 static-export.tar.gz"
    echo "   4. 在服务器上解压: tar -xzf static-export.tar.gz"
    echo "   5. 构建镜像: docker build -t ant-ai-nav:latest ."
    echo "   6. 运行容器: docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest"
    echo ""
    echo "📚 详细指南: docs/github-workflows-comparison.md"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "💡 可能的原因:"
    echo "   1. 未配置 Git 认证"
    echo "   2. 远程仓库不存在"
    echo "   3. 权限不足"
    echo ""
    echo "🔧 解决方法:"
    echo "   1. 使用 Token: git remote set-url origin https://YOUR_TOKEN@github.com/USER/ant-ai-nav.git"
    echo "   2. 使用 SSH: git remote set-url origin git@github.com:USER/ant-ai-nav.git"
    echo "   3. 确认仓库在 GitHub 上已创建"
    exit 1
fi
