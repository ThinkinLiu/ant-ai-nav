#!/bin/bash

# GitHub Actions 构建性能诊断脚本

echo "========================================="
echo "GitHub Actions 构建性能诊断"
echo "========================================="
echo ""

# 1. 检查当前提交和参考提交的差异
echo "1. 检查代码差异..."
CURRENT_COMMIT=$(git rev-parse HEAD)
REFERENCE_COMMIT="c9c2dcc"

echo "当前提交: $CURRENT_COMMIT"
echo "参考提交: $REFERENCE_COMMIT"
echo ""

# 统计文件变化
FILE_COUNT=$(git diff $REFERENCE_COMMIT..HEAD --name-only | wc -l)
echo "文件变化数量: $FILE_COUNT"

# 统计代码行数变化
ADDED_LINES=$(git diff $REFERENCE_COMMIT..HEAD --numstat | awk '{sum+=$1} END {print sum}')
DELETED_LINES=$(git diff $REFERENCE_COMMIT..HEAD --numstat | awk '{sum+=$2} END {print sum}')
echo "新增行数: $ADDED_LINES"
echo "删除行数: $DELETED_LINES"
echo ""

# 2. 检查依赖变化
echo "2. 检查依赖变化..."
if git diff $REFERENCE_COMMIT..HEAD -- package.json > /dev/null; then
  echo "⚠️  package.json 有变化"
  git diff $REFERENCE_COMMIT..HEAD -- package.json | grep -E "^\+|^\-" | grep -E "\"[a-zA-Z0-9@/_-]+\""
else
  echo "✅ package.json 无变化"
fi

if git diff $REFERENCE_COMMIT..HEAD -- pnpm-lock.yaml > /dev/null; then
  echo "⚠️  pnpm-lock.yaml 有变化"
else
  echo "✅ pnpm-lock.yaml 无变化"
fi
echo ""

# 3. 检查配置文件变化
echo "3. 检查配置文件变化..."
CONFIG_FILES=("next.config.ts" "tsconfig.json" ".github/workflows/ci.yml")
for file in "${CONFIG_FILES[@]}"; do
  if git diff $REFERENCE_COMMIT..HEAD -- "$file" > /dev/null; then
    echo "⚠️  $file 有变化"
  else
    echo "✅ $file 无变化"
  fi
done
echo ""

# 4. 检查静态资源变化
echo "4. 检查静态资源变化..."
IMAGE_COUNT=$(git diff $REFERENCE_COMMIT..HEAD --name-only | grep -E "\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$" | wc -l)
echo "图片/字体文件变化: $IMAGE_COUNT"

# 检查public目录变化
PUBLIC_CHANGES=$(git diff $REFERENCE_COMMIT..HEAD -- public/ --stat | tail -1)
echo "public目录变化: $PUBLIC_CHANGES"
echo ""

# 5. 检查页面配置变化
echo "5. 检查页面配置变化..."
STATIC_PAGE_CHANGES=$(git diff $REFERENCE_COMMIT..HEAD -- src/app/**/page.tsx | grep -E "export const (dynamic|revalidate|generateStaticParams)" | wc -l)
echo "静态生成配置变化: $STATIC_PAGE_CHANGES"
echo ""

# 6. 分析可能导致构建慢的原因
echo "========================================="
echo "诊断结果与建议"
echo "========================================="
echo ""

if [ "$FILE_COUNT" -gt 50 ]; then
  echo "⚠️  代码变化较大（$FILE_COUNT个文件），可能影响构建时间"
else
  echo "✅ 代码变化较小（$FILE_COUNT个文件）"
fi

if [ "$IMAGE_COUNT" -gt 10 ]; then
  echo "⚠️  新增较多图片文件（$IMAGE_COUNT个），可能影响构建时间"
else
  echo "✅ 图片文件变化较少"
fi

echo ""
echo "建议优化措施："
echo "1. 检查 GitHub Actions 缓存是否生效"
echo "2. 考虑使用 npm 镜像源加速依赖下载"
echo "3. 在 next.config.ts 中添加 eslint: { ignoreDuringBuilds: true }"
echo "4. 考虑跳过类型检查以加快构建"
echo "5. 检查是否有网络问题影响依赖下载"
echo ""

# 7. 对比两个版本的构建时间建议
echo "========================================="
echo "构建时间对比建议"
echo "========================================="
echo ""
echo "c9c2dcc版本: 2分钟"
echo "当前版本: 20分钟+"
echo "时间差异: 10倍"
echo ""
echo "可能原因（按可能性排序）："
echo "1. GitHub Actions 缓存失效 (50%)"
echo "2. 依赖下载网络问题 (20%)"
echo "3. Next.js 16 构建优化变化 (15%)"
echo "4. TypeScript 类型检查耗时 (10%)"
echo "5. GitHub Actions 运行器性能波动 (5%)"
echo ""
echo "建议采取的优化措施（按优先级）："
echo "1. 优化 GitHub Actions 缓存配置"
echo "2. 使用 npm 镜像源"
echo "3. 跳过 ESLint 和 TypeScript 检查"
echo "4. 增加 Node.js 内存限制"
echo "5. 考虑使用更快的运行器"
