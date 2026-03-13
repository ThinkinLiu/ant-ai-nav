#!/bin/bash

# ============================================
# 蚂蚁AI导航 - 数据库初始化脚本
# ============================================
# 使用方法:
#   chmod +x init.sh
#   ./init.sh <数据库连接字符串>
# 
# 示例:
#   ./init.sh postgresql://username:password@localhost:5432/ant_ai_nav
# ============================================

set -e  # 遇到错误立即退出

# 检查参数
if [ $# -eq 0 ]; then
    echo "错误: 缺少数据库连接字符串"
    echo "使用方法: ./init.sh <数据库连接字符串>"
    echo "示例: ./init.sh postgresql://username:password@localhost:5432/ant_ai_nav"
    exit 1
fi

DB_URL=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "蚂蚁AI导航 - 数据库初始化"
echo "=========================================="
echo "数据库连接: ${DB_URL%%@*}@***"
echo "脚本目录: $SCRIPT_DIR"
echo "=========================================="
echo ""

# 函数: 执行SQL文件
execute_sql_file() {
    local file=$1
    local filename=$(basename "$file")
    
    echo "执行: $filename"
    
    if psql "$DB_URL" -f "$file" > /dev/null 2>&1; then
        echo "  ✅ 成功"
    else
        echo "  ❌ 失败"
        exit 1
    fi
}

# 1. 创建表结构
echo "步骤 1/14: 创建表结构..."
execute_sql_file "$SCRIPT_DIR/00_schema.sql"

# 2. 导入基础数据
echo ""
echo "步骤 2/14: 导入分类数据..."
execute_sql_file "$SCRIPT_DIR/01_categories.sql"

echo "步骤 3/14: 导入标签数据..."
execute_sql_file "$SCRIPT_DIR/02_tags.sql"

echo "步骤 4/14: 导入用户数据..."
execute_sql_file "$SCRIPT_DIR/04_users.sql"

# 3. 导入AI工具数据
echo ""
echo "步骤 5/14: 导入AI工具数据..."
execute_sql_file "$SCRIPT_DIR/05_ai_tools.sql"

echo "步骤 6/14: 导入AI名人堂数据..."
execute_sql_file "$SCRIPT_DIR/03_ai_hall_of_fame.sql"

echo "步骤 7/14: 导入AI大事纪数据..."
execute_sql_file "$SCRIPT_DIR/06_ai_timeline.sql"

echo "步骤 8/14: 导入工具标签关联数据..."
execute_sql_file "$SCRIPT_DIR/07_tool_tags.sql"

# 4. 导入交互数据
echo ""
echo "步骤 9/14: 导入评论数据..."
execute_sql_file "$SCRIPT_DIR/08_comments.sql"

# 5. 导入审核数据
echo ""
echo "步骤 10/14: 导入发布者申请数据..."
execute_sql_file "$SCRIPT_DIR/09_publisher_applications.sql"

# 6. 导入排行榜数据
echo ""
echo "步骤 11/14: 导入排行榜数据..."
execute_sql_file "$SCRIPT_DIR/10_ai_tool_rankings.sql"

echo "步骤 12/14: 导入排行榜更新日志..."
execute_sql_file "$SCRIPT_DIR/11_ranking_update_log.sql"

# 7. 导入系统设置
echo ""
echo "步骤 13/14: 导入SEO设置..."
execute_sql_file "$SCRIPT_DIR/12_seo_settings.sql"

echo "步骤 13/14: 导入网站设置..."
execute_sql_file "$SCRIPT_DIR/13_site_settings.sql"

echo "步骤 14/14: 导入流量数据源配置..."
execute_sql_file "$SCRIPT_DIR/14_traffic_data_sources.sql"

# 完成
echo ""
echo "=========================================="
echo "✅ 数据库初始化完成！"
echo "=========================================="
echo ""
echo "数据统计:"
psql "$DB_URL" -c "
SELECT 
    'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL SELECT 'tags', COUNT(*) FROM tags
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'ai_tools', COUNT(*) FROM ai_tools
UNION ALL SELECT 'ai_hall_of_fame', COUNT(*) FROM ai_hall_of_fame
UNION ALL SELECT 'ai_timeline', COUNT(*) FROM ai_timeline
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'ai_tool_rankings', COUNT(*) FROM ai_tool_rankings
ORDER BY table_name;
" 2>/dev/null

echo ""
echo "初始化完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
