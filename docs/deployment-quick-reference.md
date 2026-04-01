# 快速参考 - 选择正确的部署方法

## 一分钟快速开始

### 我想要最简单的方式

✅ **使用 Build Docker Image**

```bash
# 1. 在 GitHub Actions 运行 "Build Docker Image"
# 2. 下载 docker-image.tar.gz
# 3. 加载镜像
docker load < docker-image.tar.gz

# 4. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 5. 访问配置页面
# http://your-server-ip:5000/settings
```

---

### 我想要文件小、构建快

✅ **使用 Build Static Export**

```bash
# 1. 在 GitHub Actions 运行 "Build Static Export"
# 2. 下载 static-export.tar.gz
# 3. 解压
tar -xzf static-export.tar.gz

# 4. 构建镜像
docker build -t ant-ai-nav:latest .

# 5. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 6. 访问配置页面
# http://your-server-ip:5000/settings
```

---

## 常见错误与解决

### 错误：docker load < static-export.tar.gz 报错

**错误信息**：
```
open /var/lib/docker/tmp/docker-import-xxx/.next/json: no such file or directory
```

**原因**：`static-export.tar.gz` 不是 Docker 镜像文件

**解决**：
```bash
# 方法 1: 使用正确的命令
tar -xzf static-export.tar.gz
docker build -t ant-ai-nav:latest .

# 方法 2: 使用 Build Docker Image 工作流
# 重新运行工作流，下载 docker-image.tar.gz
docker load < docker-image.tar.gz
```

---

## 文件对比

| 文件名 | 大小 | 类型 | 用途 |
|--------|------|------|------|
| `docker-image.tar.gz` | ~200-400 MB | Docker 镜像 | 直接 `docker load` |
| `static-export.tar.gz` | ~50-100 MB | 静态文件 | 解压后 `docker build` |

---

## 命令速查

### Build Docker Image（推荐）

```bash
# 下载后
docker load < docker-image.tar.gz

# 查看镜像
docker images ant-ai-nav

# 运行
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 停止
docker stop ant-ai-nav

# 删除
docker rm ant-ai-nav
docker rmi ant-ai-nav:latest
```

### Build Static Export

```bash
# 下载后
tar -xzf static-export.tar.gz

# 构建镜像
docker build -t ant-ai-nav:latest .

# 运行
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

---

## 性能对比

| 操作 | Build Docker Image | Build Static Export |
|------|-------------------|-------------------|
| GitHub Actions 构建 | 8-15 分钟 | 3-5 分钟 |
| 下载时间 | 3-5 分钟 | 1-2 分钟 |
| 服务器处理 | 1-2 分钟 | 2-3 分钟（构建） |
| **总时间** | **12-22 分钟** | **6-10 分钟** |

---

## 选择指南

| 你的需求 | 推荐工作流 | 原因 |
|---------|-----------|------|
| 最简单，不想构建 | Build Docker Image | 一键加载 |
| 文件小，下载快 | Build Static Export | 体积小一半 |
| 服务器性能好 | Build Docker Image | 避免服务器构建 |
| 服务器性能一般 | Build Static Export | 服务器负担小 |
| 需要自定义构建 | Build Static Export | 解压后可修改 |

---

## 完整流程

### 方案 A：Build Docker Image（最简单）

```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. 在 GitHub Actions 运行 "Build Docker Image"

# 3. 等待 8-15 分钟后下载 docker-image.tar.gz

# 4. 在服务器上执行
docker load < docker-image.tar.gz

# 5. 启动服务
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  -v /opt/ant-ai-nav/config:/app/config \
  --restart unless-stopped \
  ant-ai-nav:latest

# 6. 访问配置页面
# http://your-server-ip:5000/settings
```

### 方案 B：Build Static Export（文件小）

```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. 在 GitHub Actions 运行 "Build Static Export"

# 3. 等待 3-5 分钟后下载 static-export.tar.gz

# 4. 在服务器上执行
mkdir -p /opt/ant-ai-nav
cd /opt/ant-ai-nav
tar -xzf static-export.tar.gz

# 5. 构建镜像
docker build -t ant-ai-nav:latest .

# 6. 启动服务
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  -v ./config:/app/config \
  --restart unless-stopped \
  ant-ai-nav:latest

# 7. 访问配置页面
# http://your-server-ip:5000/settings
```

---

## 快速链接

- [GitHub Actions 工作流对比](./github-workflows-comparison.md) - 详细对比
- [GitHub Actions 部署指南](./github-actions-deploy.md) - 完整部署流程
- [Docker 部署指南](./deploy-docker.md) - Docker 详细说明

---

**提示**: 如果不确定，选择 **Build Docker Image**，最简单！
