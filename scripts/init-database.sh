#!/bin/bash
# 数据库初始化脚本

set -e

echo "🗄️  蚂蚁AI导航 - 数据库初始化脚本"
echo "================================"
echo ""

# 检查数据库配置文件
if [ ! -f "./config/database.json" ]; then
    echo "❌ 数据库配置文件不存在"
    echo ""
    echo "请先配置数据库："
    echo "1. 访问 http://localhost:5000/settings"
    echo "2. 填写 Supabase 配置信息"
    echo "3. 保存配置"
    exit 1
fi

echo "✅ 数据库配置文件存在"
echo ""

# 读取配置
SUPABASE_URL=$(cat ./config/database.json | grep -o '"supabaseUrl":"[^"]*"' | cut -d'"' -f4)
SUPABASE_ANON_KEY=$(cat ./config/database.json | grep -o '"supabaseAnonKey":"[^"]*"' | cut -d'"' -f4)
SUPABASE_SERVICE_ROLE_KEY=$(cat ./config/database.json | grep -o '"supabaseServiceRoleKey":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 数据库配置不完整"
    echo ""
    echo "请检查配置文件："
    echo "cat ./config/database.json"
    exit 1
fi

echo "数据库配置："
echo "  URL: $SUPABASE_URL"
echo ""

# 检查 SQL 文件
SQL_DIR="database"
if [ ! -d "$SQL_DIR" ]; then
    echo "❌ SQL 文件目录不存在: $SQL_DIR"
    exit 1
fi

echo "✅ SQL 文件目录存在"
echo ""

# 列出要执行的 SQL 文件
echo "📄 将执行以下 SQL 文件："
ls -1 $SQL_DIR/*.sql | sort
echo ""

# 询问是否继续
read -p "是否继续执行？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 0
fi

echo ""
echo "🚀 开始初始化数据库..."
echo ""

# 执行 SQL 文件
for sql_file in $(ls -1 $SQL_DIR/*.sql | sort); do
    echo "执行: $sql_file"
    curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$(cat $sql_file | tr '\n' ' ' | sed 's/"/\\"/g')\"}" \
        2>/dev/null || echo "⚠️  执行失败（可能已存在）"
    echo ""
done

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "📝 下一步："
echo "1. 访问 http://localhost:5000"
echo "2. 检查页面是否正常显示"
echo ""
