#!/bin/sh
# API 500 错误诊断脚本

set -e

CONTAINER_NAME="ant-ai-nav"

echo "🔍 API 500 错误诊断工具"
echo "================================"
echo ""

# 1. 检查容器状态
echo "📦 1. 检查容器状态..."
if docker ps -f name=$CONTAINER_NAME | grep -q $CONTAINER_NAME; then
    echo "✅ 容器正在运行"
else
    echo "❌ 容器未运行"
    exit 1
fi
echo ""

# 2. 检查数据库配置
echo "⚙️  2. 检查数据库配置..."
if [ -f "./config/database.json" ]; then
    echo "✅ 数据库配置文件存在"
    echo ""
    echo "配置内容："
    cat ./config/database.json
    echo ""

    # 检查配置是否完整
    if grep -q "supabaseUrl" ./config/database.json && \
       grep -q "supabaseAnonKey" ./config/database.json; then
        echo "✅ 数据库配置已填写"
    else
        echo "⚠️  数据库配置未填写"
    fi
else
    echo "❌ 数据库配置文件不存在"
    echo ""
    echo "请访问 http://mayiai.itlao5.com/settings 配置数据库"
fi
echo ""

# 3. 测试 API 接口
echo "🌐 3. 测试 API 接口..."
echo "测试: curl http://localhost:5000/api/home"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/home 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API 正常 (HTTP 200)"
    echo ""
    echo "返回内容："
    curl -s http://localhost:5000/api/home | head -20
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ API 返回 500 (Internal Server Error)"
    echo ""
    echo "返回内容："
    curl -s http://localhost:5000/api/home
else
    echo "⚠️  API 返回异常 (HTTP $HTTP_CODE)"
fi
echo ""

# 4. 查看错误日志
echo "📋 4. 查看错误日志..."
echo "最近 50 行日志中的错误："
docker logs --tail 100 $CONTAINER_NAME 2>&1 | grep -iE "error|exception|failed" | tail -20 || echo "未发现错误"
echo ""

# 5. 检查 Supabase 连接
echo "🔗 5. 检查 Supabase 连接..."
if [ -f "./config/database.json" ]; then
    SUPABASE_URL=$(cat ./config/database.json | grep -o '"supabaseUrl":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$SUPABASE_URL" ]; then
        echo "Supabase URL: $SUPABASE_URL"
        echo ""
        echo "测试连接..."
        curl -I -s -o /dev/null -w "%{http_code}" --max-time 5 "$SUPABASE_URL" 2>/dev/null || echo "连接失败"
    else
        echo "⚠️  未找到 Supabase URL"
    fi
else
    echo "⚠️  数据库未配置"
fi
echo ""

# 6. 诊断结论
echo "================================"
echo "🎯 诊断结论："
echo ""

if [ ! -f "./config/database.json" ]; then
    echo "❌ 问题：数据库未配置"
    echo ""
    echo "📋 解决方案："
    echo "   1. 访问 http://mayiai.itlao5.com/settings"
    echo "   2. 填写 Supabase 配置信息"
    echo "   3. 保存配置"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ 问题：API 返回 500 错误"
    echo ""
    echo "📋 可能原因："
    echo "   1. 数据库表未初始化"
    echo "   2. Supabase 连接失败"
    echo "   3. 数据库查询出错"
    echo ""
    echo "📋 解决方案："
    echo "   1. 访问 http://mayiai.itlao5.com/admin/data-migration"
    echo "   2. 执行数据库初始化"
    echo "   3. 查看详细日志: docker logs $CONTAINER_NAME"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API 正常工作"
    echo ""
    echo "📋 如果页面仍有问题："
    echo "   1. 清除浏览器缓存"
    echo "   2. 强制刷新页面 (Ctrl + Shift + R)"
fi
echo ""

echo "================================"
echo "📝 常用命令："
echo ""
echo "查看详细日志："
echo "  docker logs --tail 100 $CONTAINER_NAME"
echo ""
echo "实时查看日志："
echo "  docker logs -f $CONTAINER_NAME"
echo ""
echo "配置数据库："
echo "  访问 http://mayiai.itlao5.com/settings"
echo ""
echo "初始化数据库："
echo "  访问 http://mayiai.itlao5.com/admin/data-migration"
echo ""
