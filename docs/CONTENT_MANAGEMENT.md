# AI内容管理功能说明

## 功能概述

蚂蚁AI导航提供完整的内容管理功能，包括AI资讯、AI名人堂、AI大事纪、友情链接等模块，支持CRUD操作、权限控制和AI智能生成。

---

## 一、AI资讯管理

### 功能特点
- **发布者和管理员可发布**：发布者和管理员都可以创建AI资讯
- **管理员审核机制**：发布的资讯需要管理员审核通过才能正式发布
- **状态管理**：支持草稿、待审核、已发布、已拒绝四种状态
- **分类体系**：支持行业动态、学术研究、产品发布、教程指南、其他五大分类
- **AI自动发布**：输入发布日期，自动搜索并生成相关资讯

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
- `POST /api/admin/news/search` - AI自动搜索资讯
- `POST /api/admin/news/import` - 批量导入资讯

### AI自动发布流程
1. 访问管理后台 → AI资讯 → 自动发布
2. 选择发布日期
3. 系统自动搜索该日期相关的AI资讯
4. 使用LLM处理搜索结果，准确提取发布日期
5. 选择需要的资讯导入

---

## 二、AI名人堂管理

### 功能特点
- **仅管理员可维护**：只有管理员可以新增、编辑、删除AI名人堂数据
- **分类体系**：支持先驱者、研究者、企业家、工程师、视觉专家、NLP专家、机器人专家、教育家、团队等分类
- **推荐功能**：可标记重要人物为推荐状态
- **浏览统计**：记录每个名人的浏览次数
- **AI自动生成**：输入人物姓名，自动搜索并生成详细信息

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
- `POST /api/admin/hall-of-fame/generate` - AI自动生成（管理员）

### AI自动生成流程
1. 访问管理后台 → 名人堂管理 → 新增人物
2. 输入人物姓名，选择分类
3. 点击"一键生成"按钮
4. 系统自动搜索并生成：简介、成就、所属机构、出生年份等
5. 确认后保存

### 数据字段
| 字段 | 说明 |
|------|------|
| name | 中文名 |
| name_en | 英文名 |
| photo | 头像URL（自动生成） |
| title | 头衔/职位 |
| summary | 简短介绍 |
| bio | 详细介绍 |
| achievements | 成就列表 |
| organization | 所属机构 |
| country | 国家 |
| category | 分类 |
| tags | 标签 |
| birth_year | 出生年份 |
| death_year | 逝世年份 |

---

## 三、AI大事纪管理

### 功能特点
- **仅管理员可维护**：只有管理员可以新增、编辑、删除AI大事纪数据
- **时间验证**：系统自动验证年份不能是未来年份，确保数据真实性
- **重要性分级**：支持里程碑、重要事件、普通事件三级分类
- **分类体系**：支持技术突破、产品发布、学术研究、组织事件、其他五大分类
- **AI自动生成**：根据截止日期自动搜索并生成历史事件

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
- `POST /api/admin/timeline/generate` - AI自动生成（管理员）
- `POST /api/admin/timeline/import` - 批量导入（管理员）

### AI自动生成流程
1. 访问管理后台 → 大事纪管理
2. 输入截止日期
3. 点击"自动生成"
4. 系统从数据库最新日期开始搜索到截止日期的AI大事件
5. 使用LLM整理生成结构化事件列表
6. 选择需要的事件导入

---

## 四、友情链接管理

### 功能特点
- **用户提交**：用户可以提交友情链接申请
- **管理员审核**：管理员审核通过后显示
- **排序控制**：支持自定义排序

### API接口
- `GET /api/friend-links` - 获取友情链接列表（公开）
- `POST /api/friend-links` - 提交友情链接申请
- `GET /api/admin/friend-links` - 获取所有链接（管理员）
- `PUT /api/admin/friend-links/[id]` - 审核链接（管理员）
- `DELETE /api/admin/friend-links/[id]` - 删除链接（管理员）

### 页面路径
- **提交页面**：`/link-submit`
- **管理后台**：`/admin/friend-links`

---

## 五、数据迁移管理

### 功能特点
- **多模式导出**：全部导出、业务数据、内容数据、设置数据、自定义
- **灵活导入**：合并模式、替换模式
- **表级选择**：可选择具体需要导出的表

### 导出模式
| 模式 | 说明 | 包含表 |
|------|------|--------|
| 全部导出 | 包含所有数据 | 19个表 |
| 业务数据 | 不含用户信息 | 16个表 |
| 内容数据 | 核心内容 | 7个表 |
| 设置数据 | 系统配置 | 4个表 |
| 自定义 | 手动选择 | 用户选择 |

### 数据表分类
| 分类 | 包含表 |
|------|--------|
| 内容数据 | ai_tools, ai_news, ai_hall_of_fame, ai_timeline |
| 分类标签 | categories, tags, tool_tags |
| 排名数据 | ai_tool_rankings, ranking_update_log, traffic_data_sources |
| 互动数据 | comments, favorites |
| 友情链接 | friend_links |
| 系统设置 | site_settings, smtp_settings, seo_settings |
| 用户数据 | users, email_verification_codes, publisher_applications |

### API接口
- `GET /api/admin/data/export?action=tables` - 获取表定义列表
- `POST /api/admin/data/export` - 导出数据
- `POST /api/admin/data/import` - 导入数据

### 页面路径
- **管理后台**：`/admin/data-migration`

---

## 六、导航菜单

### 管理后台菜单
- 数据概览
- 工具审核
- AI资讯
- 名人堂管理
- 大事纪管理
- 友情链接
- 发布者审核
- 用户管理
- 评论管理
- 排行榜配置
- 批量导入
- 数据迁移
- SEO设置
- 邮件服务

### 发布者中心菜单
- 我的工具
- AI资讯

---

## 七、技术实现

### AI能力集成
使用 Coze SDK 实现AI智能功能：
- **Web Search**：搜索网络信息
- **LLM**：处理搜索结果，生成结构化数据

```typescript
import { SearchClient, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

const config = new Config()
const searchClient = new SearchClient(config, customHeaders)
const llmClient = new LLMClient(config, customHeaders)

// 搜索
const searchResponse = await searchClient.advancedSearch(query, {
  searchType: 'web',
  count: 10,
  needContent: true,
})

// LLM处理
const llmResponse = await llmClient.invoke(messages, {
  temperature: 0.2,
  model: 'doubao-seed-1-8-251228'
})
```

### 数据库
所有表结构见 `database/00_schema.sql`

### 前端页面
- 使用 shadcn/ui 组件库
- 响应式表格设计
- 实时筛选和搜索
- 状态标签可视化
- 使用 Sonner 替代原生 alert
- 使用自定义 useConfirm Hook 替代原生 confirm

---

**更新时间**: 2026-03-15  
**版本**: v2.0
