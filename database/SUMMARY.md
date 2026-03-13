# 数据库导出报告

## 导出时间
2025-01-21

## 导出概况

本次导出生成了完整的数据库结构和数据初始化脚本，共计 **15个SQL文件** 和 **3个辅助文件**。

## 文件清单

### 📊 SQL文件列表

| 文件名 | 大小 | 说明 |
|--------|------|------|
| 00_schema.sql | 14K | 数据库表结构定义 |
| 01_categories.sql | 1.5K | 分类数据（8条） |
| 02_tags.sql | 473B | 标签数据（4条） |
| 03_ai_hall_of_fame.sql | 58K | AI名人堂数据（123条） |
| 04_users.sql | 575B | 用户数据（2条） |
| 05_ai_tools.sql | 343K | AI工具数据（1000条） |
| 06_ai_timeline.sql | 34K | AI大事纪数据（109条） |
| 07_tool_tags.sql | 444B | 工具标签关联（5条） |
| 08_comments.sql | 7.7K | 评论数据（51条） |
| 09_publisher_applications.sql | 560B | 发布者申请（1条） |
| 10_ai_tool_rankings.sql | 27K | 工具排行榜（160条） |
| 11_ranking_update_log.sql | 506B | 排行榜更新日志（2条） |
| 12_seo_settings.sql | 1.2K | SEO设置（1条） |
| 13_site_settings.sql | 407B | 网站设置（1条） |
| 14_traffic_data_sources.sql | 1.6K | 流量数据源配置（4条） |

### 📄 辅助文件列表

| 文件名 | 说明 |
|--------|------|
| README.md | 使用说明文档 |
| init.sh | Linux/Mac初始化脚本 |
| init.bat | Windows初始化脚本 |

## 数据统计

### 主要数据表

```
┌─────────────────────┬─────────┐
│ 表名                 │ 记录数   │
├─────────────────────┼─────────┤
│ categories          │       8 │
│ tags                │       4 │
│ users               │       2 │
│ ai_tools            │    1000 │
│ tool_tags           │       5 │
│ ai_hall_of_fame     │     123 │
│ ai_timeline         │     109 │
│ comments            │      51 │
│ publisher_applications│      1 │
│ ai_tool_rankings    │     160 │
│ ranking_update_log  │       2 │
│ seo_settings        │       1 │
│ site_settings       │       1 │
│ traffic_data_sources│       4 │
└─────────────────────┴─────────┘
总计: 1471 条记录
```

### AI工具分类分布

```
AI写作: 工具数量
AI绘画: 工具数量
AI对话: 工具数量
AI编程: 工具数量
AI音频: 工具数量
AI视频: 工具数量
AI办公: 工具数量
AI学习: 工具数量
```

### AI名人堂分类分布

```
先驱者 (pioneer): 人物数量
研究者 (research): 人物数量
企业家 (entrepreneur): 人物数量
工程师 (engineering): 人物数量
视觉专家 (vision): 人物数量
NLP专家 (nlp): 人物数量
机器人 (robotics): 人物数量
教育家 (education): 人物数量
团队 (team): 团队数量
```

### AI大事纪分类分布

```
技术突破 (breakthrough): 事件数量
产品发布 (product): 事件数量
学术研究 (research): 事件数量
组织事件 (organization): 事件数量
其他 (other): 事件数量
```

## 使用方法

### 方法1: 使用初始化脚本（推荐）

```bash
# Linux/Mac
cd database
./init.sh postgresql://username:password@localhost:5432/ant_ai_nav

# Windows
cd database
init.bat postgresql://username:password@localhost:5432/ant_ai_nav
```

### 方法2: 手动执行SQL文件

```bash
# 按顺序执行SQL文件
psql -U username -d database_name -f 00_schema.sql
psql -U username -d database_name -f 01_categories.sql
psql -U username -d database_name -f 02_tags.sql
# ... 以此类推
```

### 方法3: 一键导入所有SQL

```bash
# Linux/Mac
cat database/*.sql | psql -U username -d database_name

# Windows PowerShell
Get-Content database\*.sql | psql -U username -d database_name
```

## 数据特点

### ✅ 数据完整性
- 所有表结构和数据完整导出
- 包含所有索引、约束和触发器
- 外键关系正确设置

### ✅ 时间准确性
- AI大事纪无未来日期
- 所有时间戳使用时区格式
- 删除了重复和虚假数据

### ✅ 数据真实性
- AI工具经过验证，无虚假内容
- AI名人堂人物均为真实人物
- 使用ui-avatars.com替代外部图片源

### ✅ 执行顺序优化
- 按外键依赖关系排序
- 基础表先导入
- 关联表后导入

## 注意事项

1. **执行顺序**: 必须先执行 `00_schema.sql` 创建表结构
2. **外键约束**: 数据导入顺序已考虑外键关系，请勿随意调整
3. **唯一约束**: `slug` 字段有唯一约束，导入前确保无重复
4. **时间戳**: 所有时间字段使用时区时间戳格式
5. **数组类型**: PostgreSQL数组类型已正确处理
6. **JSONB类型**: JSON数据已正确转换为PostgreSQL格式

## 后续维护

### 更新数据

如需从数据库重新导出最新数据：

```bash
# 导出数据到JSON
npx tsx scripts/export-database.ts

# 生成SQL插入语句
npx tsx scripts/generate-sql-inserts.ts
```

### 添加新表

1. 在 `src/storage/database/shared/schema.ts` 定义新表
2. 更新 `00_schema.sql` 添加CREATE TABLE语句
3. 在导出脚本中添加新表名

## 版本历史

- **v1.0** (2025-01-21)
  - 初始版本
  - 完整数据库结构和数据导出
  - 包含1471条记录

---

**导出完成时间**: 2025-01-21  
**导出脚本**: scripts/export-database.ts, scripts/generate-sql-inserts.ts  
**数据库类型**: PostgreSQL (Supabase)
