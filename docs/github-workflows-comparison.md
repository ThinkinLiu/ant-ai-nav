# GitHub Actions 工作流对比

## 工作流说明

本项目提供两个 GitHub Actions 工作流，分别适用于不同的部署场景：

### 1. Build Static Export

**适用场景**：服务器有 Docker 环境，可以构建镜像

**生成内容**：
- Next.js 构建输出（`.next/`）
- 静态资源（`public/`）
- 打包为 `static-export.tar.gz`

**使用方法**：

```bash
# 1. 下载构建产物
wget static-export.tar.gz

# 2. 解压
tar -xzf static-export.tar.gz

# 3. 使用 Dockerfile 构建镜像
docker build -t ant-ai-nav:latest .

# 4. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

**优点**：
- 构建时间短（约 3-5 分钟）
- 文件体积小
- 灵活，可以在服务器上重新构建

**缺点**：
- 需要在服务器上安装 Docker
- 需要在服务器上构建镜像
- 依赖 Dockerfile

---

### 2. Build Docker Image（推荐）

**适用场景**：希望直接使用预构建的 Docker 镜像

**生成内容**：
- 完整的 Docker 镜像
- 打包为 `docker-image.tar.gz`

**使用方法**：

```bash
# 1. 下载构建产物
wget docker-image.tar.gz

# 2. 加载镜像
docker load < docker-image.tar.gz

# 3. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 或者使用 docker-compose
docker-compose up -d
```

**优点**：
- 一步到位，直接加载运行
- 无需在服务器上构建
- 镜像已在云端构建完成

**缺点**：
- 构建时间较长（约 8-15 分钟）
- 文件体积较大（包含完整镜像）
- 依赖 GitHub Actions 环境

---

## 快速选择指南

### 场景 1：我有 Docker 环境，且服务器性能较好

**推荐**：使用 **Build Docker Image**

```bash
# 1. 在 GitHub Actions 运行 "Build Docker Image"
# 2. 下载 docker-image.tar.gz
# 3. 加载并运行
docker load < docker-image.tar.gz
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

### 场景 2：服务器性能有限，但可以构建

**推荐**：使用 **Build Static Export**

```bash
# 1. 在 GitHub Actions 运行 "Build Static Export"
# 2. 下载 static-export.tar.gz
# 3. 解压并构建
tar -xzf static-export.tar.gz
docker build -t ant-ai-nav:latest .
docker run -d -p 5000:5000 --name ant-ai-nav:latest
```

### 场景 3：不需要 Docker，直接运行 Node.js

**推荐**：使用 **Build Static Export**

```bash
# 1. 下载 static-export.tar.gz
# 2. 解压
tar -xzf static-export.tar.gz

# 3. 使用 Node.js 运行
cd .next/standalone/workspace/projects
node server.js
```

---

## 详细步骤

### 使用 Build Docker Image

#### 1. 运行工作流

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **Build Docker Image** 工作流
3. 点击 **Run workflow**
4. 选择分支（默认 `main`）
5. 设置镜像标签（可选，默认 `latest`）
6. 点击绿色 **Run workflow** 按钮
7. 等待构建完成（约 8-15 分钟）

#### 2. 下载镜像

构建完成后：

1. 点击进入该次运行记录
2. 滚动到底部，在 **Artifacts** 部分下载 `docker-image.tar.gz`

#### 3. 加载并运行

```bash
# 加载镜像
docker load < docker-image.tar.gz

# 验证镜像
docker images ant-ai-nav

# 运行容器
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  -v /opt/ant-ai-nav/config:/app/config \
  --restart unless-stopped \
  ant-ai-nav:latest

# 查看日志
docker logs -f ant-ai-nav

# 访问配置页面
# http://your-server-ip:5000/settings
```

#### 4. 使用 docker-compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    image: ant-ai-nav:latest
    container_name: ant-ai-nav
    ports:
      - "5000:5000"
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

启动：

```bash
docker-compose up -d
```

---

### 使用 Build Static Export

#### 1. 运行工作流

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **Build Static Export** 工作流
3. 点击 **Run workflow**
4. 选择分支（默认 `main`）
5. 点击绿色 **Run workflow** 按钮
6. 等待构建完成（约 3-5 分钟）

#### 2. 下载构建产物

构建完成后：

1. 点击进入该次运行记录
2. 滚动到底部，在 **Artifacts** 部分下载 `static-export.tar.gz`

#### 3. 解压并部署

```bash
# 创建目录
mkdir -p /opt/ant-ai-nav
cd /opt/ant-ai-nav

# 解压构建产物
tar -xzf static-export.tar.gz

# 构建镜像
docker build -t ant-ai-nav:latest .

# 运行容器
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  -v ./config:/app/config \
  --restart unless-stopped \
  ant-ai-nav:latest
```

---

## 常见问题

### Q: `docker load < static-export.tar.gz` 报错？

**原因**：`static-export.tar.gz` 不是 Docker 镜像文件

**解决**：使用 `Build Docker Image` 工作流生成真正的镜像文件

### Q: 下载的文件太大？

**原因**：Docker 镜像包含完整的运行环境

**解决**：
- 使用 `Build Static Export` 减小文件体积
- 或者使用 GitHub Packages 存储镜像

### Q: 构建失败？

**可能原因**：
- Node.js 版本不兼容
- 依赖安装失败
- Supabase 配置问题

**解决**：
- 查看 GitHub Actions 日志
- 检查 Secrets 配置
- 参考 [调试指南](./github-actions-debug.md)

---

## 文件体积对比

| 工作流 | 文件名 | 体积 | 用途 |
|--------|--------|------|------|
| Build Static Export | static-export.tar.gz | ~50-100 MB | Next.js 构建文件 |
| Build Docker Image | docker-image.tar.gz | ~200-400 MB | 完整 Docker 镜像 |

---

## 性能对比

| 操作 | Build Static Export | Build Docker Image |
|------|-------------------|-------------------|
| GitHub Actions 构建 | 3-5 分钟 | 8-15 分钟 |
| 下载时间 | 1-2 分钟 | 3-5 分钟 |
| 服务器处理 | 需要构建（2-3 分钟） | 直接加载（1-2 分钟） |
| 总时间 | ~6-10 分钟 | ~12-22 分钟 |

---

## 相关文档

- [GitHub Actions 完整部署指南](./github-actions-deploy.md)
- [GitHub Actions 调试指南](./github-actions-debug.md)
- [Docker 部署指南](./deploy-docker.md)
- [项目状态总结](./project-status.md)

---

## 总结

| 场景 | 推荐工作流 | 命令 |
|------|-----------|------|
| 快速部署，服务器性能好 | Build Docker Image | `docker load < docker-image.tar.gz` |
| 服务器性能有限 | Build Static Export | `tar -xzf static-export.tar.gz && docker build` |
| 需要自定义构建 | Build Static Export | 解压后修改 Dockerfile 再构建 |
| 生产环境（推荐） | Build Docker Image | 使用预构建镜像，稳定可靠 |

---

**更新时间**: 2025-04-01
