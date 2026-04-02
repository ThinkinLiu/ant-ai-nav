#!/bin/bash
# Coze 测试环境 - 数据库初始化脚本

set -e

echo "🗄️  Coze 测试环境 - 数据库初始化"
echo "================================"
echo ""

# 从环境变量读取配置
SUPABASE_URL="${COZE_SUPABASE_URL}"
SUPABASE_SERVICE_ROLE_KEY="${COZE_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 数据库配置未找到"
    echo ""
    echo "请检查环境变量："
    echo "  COZE_SUPABASE_URL"
    echo "  COZE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ 数据库配置已找到"
echo "  URL: $SUPABASE_URL"
echo ""

# 检查 SQL 文件目录
SQL_DIR="${COZE_WORKSPACE_PATH}/database"
if [ ! -d "$SQL_DIR" ]; then
    echo "❌ SQL 文件目录不存在: $SQL_DIR"
    exit 1
fi

echo "✅ SQL 文件目录存在: $SQL_DIR"
echo ""

# 列出要执行的 SQL 文件
echo "📄 将执行以下 SQL 文件："
ls -1 "$SQL_DIR"/*.sql | sort
echo ""

# 执行 SQL 文件
echo "🚀 开始初始化数据库..."
echo ""

cd "$SQL_DIR"

for sql_file in $(ls -1 *.sql | sort); do
    echo "执行: $sql_file"

    # 读取 SQL 文件内容
    sql_content=$(cat "$sql_file")

    # 执行 SQL
    response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$(echo "$sql_content" | tr '\n' ' ' | sed 's/"/\\"/g')\"}")

    if [ $? -eq 0 ]; then
        echo "✅ 执行成功"
    else
        echo "⚠️  执行失败（可能表已存在或权限不足）"
        echo "  响应: $response"
    fi
    echo ""
done

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "📝 下一步："
echo "1. 刷新浏览器页面"
echo "2. 检查页面是否正常显示"
echo ""
