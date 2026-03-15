# 数据库初始化脚本

本目录包含蚂蚁AI导航项目的完整数据库结构和数据初始化脚本。

## 📁 文件说明

### 数据库结构
- **00_schema.sql** - 数据库表结构定义，包含所有表的CREATE语句、索引、约束和触发器

### 基础数据
- **01_categories.sql** - 分类数据（8条记录）
- **02_tags.sql** - 标签数据（4条记录）
- **04_users.sql** - 用户数据（2条记录）

### 内容数据
- **03_ai_hall_of_fame.sql** - AI名人堂数据（124条记录）
- **05_ai_tools.sql** - AI工具数据（1000条记录）
- **06_ai_timeline.sql** - AI大事纪数据（109条记录）

### 关联数据
- **07_tool_tags.sql** - 工具标签关联数据（5条记录）

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
- **15_friend_links.sql** - 友情链接数据（3条记录）
- **16_smtp_settings.sql** - SMTP邮件设置（1条记录）

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

# 3. 导入内容数据
psql -U username -d database_name -f 03_ai_hall_of_fame.sql
psql -U username -d database_name -f 05_ai_tools.sql
psql -U username -d database_name -f 06_ai_timeline.sql

# 4. 导入关联数据
psql -U username -d database_name -f 07_tool_tags.sql

# 5. 导入交互数据
psql -U username -d database_name -f 08_comments.sql

# 6. 导入审核数据
psql -U username -d database_name -f 09_publisher_applications.sql

# 7. 导入排行榜数据
psql -U username -d database_name -f 10_ai_tool_rankings.sql
psql -U username -d database_name -f 11_ranking_update_log.sql

# 8. 导入系统设置
psql -U username -d database_name -f 12_seo_settings.sql
psql -U username -d database_name -f 13_site_settings.sql
psql -U username -d database_name -f 14_traffic_data_sources.sql
psql -U username -d database_name -f 15_friend_links.sql
psql -U username -d database_name -f 16_smtp_settings.sql
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
| ai_hall_of_fame | 124 | AI名人堂人物 |
| ai_timeline | 109 | AI大事纪事件 |
| ai_news | 133 | AI资讯 |
| comments | 51 | 用户评论 |
| publisher_applications | 1 | 发布者申请 |
| ai_tool_rankings | 160 | 工具排行榜 |
| ranking_update_log | 2 | 排行榜更新日志 |
| seo_settings | 1 | SEO设置 |
| site_settings | 1 | 网站设置 |
| smtp_settings | 1 | SMTP设置 |
| traffic_data_sources | 4 | 流量数据源 |
| friend_links | 3 | 友情链接 |

## 📋 表结构概览

### 核心业务表

#### ai_tools - AI工具表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(100) | 工具名称 |
| slug | VARCHAR(100) | URL别名 |
| description | TEXT | 简短描述 |
| long_description | TEXT | 详细描述 |
| website_url | TEXT | 官网地址 |
| category_id | INTEGER | 分类ID |
| pricing_type | VARCHAR(50) | 定价类型 |
| is_featured | BOOLEAN | 是否推荐 |
| is_pinned | BOOLEAN | 是否置顶 |
| status | VARCHAR(20) | 状态 |

#### ai_news - AI资讯表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| title | VARCHAR(200) | 标题 |
| slug | VARCHAR(200) | URL别名 |
| summary | TEXT | 摘要 |
| content | TEXT | 正文 |
| category | VARCHAR(50) | 分类 |
| tags | JSONB | 标签 |
| status | VARCHAR(20) | 状态 |
| author_id | VARCHAR(36) | 作者ID |

#### ai_hall_of_fame - AI名人堂表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(100) | 中文名 |
| name_en | VARCHAR(100) | 英文名 |
| title | VARCHAR(200) | 头衔 |
| summary | TEXT | 简介 |
| bio | TEXT | 详细介绍 |
| achievements | JSONB | 成就列表 |
| category | VARCHAR(50) | 分类 |
| birth_year | INTEGER | 出生年份 |
| death_year | INTEGER | 逝世年份 |

#### ai_timeline - AI大事纪表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| year | INTEGER | 年份 |
| month | INTEGER | 月份 |
| day | INTEGER | 日期 |
| title | VARCHAR(200) | 事件标题 |
| description | TEXT | 事件描述 |
| category | VARCHAR(50) | 分类 |
| importance | VARCHAR(20) | 重要性 |

### 系统设置表

#### site_settings - 网站设置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| site_name | VARCHAR(100) | 网站名称 |
| site_description | TEXT | 网站描述 |
| contact_email | VARCHAR(100) | 联系邮箱 |

#### smtp_settings - SMTP设置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| host | VARCHAR(100) | SMTP服务器 |
| port | INTEGER | 端口 |
| username | VARCHAR(100) | 用户名 |
| password | VARCHAR(100) | 密码（加密） |

#### seo_settings - SEO设置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| meta_title | VARCHAR(200) | 标题 |
| meta_description | TEXT | 描述 |
| meta_keywords | TEXT | 关键词 |

## ⚠️ 注意事项

1. **执行顺序**：必须先执行 `00_schema.sql` 创建表结构，然后按顺序导入数据
2. **外键约束**：数据导入顺序考虑了外键约束关系，请勿随意调整顺序
3. **时间戳**：所有 `created_at` 和 `updated_at` 字段使用时区时间戳
4. **唯一约束**：`slug` 字段有唯一约束，导入前请确保无重复
5. **数据更新**：如需更新数据，建议使用管理后台的数据迁移功能

## 🔄 数据迁移

推荐使用管理后台的数据迁移功能：

1. 访问 `/admin/data-migration`
2. 选择导出模式
3. 下载JSON备份文件
4. 在目标环境导入

详见 [内容管理文档](../docs/CONTENT_MANAGEMENT.md#五数据迁移管理)

## 📝 版本历史

- **v2.0** (2026-03-15) - 新增数据迁移功能，更新表结构
- **v1.0** (2025-01-21) - 初始版本，包含完整数据库结构和数据
