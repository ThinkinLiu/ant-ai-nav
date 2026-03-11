# 🐜 蚂蚁AI导航

<div align="center">

一个现代化的 AI 工具导航平台，支持工具发布、审核、浏览、评论和收藏。

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
  - [Vercel 部署](#vercel-部署)
  - [Docker 部署](#docker-部署)
  - [自托管部署](#自托管部署)
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
- **用户认证** - 支持邮箱注册/登录，角色权限管理

### 👥 用户角色

| 角色 | 权限 |
|------|------|
| 普通用户 | 浏览工具、评论、收藏 |
| 发布者 | 普通用户权限 + 发布工具 |
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
| 图标 | Lucide Icons |

---

## 📁 项目结构

```
├── public/                  # 静态资源
├── scripts/                 # 部署脚本
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # 管理后台页面
│   │   ├── api/             # API 路由
│   │   ├── categories/      # 分类页面
│   │   ├── favorites/       # 收藏页面
│   │   ├── login/           # 登录页面
│   │   ├── profile/         # 个人中心
│   │   ├── publisher/       # 发布者页面
│   │   ├── register/        # 注册页面
│   │   ├── tools/           # 工具详情/列表
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 首页
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

在 Supabase 控制台的 SQL Editor 中执行 `database/schema.sql` 文件中的 SQL 语句。

5. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:3000 查看效果。

---

## ⚙️ 环境变量配置

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `S3_ACCESS_KEY_ID` | ❌ | S3 访问密钥 ID (文件上传) |
| `S3_SECRET_ACCESS_KEY` | ❌ | S3 访问密钥 (文件上传) |
| `S3_BUCKET_NAME` | ❌ | S3 存储桶名称 |
| `S3_REGION` | ❌ | S3 区域 |
| `S3_ENDPOINT` | ❌ | S3 端点 URL |

---

## 🗄️ 数据库配置

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 创建账号
2. 创建新项目，记录项目 URL 和 anon key
3. 在 SQL Editor 中执行数据库初始化脚本

### 数据表结构

主要数据表：

- `users` - 用户表
- `categories` - 分类表
- `ai_tools` - AI 工具表
- `comments` - 评论表
- `favorites` - 收藏表

详细结构请参考 `database/schema.sql`。

---

## 📦 部署指南

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ant-ai-nav)

1. Fork 本项目
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 点击部署

### Docker 部署

```bash
# 构建镜像
docker build -t ant-ai-nav .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  ant-ai-nav
```

或使用 Docker Compose：

```bash
# 配置环境变量
cp .env.example .env

# 启动服务
docker-compose up -d
```

### 自托管部署

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 启动生产服务
pnpm start
```

建议使用 PM2 管理进程：

```bash
pnpm add -g pm2
pm2 start npm --name "ant-ai-nav" -- start
```

---

## 🔧 开发指南

### 本地开发

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm ts-check

# 代码检查
pnpm lint
```

### 添加新组件

```bash
# 使用 shadcn/ui 添加组件
npx shadcn@latest add button
```

### 数据库迁移

如需修改数据库结构，请在 Supabase 控制台执行 SQL，并同步更新 `src/storage/database/shared/schema.ts`。

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

---

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Supabase](https://supabase.com/) - 后端服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库

---

<div align="center">

如果这个项目对你有帮助，请给一个 ⭐️ 支持一下！

</div>
