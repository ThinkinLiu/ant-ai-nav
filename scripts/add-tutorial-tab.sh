#!/bin/bash

# 添加热门教程Tab到首页
# 使用方法：bash scripts/add-tutorial-tab.sh

API_URL="${API_URL:-http://localhost:5000}"
ENDPOINT="/api/admin/add-tutorial-tab"

echo "正在添加热门教程Tab..."
echo "API地址: $API_URL"

# 调用API
curl -X POST "${API_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "完成！"
echo "请刷新首页查看热门教程Tab"
