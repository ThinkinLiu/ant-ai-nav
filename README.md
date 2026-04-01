# 蚂蚁AI导航 - 快速开始

欢迎使用蚂蚁AI导航！这是一个现代化的AI工具导航平台。

## 🚀 快速开始

### 方法 1：使用 GitHub Actions（推荐）

最简单的方式是使用 GitHub Actions 在云端构建项目，无需本地构建环境。

#### 1. 在 GitHub 上创建仓库

访问 https://github.com/new 创建新仓库 `ant-ai-nav`（或者 fork 本项目）

#### 2. 配置 Secrets（可选）

在 GitHub 仓库中配置以下 Secrets（构建时可以使用占位符）：

- 进入仓库 → **Settings** → **Secrets and variables** → **Actions**
- 点击 **New repository secret**，添加以下配置：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJ...` |

**注意**：这些配置是可选的。构建时可以使用占位符值（如 `demo-url`），部署后通过 `/settings` 页面配置真实的数据库连接。

#### 3. 推送代码到 GitHub

在沙箱环境或本地：

```bash
# 配置远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ant-ai-nav.git

# 提交代码
git add .
git commit -m "Initial commit"

# 推送到 GitHub（需要配置 Git 认证）
git push -u origin main
```

**Git 认证方法：**

- **使用 Token**：在 GitHub Settings → Developer settings → Personal access tokens 生成 Token，然后：
  ```bash
  git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/ant-ai-nav.git
  ```
- **使用 SSH**：配置 SSH 密钥并添加到 GitHub：
  ```bash
  git remote set-url origin git@github.com:YOUR_USERNAME/ant-ai-nav.git
  ```

#### 4. 触发构建

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **Build Static Export** 工作流
3. 点击 **Run workflow**，选择要构建的分支（默认 `main`）
4. 点击绿色 **Run workflow** 按钮
5. 等待构建完成（约 3-5 分钟）

#### 5. 下载并部署

构建完成后：

1. 在 Actions 页面点击进入该次运行记录
2. 滚动到底部，在 **Artifacts** 部分下载 `static-export.tar.gz`
3. 上传到目标服务器
4. 解压并启动：

```bash
# 创建目录
mkdir -p /opt/ant-ai-nav
cd /opt/ant-ai-nav

# 解压构建产物
tar -xzf static-export.tar.gz

# 启动服务（需要 docker-compose.yml）
docker-compose up -d
```

#### 6. 配置数据库

首次访问网站会自动跳转到 `/settings` 页面，填写 Supabase 连接信息即可。

**完整部署指南**：[GitHub Actions 完整部署指南](./docs/github-actions-deploy.md)

**调试问题**：[GitHub Actions 调试指南](./docs/github-actions-debug.md)

### 方法 2：本地构建 Docker 镜像

#### 1. 克隆项目

```bash
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
cd ant-ai-nav
```

#### 2. 配置 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: ant-ai-nav:latest
    container_name: ant-ai-nav
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

#### 3. 构建并启动

```bash
docker-compose up -d --build
```

#### 4. 配置数据库

访问 `http://localhost:5000/settings` 配置数据库连接信息。

### 方法 3：使用 npm/yarn（开发模式）

#### 1. 克隆项目

```bash
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
cd ant-ai-nav
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5000`

## 📦 部署方式

### Docker 部署（推荐）

```bash
# 构建镜像
docker build -t ant-ai-nav:latest .

# 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

### Docker Compose 部署

```bash
docker-compose up -d --build
```

### 宝塔面板部署

1. 安装宝塔面板
2. 创建网站（选择 Node.js 项目）
3. 上传项目文件
4. 配置环境变量
5. 启动项目

详细文档：[宝塔部署指南](./docs/deploy-baota.md)

## 🗄️ 数据库配置

### 使用 Supabase（推荐）

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 执行数据库初始化脚本（在 `database/` 目录）
4. 获取 Project URL 和 API Key
5. 在项目配置或 `/settings` 页面中填写连接信息

详细文档：[数据库部署指南](./docs/database-deployment.md)

### 运行时配置（无需构建时配置）

本项目支持运行时配置数据库连接信息：

- ✅ 构建时不需要预配置数据库信息
- ✅ 首次访问 `/settings` 页面配置
- ✅ 支持在 `/admin/settings` 管理后台修改
- ✅ 配置文件保存在服务器端

详细文档：[运行时配置指南](./docs/runtime-database-config.md)

## 🔧 环境变量

### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJ...` |

### 可选配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | `eyJhbGciOiJ...` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | `https://your-domain.com` |
| `NEXT_PUBLIC_SITE_NAME` | 站点名称 | `蚂蚁AI导航` |

详细文档：[环境变量指南](./docs/environment-variables.md)

## 📚 文档

### 部署相关
- [Docker 部署指南](./docs/deploy-docker.md) - 使用 Docker 部署
- [宝塔部署指南](./docs/deploy-baota.md) - 使用宝塔面板部署
- [GitHub Actions 部署指南](./docs/github-actions-deploy.md) - 使用 GitHub Actions 云端构建并部署
- [GitHub Actions 调试指南](./docs/github-actions-debug.md) - GitHub Actions 问题排查

### 数据库相关
- [数据库部署指南](./docs/database-deployment.md) - Supabase 数据库初始化
- [运行时配置指南](./docs/runtime-database-config.md) - 运行时数据库配置
- [运行时配置快速开始](./docs/runtime-config-quickstart.md) - 快速配置指南

### 管理相关
- [管理后台配置指南](./docs/admin-settings-guide.md) - 管理后台使用说明
- [环境变量指南](./docs/environment-variables.md) - 环境变量说明

### 其他
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署总览
- [AGENTS.md](./AGENTS.md) - 项目开发规范

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

MIT License

## 📞 联系方式

- GitHub: [ThinkinLiu/ant-ai-nav](https://github.com/ThinkinLiu/ant-ai-nav)
- Email: support@antai.com

---

**最后更新**: 2025-04-01
