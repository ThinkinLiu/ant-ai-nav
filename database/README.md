# 数据库初始化脚本

本目录包含蚂蚁AI导航项目的完整数据库结构和数据初始化脚本。

## 📁 文件说明

### 数据库结构
- **00_schema.sql** - 数据库表结构定义，包含所有表的CREATE语句、索引、约束和触发器

### 基础数据
- **01_categories.sql** - 分类数据（8条记录）
- **02_tags.sql** - 标签数据（4条记录）
- **04_users.sql** - 用户数据（2条记录）

### AI工具数据
- **05_ai_tools.sql** - AI工具数据（1000条记录）
- **07_tool_tags.sql** - 工具标签关联数据（5条记录）

### AI名人堂数据
- **03_ai_hall_of_fame.sql** - AI名人堂数据（123条记录）

### AI大事纪数据
- **06_ai_timeline.sql** - AI大事纪数据（109条记录）

### 交互数据
- **08_comments.sql** - 评论数据（51条记录）

### 审核数据
- **09_publisher_applications.sql** - 发布者申请数据（1条记录）

### 排行榜数据
- **10_ai_tool_rankings.sql** - AI工具排行榜数据（160条记录）
- **11_ranking_update_log.sql** - 排行榜更新日志（2条记录）

### 系统设置
- **12_seo_settings.sql** - SEO设置数据（1条记录）
- **13_site_settings.sql** - 网站功能设置数据（1条记录）
- **14_traffic_data_sources.sql** - 流量数据源配置（4条记录）

## 🚀 使用方法

### 初始化数据库

按顺序执行以下脚本：

```bash
# 1. 创建表结构
psql -U username -d database_name -f 00_schema.sql

# 2. 导入基础数据
psql -U username -d database_name -f 01_categories.sql
psql -U username -d database_name -f 02_tags.sql
psql -U username -d database_name -f 04_users.sql

# 3. 导入AI工具数据
psql -U username -d database_name -f 05_ai_tools.sql
psql -U username -d database_name -f 07_tool_tags.sql

# 4. 导入AI名人堂数据
psql -U username -d database_name -f 03_ai_hall_of_fame.sql

# 5. 导入AI大事纪数据
psql -U username -d database_name -f 06_ai_timeline.sql

# 6. 导入交互数据
psql -U username -d database_name -f 08_comments.sql

# 7. 导入审核数据
psql -U username -d database_name -f 09_publisher_applications.sql

# 8. 导入排行榜数据
psql -U username -d database_name -f 10_ai_tool_rankings.sql
psql -U username -d database_name -f 11_ranking_update_log.sql

# 9. 导入系统设置
psql -U username -d database_name -f 12_seo_settings.sql
psql -U username -d database_name -f 13_site_settings.sql
psql -U username -d database_name -f 14_traffic_data_sources.sql
```

### 一键初始化

```bash
# Linux/Mac
cat database/*.sql | psql -U username -d database_name

# Windows
Get-Content database\*.sql | psql -U username -d database_name
```

## 📊 数据统计

| 表名 | 记录数 | 说明 |
|------|--------|------|
| categories | 8 | AI工具分类 |
| tags | 4 | 工具标签 |
| users | 2 | 用户数据 |
| ai_tools | 1000 | AI工具数据 |
| tool_tags | 5 | 工具标签关联 |
| ai_hall_of_fame | 123 | AI名人堂人物 |
| ai_timeline | 109 | AI大事纪事件 |
| comments | 51 | 用户评论 |
| publisher_applications | 1 | 发布者申请 |
| ai_tool_rankings | 160 | 工具排行榜 |
| ranking_update_log | 2 | 排行榜更新日志 |
| seo_settings | 1 | SEO设置 |
| site_settings | 1 | 网站设置 |
| traffic_data_sources | 4 | 流量数据源 |

## ⚠️ 注意事项

1. **执行顺序**：必须先执行 `00_schema.sql` 创建表结构，然后按顺序导入数据
2. **外键约束**：数据导入顺序考虑了外键约束关系，请勿随意调整顺序
3. **时间戳**：所有 `created_at` 和 `updated_at` 字段使用时区时间戳
4. **唯一约束**：`slug` 字段有唯一约束，导入前请确保无重复
5. **数据更新**：如需更新数据，建议先删除旧数据再导入新数据

## 🔄 数据更新

### 重新导出数据

如需重新从数据库导出最新数据，运行以下命令：

```bash
npx tsx scripts/export-database.ts
npx tsx scripts/generate-sql-inserts.ts
```

## 📝 版本历史

- **v1.0** (2025-01-21) - 初始版本，包含完整数据库结构和数据
