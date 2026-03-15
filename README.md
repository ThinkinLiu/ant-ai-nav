# 🐜 蚂蚁AI导航

<div align="center">

一个现代化的 AI 工具导航平台，支持工具发布、审核、浏览、评论和收藏，并内置AI资讯、AI名人堂、AI大事纪等核心内容模块。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[在线演示](#) | [功能特性](#功能特性) | [快速开始](#快速开始) | [部署指南](#部署指南)

</div>

---

## 📖 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
- [数据库配置](#数据库配置)
- [部署指南](#部署指南)
- [数据迁移](#数据迁移)
- [开发指南](#开发指南)
- [贡献指南](#贡献指南)
- [开源协议](#开源协议)

---

## ✨ 功能特性

### 🎯 核心功能

- **工具展示** - 分类展示 AI 工具，支持搜索、筛选、排序
- **工具发布** - 发布者可提交新工具，支持富文本描述
- **审核系统** - 管理员审核工具，支持通过/拒绝/重新审核
- **工具置顶** - 管理员可将优质工具置顶展示
- **用户评论** - 用户可对工具进行评分和评论
- **评论精选** - 管理员可将优质评论设为精选
- **收藏功能** - 用户可收藏感兴趣的工具
- **用户认证** - 支持邮箱注册/登录，邮箱验证码验证

### 📰 内容管理

- **AI资讯** - 发布AI行业资讯，支持审核流程、自动发布
- **AI名人堂** - 管理AI领域杰出人物，支持自动生成
- **AI大事纪** - 记录AI发展里程碑，支持自动生成
- **友情链接** - 友情链接管理与审核

### 🔧 系统管理

- **数据迁移** - 支持多模式数据导出/导入，便于环境迁移
- **SEO设置** - 自定义网站SEO信息
- **SMTP配置** - 邮件服务配置，支持验证码发送
- **排行榜配置** - 火爆AI工具数据源配置

### 🤖 AI智能功能

- **自动发布AI资讯** - 输入日期，自动搜索并生成资讯
- **自动生成AI名人堂** - 输入姓名，自动搜索并生成人物信息
- **自动生成AI大事纪** - 自动搜索并生成历史事件

### 👥 用户角色

| 角色 | 权限 |
|------|------|
| 普通用户 | 浏览工具、评论、收藏 |
| 发布者 | 普通用户权限 + 发布工具、发布资讯 |
| 管理员 | 全部权限 + 审核管理 |

### 🎨 界面特性

- 响应式设计，完美适配移动端
- 深色/浅色主题切换
- 流畅的动画效果
- SEO 优化

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, TypeScript 5 |
| 样式 | Tailwind CSS 4, shadcn/ui |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| 存储 | S3 兼容对象存储 (可选) |
| AI能力 | Coze SDK (Web Search, LLM) |
| 邮件 | Nodemailer |
| 图标 | Lucide Icons |

---

## 📁 项目结构

```
├── public/                  # 静态资源
├── scripts/                 # 部署脚本
├── database/                # 数据库脚本
├── docs/                    # 文档
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # 管理后台页面
│   │   │   ├── data-migration/  # 数据迁移
│   │   │   ├── hall-of-fame/    # 名人堂管理
│   │   │   ├── timeline/        # 大事纪管理
│   │   │   ├── news/            # 资讯管理
│   │   │   ├── friend-links/    # 友情链接
│   │   │   ├── seo/             # SEO设置
│   │   │   └── smtp/            # SMTP设置
│   │   ├── api/             # API 路由
│   │   │   ├── admin/       # 管理API
│   │   │   │   ├── data/    # 数据导出/导入
│   │   │   │   ├── hall-of-fame/  # 名人堂
│   │   │   │   ├── timeline/      # 大事纪
│   │   │   │   ├── news/          # 资讯
│   │   │   │   └── friend-links/  # 友情链接
│   │   │   └── ...
│   │   ├── categories/      # 分类页面
│   │   ├── favorites/       # 收藏页面
│   │   ├── hall-of-fame/    # 名人堂页面
│   │   ├── timeline/        # 大事纪页面
│   │   ├── news/            # 资讯页面
│   │   └── ...
│   ├── components/          # React 组件
│   │   └── ui/              # shadcn/ui 组件
│   ├── contexts/            # React Context
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具函数
│   └── storage/             # 数据库相关
├── .env.example             # 环境变量模板
├── Dockerfile               # Docker 配置
├── docker-compose.yml       # Docker Compose 配置
├── next.config.ts           # Next.js 配置
├── package.json             # 依赖配置
├── tailwind.config.ts       # Tailwind 配置
└── tsconfig.json            # TypeScript 配置
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm 9+ (推荐) 或 npm/yarn
- Supabase 账号

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/ant-ai-nav.git
cd ant-ai-nav
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填写必要的环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **初始化数据库**

在 Supabase 控制台的 SQL Editor 中执行 `database/00_schema.sql` 文件中的 SQL 语句。

5. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:5000 查看效果。

---

## ⚙️ 环境变量配置

项目支持两种部署环境：**Coze 环境** 和 **独立服务器环境**。

### 必需环境变量

| 变量名 | Coze 环境 | 独立服务器 | 说明 |
|--------|----------|-----------|------|
| Supabase URL | `COZE_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| Supabase Key | `COZE_SUPABASE_ANON_KEY` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |

### 可选环境变量

| 变量名 | 说明 |
|--------|------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥（AI 功能） |
| `S3_ACCESS_KEY_ID` | S3 访问密钥 ID（文件上传） |
| `S3_SECRET_ACCESS_KEY` | S3 访问密钥（文件上传） |
| `S3_BUCKET_NAME` | S3 存储桶名称 |
| `S3_REGION` | S3 区域 |
| `S3_ENDPOINT` | S3 端点 URL |

### 环境变量命名优先级

项目支持多种环境变量命名方式，按以下优先级读取：

**Supabase URL:**
1. `NEXT_PUBLIC_SUPABASE_URL` ⭐ 推荐
2. `COZE_SUPABASE_URL` ⭐ Coze 环境
3. `SUPABASE_URL`

**Supabase Anon Key:**
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⭐ 推荐
2. `COZE_SUPABASE_ANON_KEY` ⭐ Coze 环境
3. `SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`

### 检查环境配置

```bash
# 验证环境变量配置
pnpm tsx scripts/check-env.ts

# 显示详细配置信息
pnpm tsx scripts/check-env.ts --config

# JSON 格式输出（适合 CI/CD）
pnpm tsx scripts/check-env.ts --json
```

---

## 🗄️ 数据库配置

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 创建账号
2. 创建新项目，记录项目 URL 和 anon key
3. 在 SQL Editor 中执行数据库初始化脚本

### 数据表结构

主要数据表：

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `categories` | 分类表 |
| `ai_tools` | AI 工具表 |
| `ai_news` | AI 资讯表 |
| `ai_hall_of_fame` | AI 名人堂表 |
| `ai_timeline` | AI 大事纪表 |
| `friend_links` | 友情链接表 |
| `comments` | 评论表 |
| `favorites` | 收藏表 |
| `site_settings` | 站点设置 |
| `smtp_settings` | SMTP设置 |
| `seo_settings` | SEO设置 |

详细结构请参考 `database/00_schema.sql`。

---

## 🚢 部署指南

### 选择部署环境

本项目支持两种部署方式：

- **Coze 环境** - 适合快速部署，无需管理服务器
- **独立服务器** - 适合自托管，完全控制环境

详细部署指南：
- 📘 [完整部署指南](./docs/deployment-guide.md)
- 📗 [Coze 环境部署](./docs/coze-deployment.md)

### Coze 环境部署

#### 1. 配置环境变量

在 Coze 平台设置以下环境变量：

```bash
# 必需配置
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key

# 或使用标准命名
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 功能（可选）
COZE_WORKLOAD_IDENTITY_API_KEY=your-coze-api-key
```

#### 2. 部署应用

1. 在 Coze 平台创建应用
2. 连接 Git 仓库
3. 点击部署

### 独立服务器部署

#### Vercel 部署

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

#### Docker 部署

```bash
# 构建镜像
docker build -t ant-ai-nav .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  ant-ai-nav
```

#### Docker Compose 部署

```bash
# 配置环境变量
cp .env.example.standalone .env.local

# 启动服务
docker-compose up -d
```

#### PM2 部署

```bash
# 构建项目
pnpm install
pnpm run build

# 启动服务
pm2 start pnpm --name "ant-ai-nav" -- start
```

---

## 📦 数据迁移

### 功能概述

管理后台提供完整的数据迁移功能，支持：

#### 导出模式
| 模式 | 说明 |
|------|------|
| 全部导出 | 包含所有数据（含用户信息） |
| 业务数据 | 不含用户信息（推荐迁移） |
| 内容数据 | 核心内容（工具/资讯/名人堂等） |
| 设置数据 | 系统配置（站点/SMTP/SEO等） |
| 自定义 | 手动选择需要的表 |

#### 导入模式
| 模式 | 说明 |
|------|------|
| 合并模式 | 保留现有数据，更新/新增（推荐） |
| 替换模式 | 清空现有数据后导入（谨慎使用） |

### 使用方法

1. 访问管理后台 → 数据迁移
2. 选择导出模式或自定义表
3. 点击导出下载JSON文件
4. 在目标环境导入数据

---

## 📝 开发指南

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS

### 添加新组件

```bash
npx shadcn@latest add component-name
```

### API 开发

API 路由位于 `src/app/api/` 目录，遵循 RESTful 设计：

```
GET    /api/tools        # 获取列表
POST   /api/tools        # 创建
GET    /api/tools/[id]   # 获取详情
PUT    /api/tools/[id]   # 更新
DELETE /api/tools/[id]   # 删除
```

---

## 🤝 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE)

---

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)
