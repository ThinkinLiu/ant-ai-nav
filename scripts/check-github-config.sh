#!/bin/sh
# GitHub 仓库配置检查脚本

echo "🔍 检查 GitHub 仓库配置..."
echo ""

# 1. 检查当前 Git 配置
echo "📋 当前 Git 配置："
git config --list | grep -E "(remote\.|user\.|branch\.)" || echo "  未找到 Git 配置"
echo ""

# 2. 检查远程仓库
echo "📡 远程仓库配置："
git remote -v || echo "  未配置远程仓库"
echo ""

# 3. 检查当前分支
echo "🌿 当前分支："
git branch --show-current || echo "  不在任何分支上"
echo ""

# 4. 检查所有分支
echo "🌳 所有分支："
git branch -a || echo "  无分支"
echo ""

# 5. 检查 GitHub Actions 配置
echo "⚙️  GitHub Actions 配置："
if [ -f ".github/workflows/build-static.yml" ]; then
    echo "  ✅ build-static.yml 存在"
    echo "  预期仓库: ThinkinLiu/ant-ai-nav"
    echo "  预期分支: $(grep 'default:' .github/workflows/build-static.yml | head -1 | cut -d"'" -f2 || echo 'main')"
else
    echo "  ❌ build-static.yml 不存在"
fi
echo ""

# 6. 提供修复建议
echo "💡 修复建议："
echo "  1. 确认 GitHub 仓库名称是否为 ThinkinLiu/ant-ai-nav"
echo "  2. 确认默认分支是 main 还是 master"
echo "  3. 如果需要配置远程仓库，运行："
echo "     git remote add origin https://github.com/ThinkinLiu/ant-ai-nav.git"
echo "  4. 如果分支名称不对，修改 workflow 中的默认分支"
echo ""

# 7. 检查是否在沙箱环境中
if [ -n "$COZE_WORKSPACE_PATH" ]; then
    echo "📝 当前在沙箱环境中"
    echo "  工作目录: $COZE_WORKSPACE_PATH"
    echo "  ⚠️  沙箱环境通常不配置 Git 远程仓库"
    echo "  如需推送到 GitHub，请手动配置"
fi
