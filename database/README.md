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
| comments | 51 | 用户评论 |
| publisher_applications | 1 | 发布者申请 |
| ai_tool_rankings | 160 | 工具排行榜 |
| ranking_update_log | 2 | 排行榜更新日志 |
| seo_settings | 1 | SEO设置 |
| site_settings | 1 | 网站设置 |
| traffic_data_sources | 4 | 流量数据源 |

## 📋 表结构概览

### 核心业务表

#### ai_tools - AI工具表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | VARCHAR(200) | 工具名称 |
| slug | VARCHAR(200) | URL别名 |
| description | TEXT | 简短描述 |
| long_description | TEXT | 详细描述 |
| website | VARCHAR(500) | 官网地址 |
| category_id | INTEGER | 分类ID |
| publisher_id | VARCHAR(36) | 发布者ID |
| status | VARCHAR(20) | 状态（pending/approved/rejected）|
| is_featured | BOOLEAN | 是否推荐 |
| is_pinned | BOOLEAN | 是否置顶 |
| is_free | BOOLEAN | 是否免费 |
| pricing_info | TEXT | 价格信息 |

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
| importance | VARCHAR(20) | 重要性（landmark/important/normal）|

### 用户交互表

#### users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键（UUID）|
| email | VARCHAR(255) | 邮箱 |
| name | VARCHAR(128) | 用户名 |
| role | VARCHAR(20) | 角色（admin/publisher/user）|
| is_active | BOOLEAN | 是否激活 |

#### comments - 评论表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| tool_id | INTEGER | 工具ID |
| user_id | VARCHAR(36) | 用户ID |
| content | TEXT | 评论内容 |
| rating | INTEGER | 评分（1-5）|
| is_hidden | BOOLEAN | 是否隐藏 |

### 系统设置表

#### site_settings - 网站设置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| ranking_enabled | BOOLEAN | 是否启用排行榜 |
| comments_enabled | BOOLEAN | 是否启用评论 |
| favorites_enabled | BOOLEAN | 是否启用收藏 |

#### seo_settings - SEO设置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| site_name | VARCHAR(100) | 网站名称 |
| site_description | TEXT | 网站描述 |
| site_keywords | TEXT | 关键词 |
| google_analytics_id | VARCHAR(50) | Google分析ID |
| baidu_analytics_id | VARCHAR(50) | 百度分析ID |

## ⚠️ 注意事项

1. **执行顺序**：必须先执行 `00_schema.sql` 创建表结构，然后按顺序导入数据
2. **数据依赖**：某些表有外键约束，需要先导入被引用的表数据
3. **序列重置**：每个数据文件末尾包含序列重置语句，确保后续插入正常
4. **时区设置**：所有时间戳使用 TIMESTAMP WITH TIME ZONE 类型
5. **UUID生成**：用户ID等使用UUID，需要 uuid-ossp 扩展

## 🔄 数据更新

### 更新排行榜数据
排行榜数据需要定期更新，更新流程：
1. 从流量数据源获取最新数据
2. 计算排名变化
3. 插入新的排行榜记录
4. 记录更新日志

### 添加新工具
新工具提交流程：
1. 用户提交工具申请
2. 管理员审核
3. 审核通过后创建工具记录
4. 关联标签和分类

## 📝 维护说明

- **备份策略**：定期备份数据库，建议每天一次全量备份
- **数据清理**：定期清理过期的会话数据、日志数据
- **性能优化**：定期执行 VACUUM 和 ANALYZE 命令
- **索引维护**：监控索引使用情况，必要时添加或删除索引

## 🔧 常用SQL查询

### 查询工具总数
```sql
SELECT COUNT(*) FROM ai_tools WHERE status = 'approved';
```

### 查询分类统计
```sql
SELECT c.name, COUNT(t.id) as tool_count
FROM categories c
LEFT JOIN ai_tools t ON c.id = t.category_id
WHERE t.status = 'approved'
GROUP BY c.id, c.name
ORDER BY tool_count DESC;
```

### 查询最新工具
```sql
SELECT name, description, created_at
FROM ai_tools
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;
```

### 查询热门工具
```sql
SELECT name, view_count, favorite_count
FROM ai_tools
WHERE status = 'approved'
ORDER BY view_count DESC
LIMIT 10;
```

## 📞 技术支持

如有问题，请联系：
- Email: admin@antai.com
- GitHub: [项目地址]

---

**最后更新时间**: 2025-01-15
