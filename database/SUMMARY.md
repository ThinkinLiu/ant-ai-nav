# 数据库导出报告

## 导出时间
2026-03-15

## 导出概况

本次导出生成了完整的数据库结构和数据初始化脚本，共计 **16个SQL文件**。

## 文件清单

### 📊 SQL文件列表

| 文件名 | 说明 |
|--------|------|
| 00_schema.sql | 数据库表结构定义 |
| 01_categories.sql | 分类数据（8条） |
| 02_tags.sql | 标签数据（4条） |
| 03_ai_hall_of_fame.sql | AI名人堂数据（124条） |
| 04_users.sql | 用户数据（2条） |
| 05_ai_tools.sql | AI工具数据（1000条） |
| 06_ai_timeline.sql | AI大事纪数据（109条） |
| 07_tool_tags.sql | 工具标签关联（5条） |
| 08_comments.sql | 评论数据（51条） |
| 09_publisher_applications.sql | 发布者申请（1条） |
| 10_ai_tool_rankings.sql | 工具排行榜（160条） |
| 11_ranking_update_log.sql | 排行榜更新日志（2条） |
| 12_seo_settings.sql | SEO设置（1条） |
| 13_site_settings.sql | 网站设置（1条） |
| 14_traffic_data_sources.sql | 流量数据源配置（4条） |
| 15_ai_news_fields.sql | AI资讯自定义字段 |
| 16_friend_links.sql | 友情链接（3条） |
| 17_cross_domain_config.sql | 跨域认证配置 |
| 18_seo_multi_site.sql | SEO多站点配置 |

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
│ ai_hall_of_fame     │     124 │
│ ai_timeline         │     109 │
│ ai_news             │     133 │
│ comments            │      51 │
│ publisher_applications│      1 │
│ ai_tool_rankings    │     160 │
│ ranking_update_log  │       2 │
│ seo_settings        │       1 │
│ site_settings       │       1 │
│ smtp_settings       │       1 │
│ traffic_data_sources│       4 │
│ friend_links        │       3 │
│ cross_domain_config │       1 │
└─────────────────────┴─────────┘
总计: 1609+ 条记录
```

## 使用方法

### 方法1: 使用管理后台数据迁移（推荐）

1. 访问 `/admin/data-migration`
2. 选择导出模式（业务数据/全部导出/自定义）
3. 下载JSON备份文件
4. 在目标环境导入

### 方法2: 使用SQL脚本

```bash
# Linux/Mac
cd database
cat *.sql | psql -U username -d database_name

# Windows PowerShell
cd database
Get-Content *.sql | psql -U username -d database_name
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

## 注意事项

1. **执行顺序**: 必须先执行 `00_schema.sql` 创建表结构
2. **外键约束**: 数据导入顺序已考虑外键关系，请勿随意调整
3. **唯一约束**: `slug` 字段有唯一约束，导入前确保无重复
4. **推荐使用**: 管理后台数据迁移功能，支持增量更新

---

**导出完成时间**: 2026-03-15  
**数据库类型**: PostgreSQL (Supabase)
