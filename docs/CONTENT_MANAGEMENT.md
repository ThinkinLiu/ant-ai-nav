# AI内容管理功能说明

## 功能概述

本次更新为蚂蚁AI导航添加了三个核心内容管理模块，支持完整的CRUD操作和权限控制。

## 一、AI资讯管理

### 功能特点
- **发布者和管理员可发布**：发布者和管理员都可以创建AI资讯
- **管理员审核机制**：发布的资讯需要管理员审核通过才能正式发布
- **状态管理**：支持草稿、待审核、已发布、已拒绝四种状态
- **分类体系**：支持行业动态、学术研究、产品发布、教程指南、其他五大分类

### 权限说明
| 角色 | 创建 | 编辑 | 删除 | 审核 |
|------|------|------|------|------|
| 管理员 | ✅ | ✅（所有） | ✅（所有） | ✅ |
| 发布者 | ✅ | ✅（自己的） | ✅（自己的） | ❌ |
| 普通用户 | ❌ | ❌ | ❌ | ❌ |

### API接口
- `GET /api/news` - 获取资讯列表
- `POST /api/news` - 创建资讯
- `GET /api/news/[id]` - 获取资讯详情
- `PUT /api/news/[id]` - 更新资讯
- `DELETE /api/news/[id]` - 删除资讯
- `POST /api/news/[id]/review` - 审核资讯（管理员）
- `PUT /api/news/[id]/review` - 提交审核

### 数据库表结构
```sql
CREATE TABLE ai_news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    category VARCHAR(50),
    tags JSONB,
    source VARCHAR(200),
    source_url TEXT,
    author_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reject_reason TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### 页面路径
- **管理后台**：`/admin/news` - 管理所有资讯，可审核
- **发布者中心**：`/publisher/news` - 管理自己的资讯

## 二、AI名人堂管理

### 功能特点
- **仅管理员可维护**：只有管理员可以新增、编辑、删除AI名人堂数据
- **分类体系**：支持先驱者、研究者、企业家、工程师等11个分类
- **推荐功能**：可标记重要人物为推荐状态
- **浏览统计**：记录每个名人的浏览次数

### 权限说明
| 角色 | 创建 | 编辑 | 删除 | 设置推荐 |
|------|------|------|------|----------|
| 管理员 | ✅ | ✅ | ✅ | ✅ |
| 发布者 | ❌ | ❌ | ❌ | ❌ |
| 普通用户 | ❌ | ❌ | ❌ | ❌ |

### API接口
- `GET /api/hall-of-fame` - 获取名人列表（公开）
- `GET /api/hall-of-fame/[id]` - 获取名人详情（公开）
- `POST /api/admin/hall-of-fame` - 创建名人（管理员）
- `PUT /api/admin/hall-of-fame/[id]` - 更新名人（管理员）
- `DELETE /api/admin/hall-of-fame/[id]` - 删除名人（管理员）

### 页面路径
- **管理后台**：`/admin/hall-of-fame` - 管理所有名人数据

## 三、AI大事纪管理

### 功能特点
- **仅管理员可维护**：只有管理员可以新增、编辑、删除AI大事纪数据
- **时间验证**：系统自动验证年份不能是未来年份，确保数据真实性
- **重要性分级**：支持里程碑、重要事件、普通事件三级分类
- **分类体系**：支持技术突破、产品发布、学术研究、组织事件、其他五大分类

### 权限说明
| 角色 | 创建 | 编辑 | 删除 |
|------|------|------|------|
| 管理员 | ✅ | ✅ | ✅ |
| 发布者 | ❌ | ❌ | ❌ |
| 普通用户 | ❌ | ❌ | ❌ |

### API接口
- `GET /api/timeline` - 获取大事纪列表（公开）
- `GET /api/timeline/[id]` - 获取大事纪详情（公开）
- `POST /api/admin/timeline` - 创建大事纪（管理员）
- `PUT /api/admin/timeline/[id]` - 更新大事纪（管理员）
- `DELETE /api/admin/timeline/[id]` - 删除大事纪（管理员）

### 页面路径
- **管理后台**：`/admin/timeline` - 管理所有大事纪数据

## 四、导航菜单更新

### 管理后台菜单
- 数据概览
- 工具审核
- **AI资讯** ✨ 新增
- **名人堂管理** ✨ 新增
- **大事纪管理** ✨ 新增
- 发布者审核
- 用户管理
- 评论管理
- 排行榜配置
- 批量导入
- SEO设置

### 发布者中心菜单
- 我的工具
- **AI资讯** ✨ 新增

## 五、技术实现

### 数据库
- 新增 `ai_news` 表
- 更新 `00_schema.sql` 脚本
- 添加触发器自动更新 `updated_at` 字段

### API设计
- RESTful API 设计
- 权限控制在路由层面实现
- 支持分页、筛选、排序

### 前端页面
- 使用 shadcn/ui 组件库
- 响应式表格设计
- 实时筛选和搜索
- 状态标签可视化

## 六、后续优化建议

1. **AI资讯**
   - 添加富文本编辑器（支持Markdown）
   - 添加图片上传功能
   - 添加评论功能
   - 添加点赞功能

2. **AI名人堂**
   - 添加批量导入功能
   - 添加人物关系图谱
   - 添加时间线视图

3. **AI大事纪**
   - 添加批量导入功能
   - 添加时间轴可视化
   - 添加关联人物和工具

## 七、部署注意事项

1. **数据库迁移**：需要执行 `database/00_schema.sql` 中的新表创建语句
2. **环境变量**：无需新增环境变量
3. **权限配置**：确保现有用户表中的角色字段正确

---

**创建时间**: 2025-01-21  
**版本**: v1.0
