# 数据库结构摘要

## 数据库概览

蚂蚁AI导航项目使用 PostgreSQL 数据库，包含以下主要模块：

- **工具管理**：AI工具的增删改查、分类、标签
- **名人堂**：AI领域重要人物的介绍
- **大事纪**：AI发展历程中的重要事件
- **用户系统**：用户注册、登录、权限管理
- **评论系统**：用户对工具的评论和评分
- **排行榜**：工具的排名和热度统计
- **系统设置**：网站功能配置和SEO设置

## 核心表结构

### 1. ai_tools（AI工具表）
**用途**：存储所有AI工具的基本信息

**关键字段**：
- `id`: 主键
- `name`: 工具名称
- `slug`: URL友好标识
- `description`: 简短描述
- `website`: 官网链接
- `category_id`: 所属分类
- `publisher_id`: 发布者
- `status`: 审核状态（pending/approved/rejected）
- `view_count`: 浏览次数
- `favorite_count`: 收藏次数

**索引**：
- 主键索引：`id`
- 唯一索引：`slug`
- 外键索引：`category_id`
- 状态索引：`status`

### 2. categories（分类表）
**用途**：工具分类（如：文本生成、图像生成、代码助手等）

**关键字段**：
- `id`: 主键
- `name`: 分类名称
- `slug`: URL标识
- `icon`: 图标
- `color`: 颜色标识
- `sort_order`: 排序

**关联**：
- 一对多：`categories` → `ai_tools`

### 3. tags（标签表）
**用途**：工具标签（如：免费、开源、中文等）

**关键字段**：
- `id`: 主键
- `name`: 标签名称
- `slug`: URL标识
- `color`: 颜色标识

**关联**：
- 多对多：`tags` ↔ `ai_tools`（通过 `tool_tags` 表）

### 4. ai_hall_of_fame（AI名人堂表）
**用途**：AI领域重要人物介绍

**关键字段**：
- `id`: 主键
- `name`: 中文名
- `name_en`: 英文名
- `title`: 头衔
- `summary`: 简介
- `bio`: 详细介绍
- `achievements`: 成就列表（JSON）
- `category`: 分类（研究者/企业家/工程师等）

**索引**：
- 分类索引：`category`

### 5. ai_timeline（AI大事纪表）
**用途**：AI发展历程中的重要事件

**关键字段**：
- `id`: 主键
- `year`: 年份
- `month`: 月份
- `day`: 日期
- `title`: 事件标题
- `description`: 事件描述
- `category`: 分类
- `importance`: 重要性（landmark/important/normal）

**索引**：
- 时间索引：`year`, `month`, `day`
- 重要性索引：`importance`

### 6. users（用户表）
**用途**：用户账户信息

**关键字段**：
- `id`: UUID主键
- `email`: 邮箱
- `name`: 用户名
- `role`: 角色（admin/publisher/user）
- `is_active`: 是否激活
- `created_at`: 注册时间

**索引**：
- 邮箱唯一索引：`email`
- 角色索引：`role`

### 7. comments（评论表）
**用途**：用户对工具的评论

**关键字段**：
- `id`: 主键
- `tool_id`: 工具ID
- `user_id`: 用户ID
- `content`: 评论内容
- `rating`: 评分（1-5）
- `is_hidden`: 是否隐藏

**关联**：
- 多对一：`comments` → `ai_tools`
- 多对一：`comments` → `users`

### 8. ai_tool_rankings（工具排行榜表）
**用途**：工具排名数据

**关键字段**：
- `id`: 主键
- `tool_id`: 工具ID
- `rank`: 排名
- `score`: 得分
- `period`: 时间周期

**索引**：
- 唯一索引：`(tool_id, period)`
- 排名索引：`rank`

### 9. site_settings（网站设置表）
**用途**：网站功能开关

**关键字段**：
- `id`: 主键
- `ranking_enabled`: 启用排行榜
- `comments_enabled`: 启用评论
- `favorites_enabled`: 启用收藏

### 10. seo_settings（SEO设置表）
**用途**：网站SEO配置

**关键字段**：
- `id`: 主键
- `site_name`: 网站名称
- `site_description`: 网站描述
- `site_keywords`: 关键词
- `google_analytics_id`: Google分析ID
- `baidu_analytics_id`: 百度分析ID

## 关系图

```
users (用户)
  ├── comments (评论)
  │     └── ai_tools (工具)
  │           ├── categories (分类)
  │           └── tags (标签) [通过 tool_tags]
  ├── ai_hall_of_fame (名人堂)
  └── ai_timeline (大事纪)

ai_tools (工具)
  └── ai_tool_rankings (排行榜)

site_settings (网站设置)
seo_settings (SEO设置)
```

## 数据统计

| 类型 | 表数量 | 总记录数 |
|------|--------|---------|
| 核心业务 | 4 | 1,240 |
| 用户系统 | 2 | 54 |
| 系统设置 | 3 | 6 |
| 排行榜 | 2 | 162 |
| **总计** | **11** | **1,462** |

## 初始化脚本

按顺序执行以下脚本：

1. **00_schema.sql** - 创建表结构
2. **01_categories.sql** - 导入分类（8条）
3. **02_tags.sql** - 导入标签（4条）
4. **03_ai_hall_of_fame.sql** - 导入名人堂（124条）
5. **04_users.sql** - 导入用户（2条）
6. **05_ai_tools.sql** - 导入工具（1000条）
7. **06_ai_timeline.sql** - 导入大事纪（109条）
7. **07_tool_tags.sql** - 导入工具标签关联（5条）
8. **08_comments.sql** - 导入评论（51条）
9. **09_publisher_applications.sql** - 导入申请（1条）
10. **10_ai_tool_rankings.sql** - 导入排行榜（160条）
11. **11_ranking_update_log.sql** - 导入更新日志（2条）
12. **12_seo_settings.sql** - 导入SEO设置（1条）
13. **13_site_settings.sql** - 导入网站设置（1条）
14. **14_traffic_data_sources.sql** - 导入流量源（4条）

## 扩展功能

### OAuth 认证
- 支持 QQ 和微信登录
- 需要执行 `init-oauth-settings.sql`

### 资讯功能
- 工具相关的资讯和教程
- 需要执行 `15_ai_news_fields.sql`

## 运行时配置

支持通过运行时配置文件设置数据库连接：

- 配置路径：`/app/config/database.json`
- 配置页面：`/settings`（首次配置）、`/admin/settings`（管理后台）
- 优先级：环境变量 > 运行时配置文件

## 注意事项

1. **外键约束**：确保插入数据时引用的记录已存在
2. **序列重置**：每个数据文件末尾包含序列重置语句
3. **时区处理**：所有时间戳使用 `TIMESTAMP WITH TIME ZONE`
4. **UUID类型**：用户ID使用 `UUID` 类型
5. **JSONB类型**：部分字段使用 `JSONB` 存储复杂数据

## 性能优化

### 索引策略
- 所有外键字段创建索引
- 常用查询字段创建复合索引
- 全文搜索使用 GIN 索引

### 查询优化
- 使用 `EXPLAIN ANALYZE` 分析慢查询
- 定期执行 `VACUUM` 和 `ANALYZE`
- 考虑使用 `pg_trgm` 扩展提升模糊搜索性能

### 缓存策略
- 使用 Redis 缓存热门数据
- 数据库连接池配置
- 查询结果缓存

---

**最后更新**: 2025-04-01
