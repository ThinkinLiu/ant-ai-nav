# GitHub Actions 构建指南

本文档介绍如何在 GitHub 上使用 Actions 自动化构建项目。

---

## 📋 可用的构建工作流

项目提供了三种构建工作流：

### 1. CI - 持续集成（自动触发）

**文件**: `.github/workflows/ci.yml`

**触发条件**:
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 分支

**功能**:
- ✅ 类型检查
- ✅ 依赖安装
- ✅ 项目构建
- ✅ 上传构建产物

**不需要配置**：此工作流会自动运行，用于代码质量检查。

---

### 2. Build Docker Image（手动触发）

**文件**: `.github/workflows/build-docker.yml`

**触发方式**: 在 GitHub Actions 页面手动触发

**功能**:
- 🐳 构建 Docker 镜像
- 📦 导出为 tar.gz 格式
- ⬇️ 下载构建产物

**适用于**: 低内存服务器，在云端构建后下载到本地部署。

---

### 3. Build Static Export（手动触发）

**文件**: `.github/workflows/build-static.yml`

**触发方式**: 在 GitHub Actions 页面手动触发

**功能**:
- 📄 构建静态导出
- 📦 打包为 tar.gz 格式
- ⬇️ 下载构建产物

**适用于**: 静态托管平台（如 Nginx、CDN）。

---

## 🚀 快速开始

### 第一步：配置 GitHub Secrets

在 GitHub 仓库中配置必要的环境变量：

1. 进入仓库设置 → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 Secrets：

| Secret 名称 | 说明 | 是否必需 |
|-------------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ 是 |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 | ❌ 否 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | Coze 客户端 ID | ❌ 否 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | Coze 客户端密钥 | ❌ 否 |
| `COZE_INTEGRATION_BASE_URL` | Coze API 基础 URL | ❌ 否 |

#### 如何获取 Supabase 配置：

1. 登录 [Supabase](https://supabase.com)
2. 进入项目 → **Settings** → **API**
3. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 第二步：选择构建方式

#### 方式 1: CI 自动构建（推荐用于开发）

CI 工作流会自动运行，无需手动操作。

**查看构建状态**:
1. 进入仓库的 **Actions** 标签
2. 查看最新的 CI 工作流运行记录
3. 点击运行记录查看详细日志

**下载构建产物**:
1. 进入 CI 工作流运行记录
2. 滚动到底部找到 **Artifacts**
3. 下载 `build-output` 文件

---

#### 方式 2: Docker 镜像构建（推荐用于生产部署）

**步骤**:

1. 进入仓库的 **Actions** 标签
2. 找到 **Build and Export Docker Image** 工作流
3. 点击 **Run workflow**
4. 选择要构建的分支（默认 `main`）
5. 点击绿色的 **Run workflow** 按钮

**下载 Docker 镜像**:
1. 等待构建完成（通常需要 5-10 分钟）
2. 进入运行记录
3. 滚动到底部找到 **Artifacts**
4. 下载 `docker-image` 文件（约 200-500MB）

**在服务器上加载镜像**:
```bash
# 1. 上传到服务器
scp ant-ai-nav.tar.gz user@your-server:/tmp/

# 2. 在服务器上解压
docker load < /tmp/ant-ai-nav.tar.gz

# 3. 启动容器
docker run -d \
  --name ant-ai-nav \
  -p 5000:5000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  ant-ai-nav:latest

# 4. 查看日志
docker logs -f ant-ai-nav
```

---

#### 方式 3: 静态导出构建（推荐用于静态托管）

**步骤**:

1. 进入仓库的 **Actions** 标签
2. 找到 **Build Static Export** 工作流
3. 点击 **Run workflow**
4. 选择要构建的分支（默认 `main`）
5. 点击绿色的 **Run workflow** 按钮

**下载静态文件**:
1. 等待构建完成
2. 进入运行记录
3. 滚动到底部找到 **Artifacts**
4. 下载 `static-export` 文件

**部署到 Nginx**:
```bash
# 1. 上传到服务器
scp static-export.tar.gz user@your-server:/tmp/

# 2. 解压到网站目录
cd /var/www
tar -xzf /tmp/static-export.tar.gz

# 3. 配置 Nginx
# 编辑 /etc/nginx/sites-available/ant-ai-nav
# 添加以下配置：

server {
    listen 80;
    server_name your-domain.com;

    root /var/www/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /_next/static {
        alias /var/www/.next/static;
    }
}

# 4. 重启 Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📊 构建产物说明

### CI 工作流产物

| 产物名称 | 内容 | 大小 | 用途 |
|---------|------|------|------|
| `build-output` | `.next/` 和 `public/` 目录 | ~50-100MB | 开发测试 |

### Docker 工作流产物

| 产物名称 | 内容 | 大小 | 用途 |
|---------|------|------|------|
| `docker-image` | Docker 镜像 tar.gz 文件 | ~200-500MB | 服务器部署 |

### Static 工作流产物

| 产物名称 | 内容 | 大小 | 用途 |
|---------|------|------|------|
| `static-export` | 静态导出文件 | ~100-200MB | 静态托管 |

---

## 🔧 常见问题

### Q1: 构建失败，提示 "Missing environment variables"

**原因**: GitHub Secrets 未配置或配置错误。

**解决方案**:
1. 检查 Secrets 是否正确配置
2. 确认 Secret 名称拼写正确（区分大小写）
3. 确认 Secret 值没有多余的空格或引号

---

### Q2: Docker 镜像构建失败，提示 "Out of memory"

**原因**: GitHub Actions 内存限制。

**解决方案**:
项目已优化构建配置，使用 `--max-old-space-size=768` 限制内存。如果仍然失败：
1. 检查 `next.config.ts` 中的内存配置
2. 减少 `optimizePackageImports` 中的包列表

---

### Q3: 下载的产物无法使用

**原因**: 产物文件损坏或版本不兼容。

**解决方案**:
1. 重新运行工作流
2. 重新下载产物
3. 验证文件完整性（tar.gz 应该可以正常解压）

---

### Q4: 如何在本地验证 GitHub Actions 配置？

**使用 act 工具**:
```bash
# 安装 act
brew install act  # macOS
# 或
sudo apt install act  # Linux

# 在本地运行工作流
act push
```

---

## 🎯 最佳实践

### 1. 分支策略

- `main` 分支：生产环境，CI 自动运行
- `develop` 分支：开发环境，CI 自动运行
- `feature/*` 分支：功能分支，PR 时运行 CI

### 2. Secrets 管理

- ✅ 不要在代码中硬编码密钥
- ✅ 使用 GitHub Secrets 存储敏感信息
- ✅ 定期轮换 API 密钥
- ✅ 限制 Secrets 访问权限

### 3. 构建优化

- ✅ 使用缓存加速构建（actions/setup-node）
- ✅ 冻结 lockfile（pnpm install --frozen-lockfile）
- ✅ 并行化任务（如果适用）

### 4. 监控和告警

- ✅ 启用 GitHub Actions 通知
- ✅ 定期检查构建失败日志
- ✅ 设置构建失败告警

---

## 📚 参考资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Docker 官方文档](https://docs.docker.com/)
- [项目 Dockerfile](../Dockerfile)
- [项目部署指南](./deployment-guide.md)

---

## 💡 提示

- 📌 构建产物会保留 7 天，请及时下载
- 📌 每个账户每月有 2000 分钟的免费构建时间
- 📌 建议在非高峰时段触发构建
- 📌 可以在 Workflow 运行日志中查看详细的构建过程

---

**更新时间**: 2026-04-01
