#!/bin/bash

# Docker 部署验证清单

echo "========================================="
echo "Docker 部署验证清单"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查项
checks=()
errors=()

# 1. 检查 Dockerfile
echo "📋 1. 检查 Dockerfile 配置"
echo "----------------------------"

if [ -f "Dockerfile" ]; then
  echo "  ✅ Dockerfile 存在"

  # 检查关键配置
  if grep -q "output: 'standalone'" next.config.ts 2>/dev/null; then
    echo "  ✅ next.config.ts 启用了 standalone 模式"
  else
    echo "  ${RED}❌ next.config.ts 未启用 standalone 模式${NC}"
    errors+=("next.config.ts 缺少 output: 'standalone' 配置")
  fi

  # 检查 Dockerfile 中的复制命令
  if grep -q "COPY --from=builder /app/.next/standalone" Dockerfile; then
    echo "  ✅ Dockerfile 包含 standalone 复制命令"
  else
    echo "  ${RED}❌ Dockerfile 缺少 standalone 复制命令${NC}"
    errors+=("Dockerfile 缺少正确的复制命令")
  fi

  if grep -q "COPY --from=builder /app/.next/static" Dockerfile; then
    echo "  ✅ Dockerfile 包含静态资源复制命令"
  else
    echo "  ${RED}❌ Dockerfile 缺少静态资源复制命令${NC}"
    errors+=("Dockerfile 缺少静态资源复制命令")
  fi

else
  echo "  ${RED}❌ Dockerfile 不存在${NC}"
  errors+=("Dockerfile 不存在")
fi
echo ""

# 2. 检查 start.sh 脚本
echo "📋 2. 检查 start.sh 脚本"
echo "----------------------------"

if [ -f "scripts/start.sh" ]; then
  echo "  ✅ scripts/start.sh 存在"

  if grep -q "server.js" scripts/start.sh; then
    echo "  ✅ start.sh 支持 standalone 模式"
  else
    echo "  ${YELLOW}⚠️  start.sh 可能不支持 standalone 模式${NC}"
    errors+=("start.sh 需要更新以支持 standalone 模式")
  fi

  if grep -x "exec node server.js" scripts/start.sh; then
    echo "  ✅ start.sh 包含正确的启动命令"
  else
    echo "  ${YELLOW}⚠️  start.sh 的启动命令可能不正确${NC}"
  fi

else
  echo "  ${RED}❌ scripts/start.sh 不存在${NC}"
  errors+=("scripts/start.sh 不存在")
fi
echo ""

# 3. 检查环境变量
echo "📋 3. 检查环境变量配置"
echo "----------------------------"

if [ -f ".env.local" ] || [ -f ".env.build" ]; then
  echo "  ✅ 环境变量文件存在"

  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null || \
     grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.build 2>/dev/null; then
    echo "  ✅ SUPABASE_URL 已配置"
  else
    echo "  ${YELLOW}⚠️  SUPABASE_URL 可能未配置${NC}"
  fi

else
  echo "  ${YELLOW}⚠️  环境变量文件不存在（.env.local 或 .env.build）${NC}"
fi
echo ""

# 4. 检查 package.json
echo "📋 4. 检查 package.json"
echo "----------------------------"

if [ -f "package.json" ]; then
  echo "  ✅ package.json 存在"

  if grep -q "\"build\":" package.json; then
    echo "  ✅ 包含构建脚本"
  else
    echo "  ${RED}❌ 缺少构建脚本${NC}"
    errors+=("package.json 缺少 build 脚本")
  fi

  if grep -q "\"start\":" package.json; then
    echo "  ✅ 包含启动脚本"
  else
    echo "  ${RED}❌ 缺少启动脚本${NC}"
    errors+=("package.json 缺少 start 脚本")
  fi

else
  echo "  ${RED}❌ package.json 不存在${NC}"
  errors+=("package.json 不存在")
fi
echo ""

# 5. 检查 Docker 环境
echo "📋 5. 检查 Docker 环境"
echo "----------------------------"

if command -v docker &> /dev/null; then
  echo "  ✅ Docker 已安装"

  if docker info &> /dev/null; then
    echo "  ✅ Docker 运行中"
  else
    echo "  ${YELLOW}⚠️  Docker 未运行或权限不足${NC}"
    errors+=("Docker 未运行或权限不足")
  fi
else
  echo "  ${YELLOW}⚠️  Docker 未安装（非 Docker 环境）${NC}"
fi
echo ""

# 总结
echo "========================================="
echo "验证总结"
echo "========================================="

if [ ${#errors[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ 所有检查通过！配置正确。${NC}"
  echo ""
  echo "下一步："
  echo "  1. 构建 Docker 镜像：docker build -t ant-ai-nav:latest ."
  echo "  2. 运行容器：docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest"
  echo "  3. 验证：docker exec -it ant-ai-nav bash /app/scripts/check-static-assets.sh"
else
  echo -e "${RED}❌ 发现 ${#errors[@]} 个问题需要修复：${NC}"
  echo ""
  for i in "${!errors[@]}"; do
    echo "  $((i+1)). ${errors[$i]}"
  done
  echo ""
  echo "请修复以上问题后再进行部署。"
fi

echo ""
echo "========================================="
