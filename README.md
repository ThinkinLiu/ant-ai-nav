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
  - [宝塔部署](#宝塔部署)
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

### 宝塔部署

宝塔面板是一款流行的Linux服务器管理面板，以下是详细的部署步骤。

#### 1. 环境准备

**宝塔面板要求**：
- 宝塔面板 7.0+
- 操作系统：CentOS 7+ / Ubuntu 18+ / Debian 10+

**安装宝塔面板**（如已安装可跳过）：
```bash
# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && bash install.sh
```

#### 2. 安装必要软件

在宝塔面板【软件商店】中安装：
- **Nginx** 1.20+（必装）
- **PM2管理器** 4.0+（必装，用于Node.js进程管理）
- **PostgreSQL** 14+（可选，如自建数据库）

#### 3. 安装 Node.js

在宝塔面板中：

1. 进入【软件商店】→【PM2管理器】→【设置】
2. 点击【版本管理】，安装 **Node.js 18+** 或 **Node.js 20 LTS**
3. 或通过终端安装：
```bash
# 使用宝塔的一键安装脚本
bash <(curl -s https://nodejs.org/dist/latest-v20.x/SHASUMS256.txt)
```

验证安装：
```bash
node -v   # 应显示 v20.x.x
npm -v    # 应显示 10.x.x
pnpm -v   # 如未安装pnpm，执行：npm install -g pnpm
```

#### 4. 上传项目代码

**方式一：Git克隆（推荐）**
```bash
# SSH连接服务器，进入网站目录
cd /www/wwwroot

# 克隆项目
git clone https://github.com/your-username/ant-ai-nav.git

# 进入项目目录
cd ant-ai-nav
```

**方式二：宝塔文件管理器**
1. 在宝塔面板【文件】中，进入 `/www/wwwroot`
2. 创建项目文件夹 `ant-ai-nav`
3. 上传本地打包好的项目文件（包含 `package.json`、`src/` 等）

#### 5. 安装依赖并构建

通过SSH终端或宝塔【终端】执行：

```bash
cd /www/wwwroot/ant-ai-nav

# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
```

编辑环境变量文件：
```bash
nano .env.local
# 或使用宝塔文件编辑器
```

填写必要的环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# 如需文件上传功能，配置S3相关信息
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://your-endpoint.com
```

构建项目：
```bash
# 执行构建
pnpm build
```

#### 6. 配置 PM2 进程管理

**方式一：通过宝塔面板**
1. 进入【软件商店】→【PM2管理器】→【设置】
2. 点击【添加项目】
3. 填写配置：
   - **项目名称**：`ant-ai-nav`
   - **运行目录**：`/www/wwwroot/ant-ai-nav`
   - **启动文件**：留空（使用npm脚本）
   - **启动命令**：`pnpm start`
   - **端口**：`3000`（或自定义端口如5000）

**方式二：通过终端**
```bash
cd /www/wwwroot/ant-ai-nav

# 启动项目
pm2 start npm --name "ant-ai-nav" -- run start

# 保存PM2配置（开机自启）
pm2 save

# 查看运行状态
pm2 status

# 查看日志
pm2 logs ant-ai-nav
```

常用PM2命令：
```bash
pm2 restart ant-ai-nav   # 重启项目
pm2 stop ant-ai-nav      # 停止项目
pm2 delete ant-ai-nav    # 删除项目
pm2 monit                # 监控面板
```

#### 7. 配置 Nginx 反向代理

在宝塔面板中：

1. 进入【网站】→【添加站点】
2. 填写域名（如 `example.com`）
3. 点击站点设置，进入【配置文件】

修改Nginx配置：
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # 访问日志
    access_log /www/wwwlogs/ant-ai-nav.log;
    error_log /www/wwwlogs/ant-ai-nav.error.log;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # 图片等静态文件
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

4. 保存配置后，点击【重载配置】

#### 8. 配置 SSL 证书（HTTPS）

**方式一：宝塔免费证书（推荐）**
1. 在站点设置中，进入【SSL】→【Let's Encrypt】
2. 勾选域名，点击【申请】
3. 申请成功后，开启【强制HTTPS】

**方式二：自有证书**
1. 在站点设置中，进入【SSL】→【其他证书】
2. 粘贴证书内容（PEM格式）和私钥
3. 保存并开启【强制HTTPS】

**方式三：通配符证书**
```bash
# 使用 acme.sh 申请通配符证书
curl https://get.acme.sh | sh
acme.sh --issue -d example.com -d "*.example.com" --dns dns_cf
```

#### 9. 防火墙与安全配置

在宝塔面板中：

1. 进入【安全】，确保以下端口开放：
   - `80`（HTTP）
   - `443`（HTTPS）
   - `22`（SSH）

2. 配置应用防火墙（可选）：
   - 安装【Nginx防火墙】插件
   - 配置CC防护、SQL注入防护等

#### 10. 更新部署

当代码更新后，执行以下步骤：

```bash
cd /www/wwwroot/ant-ai-nav

# 拉取最新代码
git pull origin main

# 安装新依赖（如有）
pnpm install

# 重新构建
pnpm build

# 重启PM2进程
pm2 restart ant-ai-nav

# 查看日志确认
pm2 logs ant-ai-nav --lines 50
```

#### 11. 常见问题

**Q1: 端口被占用**
```bash
# 查看端口占用
netstat -tunlp | grep 3000

# 结束占用进程
kill -9 <PID>
```

**Q2: 构建内存不足**
```bash
# 临时增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**Q3: 环境变量未生效**
```bash
# 确保 .env.local 文件存在且格式正确
cat .env.local

# 重启PM2进程
pm2 restart ant-ai-nav
```

**Q4: Nginx 502 Bad Gateway**
```bash
# 检查PM2进程是否运行
pm2 status

# 检查端口是否监听
netstat -tunlp | grep 3000

# 查看错误日志
pm2 logs ant-ai-nav --err
```

#### 12. 性能优化建议

1. **开启 Nginx Gzip 压缩**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **配置 CDN 加速**
   - 使用宝塔的【CDN加速】插件
   - 或接入第三方CDN（如阿里云CDN、腾讯云CDN）

3. **数据库优化**
   - 定期备份 Supabase 数据
   - 添加必要的索引

4. **监控告警**
   - 安装宝塔【监控报表】插件
   - 配置 CPU/内存/磁盘告警阈值

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
