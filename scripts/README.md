# 数据库管理脚本

本目录包含数据库管理和维护相关的脚本。

## 📜 脚本列表

### export-database.ts
**用途**: 从Supabase数据库导出所有表数据到JSON文件

**使用方法**:
```bash
npx tsx scripts/export-database.ts
```

**输出**:
- `database/export-data.json` - 包含所有表数据的JSON文件

**说明**:
- 自动连接到Supabase数据库
- 导出所有定义的表数据
- 包含错误处理和进度提示

### generate-sql-inserts.ts
**用途**: 将JSON数据转换为SQL INSERT语句

**使用方法**:
```bash
npx tsx scripts/generate-sql-inserts.ts
```

**前置条件**:
- 需要先运行 `export-database.ts` 生成JSON文件

**输出**:
- `database/01_categories.sql` - 分类数据
- `database/02_tags.sql` - 标签数据
- `database/03_ai_hall_of_fame.sql` - AI名人堂数据
- `database/04_users.sql` - 用户数据
- `database/05_ai_tools.sql` - AI工具数据
- `database/06_ai_timeline.sql` - AI大事纪数据
- `database/07_tool_tags.sql` - 工具标签关联
- `database/08_comments.sql` - 评论数据
- `database/09_publisher_applications.sql` - 发布者申请
- `database/10_ai_tool_rankings.sql` - 排行榜数据
- `database/11_ranking_update_log.sql` - 排行榜日志
- `database/12_seo_settings.sql` - SEO设置
- `database/13_site_settings.sql` - 网站设置
- `database/14_traffic_data_sources.sql` - 流量数据源

**说明**:
- 自动处理SQL特殊字符转义
- 支持PostgreSQL数组类型
- 支持JSONB类型转换
- 生成带注释的SQL文件

## 🔄 完整工作流程

### 从数据库导出并生成SQL文件

```bash
# 1. 导出数据到JSON
npx tsx scripts/export-database.ts

# 2. 生成SQL插入语句
npx tsx scripts/generate-sql-inserts.ts
```

### 初始化新数据库

```bash
# Linux/Mac
cd database
./init.sh postgresql://username:password@localhost:5432/database_name

# Windows
cd database
init.bat postgresql://username:password@localhost:5432/database_name
```

## ⚙️ 配置要求

### 环境变量

确保以下环境变量已设置（在 `.env.local` 文件中）:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 依赖包

- `@supabase/supabase-js` - Supabase客户端
- `tsx` - TypeScript执行器

## 📝 维护说明

### 添加新表

1. 在 `src/storage/database/shared/schema.ts` 中定义新表
2. 在 `export-database.ts` 的 `tables` 数组中添加表名
3. 运行导出脚本

### 修改表结构

1. 更新 `schema.ts` 中的表定义
2. 手动更新 `database/00_schema.sql`
3. 重新导出数据

## 🔧 故障排除

### 问题: 导出失败，提示权限错误
**解决**: 检查Supabase的RLS策略，确保匿名密钥有读取权限

### 问题: 生成的SQL无法执行
**解决**: 检查数据中是否包含特殊字符，脚本已处理大部分情况

### 问题: JSON文件过大
**解决**: 可以分表导出，修改 `export-database.ts` 中的 `tables` 数组

## 📚 相关文档

- [数据库结构说明](../database/README.md)
- [数据库导出报告](../database/SUMMARY.md)
- [Supabase文档](https://supabase.com/docs)
