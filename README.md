# 🐜 蚂蚁AI导航

<div align="center">

**一个现代化的 AI 工具导航平台，支持工具发布、审核、浏览、评论和收藏，并内置 AI 资讯、AI 名人堂、AI 大事纪等核心内容模块。**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**[在线演示](#-快速开始)** · **[功能特性](#-功能特性)** · **[部署指南](#-部署指南)** · **[GitHub构建](./GITHUB_BUILD.md)** · **[贡献指南](#-贡献指南)**

</div>

---

## ✨ 功能特性

### 🎯 核心功能

- **📂 工具展示** - 分类展示 AI 工具，支持搜索、筛选、排序
- **📝 工具发布** - 发布者可提交新工具，支持富文本描述、图标上传
- **✅ 审核系统** - 管理员审核工具，支持通过/拒绝/重新审核
- **🔝 工具置顶** - 管理员可将优质工具置顶展示
- **💬 用户评论** - 用户可对工具进行评分和评论
- **⭐ 评论精选** - 管理员可将优质评论设为精选
- **❤️ 收藏功能** - 用户可收藏感兴趣的工具
- **🔐 用户认证** - 支持邮箱注册/登录，邮箱验证码验证
- **🔗 相关推荐** - 工具详情页展示相关工具推荐
- **⏰ 会话管理** - 30分钟无操作自动登出，保障安全
- **🏷️ 标签系统** - 工具标签支持，便于分类和搜索

### 📰 内容管理

- **📰 AI资讯** - 发布AI行业资讯，支持审核流程、自动发布、富文本编辑
- **👤 AI名人堂** - 管理AI领域杰出人物，支持自动生成、富文本编辑
- **📅 AI大事纪** - 记录AI发展里程碑，支持自动生成、富文本编辑
- **🔗 友情链接** - 友情链接管理与审核
- **📊 AI工具排行榜** - 实时追踪全球热门AI工具流量数据，每日更新

### 🔧 系统管理

- **📦 数据迁移** - 支持多模式数据导出/导入，便于环境迁移
- **🔍 SEO设置** - 自定义网站SEO信息
- **📧 SMTP配置** - 邮件服务配置，支持验证码发送
- **🌐 流量来源管理** - 配置排行榜数据源，支持多平台同步
- **👤 发布者申请审核** - 管理用户申请成为发布者
- **🤖 批量工具生成** - 一键批量生成AI工具数据

### 🤖 AI智能功能

- **📰 自动发布AI资讯** - 输入日期，自动搜索并生成资讯
- **👤 自动生成AI名人堂** - 输入姓名，自动搜索并生成人物信息
- **📅 自动生成AI大事纪** - 自动搜索并生成历史事件
- **🔧 AI生成工具信息** - 输入工具名称和官网，自动生成描述、分类、标签
- **🖼️ 图标智能显示** - 根据logo字段类型自动选择最佳显示方式

### 🎨 界面特性

- 📱 响应式设计，完美适配移动端
- 🌓 深色/浅色主题切换
- ✨ 流畅的动画效果
- 🔍 SEO 优化
- 📝 富文本编辑器支持（Markdown + 实时预览）
- 🏷️ 标签输入组件

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
| AI能力 | Coze SDK (Web Search, LLM, Embedding) |
| 编辑器 | @uiw/react-md-editor, Quill.js |
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
│   │   ├── publisher/       # 发布者中心
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
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
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
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 功能（可选）
COZE_WORKLOAD_IDENTITY_API_KEY=your-coze-api-key
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret
```

4. **初始化数据库**

在 Supabase 控制台的 SQL Editor 中执行 `database/00_schema.sql` 文件中的 SQL 语句。

5. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:5000 查看效果。
[Ant AI Nav演示地址](https://ai.mayiai.site/)

---

## ⚙️ 环境变量配置

### 必需环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase 控制台 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase 控制台 |

### 可选环境变量

| 变量名 | 说明 | 用途 |
|--------|------|------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 | AI 功能 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | Coze 客户端 ID | AI 功能 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | Coze 客户端密钥 | AI 功能 |
| `S3_ACCESS_KEY_ID` | S3 访问密钥 ID | 文件上传 |
| `S3_SECRET_ACCESS_KEY` | S3 访问密钥 | 文件上传 |
| `S3_BUCKET_NAME` | S3 存储桶名称 | 文件上传 |
| `S3_REGION` | S3 区域 | 文件上传 |
| `S3_ENDPOINT` | S3 端点 URL | 文件上传 |

### 环境变量命名优先级

项目支持多种环境变量命名方式：

**Supabase URL:**
1. `NEXT_PUBLIC_SUPABASE_URL` ⭐ 推荐
2. `COZE_SUPABASE_URL` ⭐ Coze 环境
3. `SUPABASE_URL`

**Supabase Anon Key:**
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⭐ 推荐
2. `COZE_SUPABASE_ANON_KEY` ⭐ Coze 环境
3. `SUPABASE_ANON_KEY`

---

## 🗄️ 数据库配置

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 创建账号
2. 创建新项目，记录项目 URL 和 anon key
3. 在 SQL Editor 中执行数据库初始化脚本

### 数据表结构

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

本项目支持多种部署方式：

### 🤖 GitHub Actions 构建（推荐）

使用 GitHub Actions 在云端构建项目，无需本地环境：

**三种构建模式**：
- 🐳 **Docker 镜像构建** - 构建并导出 Docker 镜像，适合服务器部署
- 📄 **静态导出构建** - 构建静态文件，适合 CDN/Nginx 部署
- ✅ **CI 自动构建** - 每次推送自动运行，用于代码检查

**快速开始**：
1. 配置 GitHub Secrets（Supabase URL 和 Key）
2. 进入 Actions 标签，选择构建模式
3. 点击运行，等待构建完成
4. 下载构建产物并部署

详细指南：📘 [GitHub 构建快速开始](./GITHUB_BUILD.md) | 📗 [完整文档](./docs/github-actions-guide.md)

### Coze 环境部署

在 Coze 平台设置环境变量后直接部署。

详细指南：📘 [Coze 环境部署](./docs/coze-deployment.md)

### Vercel 部署

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

### Docker 部署

#### 方式一：使用 GitHub Actions 构建（推荐）

适用于低内存服务器，在云端构建后下载到本地部署。

**首次部署**：

1. **配置 GitHub Secrets**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加 Secrets：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **触发构建**
   - 进入 Actions 标签
   - 点击 **Build and Export Docker Image**
   - 选择分支（如 main）
   - 点击 **Run workflow**

3. **下载构建产物**
   - 等待构建完成（约 5-10 分钟）
   - 在运行记录底部下载 `docker-image` 文件

4. **上传到服务器**
   ```bash
   scp ant-ai-nav.tar.gz user@your-server:/tmp/
   ```

5. **在服务器上加载镜像**
   ```bash
   docker load < /tmp/ant-ai-nav.tar.gz
   ```

6. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填写 Supabase 配置
   ```

7. **启动服务**
   ```bash
   docker-compose up -d
   ```

8. **验证部署**
   ```bash
   curl http://localhost:5000
   ```

**更新步骤**：

```bash
# 方法 1: 使用更新脚本（推荐）

# 1. 重新触发 GitHub Actions 构建
# 2. 下载新的构建产物

# 3. 将文件上传到服务器
scp ant-ai-nav.tar.gz user@your-server:/path/to/ant-ai-nav/

# 4. 运行更新脚本
cd /path/to/ant-ai-nav
./scripts/update-docker.sh

# 方法 2: 手动更新

# 1. 停止并删除旧容器
docker-compose down

# 2. 删除旧镜像
docker rmi ant-ai-nav:latest

# 3. 加载新镜像
docker load < ant-ai-nav-new.tar.gz

# 4. 启动新容器
docker-compose up -d

# 5. 查看日志确认启动成功
docker-compose logs -f
```

#### 验证更新

更新完成后，执行以下命令验证：

```bash
# 1. 检查容器状态
docker-compose ps
# 应该显示 "Up" 状态

# 2. 检查服务响应
curl http://localhost:5000
# 应该返回 HTML 内容

# 3. 查看日志确认无错误
docker-compose logs --tail=50

# 4. 检查镜像版本
docker images ant-ai-nav
# 确认是最新版本

# 5. 访问浏览器
# 打开 http://your-domain.com 确认页面正常
```

---

#### 方式二：本地构建

适用于服务器资源充足的情况。

**首次部署**：

```bash
# 1. 克隆项目
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
cd ant-ai-nav

# 2. 配置环境变量
cp .env.docker .env
# 编辑 .env 文件

# 3. 构建镜像
docker build -t ant-ai-nav:latest .

# 4. 启动服务
docker-compose up -d
```

**更新步骤**：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 停止旧容器
docker-compose down

# 3. 重新构建镜像
docker build -t ant-ai-nav:latest .

# 4. 启动新容器
docker-compose up -d
```

---

#### 常用 Docker 命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 删除容器和卷（⚠️ 会删除数据）
docker-compose down -v

# 进入容器
docker-compose exec app sh

# 查看资源使用
docker stats ant-ai-nav

# 查看容器详情
docker inspect ant-ai-nav

# 备份数据
docker exec ant-ai-nav sh -c "cd /app && tar -czf /tmp/backup.tar.gz ."
docker cp ant-ai-nav:/tmp/backup.tar.gz ./backup.tar.gz
```

#### 故障排查

```bash
# 查看详细日志
docker-compose logs --tail=100

# 检查容器健康状态
docker inspect ant-ai-nav | grep -A 10 Health

# 查看端口占用
docker-compose ps
netstat -tulpn | grep 5000

# 重启容器（如果卡死）
docker-compose restart

# 完全清理并重新部署
docker-compose down -v
docker rmi ant-ai-nav:latest
docker-compose up -d
```

#### 环境变量配置

在 `.env` 文件中配置（必需）：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 端口配置
PORT=5000
```

**详细指南**：
- 📘 [1GB 服务器部署](./docs/deploy-1gb-server.md)（推荐）
- 📗 [Docker 部署](./docs/deploy-docker.md)
- 📙 [完整部署指南](./docs/deployment-guide.md)

### PM2 部署

```bash
# 构建项目
pnpm install
pnpm run build

# 启动服务
pm2 start pnpm --name "ant-ai-nav" -- start
```

---

## 📦 数据迁移

管理后台提供完整的数据迁移功能：

### 导出模式
- **全部导出** - 包含所有数据（含用户信息）
- **业务数据** - 不含用户信息（推荐迁移）
- **内容数据** - 核心内容（工具/资讯/名人堂等）
- **设置数据** - 系统配置（站点/SMTP/SEO等）
- **自定义** - 手动选择需要的表

### 导入模式
- **合并模式** - 保留现有数据，更新/新增（推荐）
- **替换模式** - 清空现有数据后导入（谨慎使用）

---

## 👥 用户角色

| 角色 | 权限 |
|------|------|
| 普通用户 | 浏览工具、评论、收藏 |
| 发布者 | 普通用户权限 + 发布工具、发布资讯 |
| 管理员 | 全部权限 + 审核管理 |

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

欢迎贡献代码！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

---

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE)

---

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)
- [Coze](https://www.coze.cn/)

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/ThinkinLiu/ant-ai-nav/issues)
- 发起 [Pull Request](https://github.com/ThinkinLiu/ant-ai-nav/pulls)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ by [Ant AI Nav](https://ai.mayiai.site/) Team

</div>
