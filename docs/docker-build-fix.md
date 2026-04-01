# Docker 构建问题解决方案

## 问题：Docker 构建失败

错误信息：
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref 26c853c4-ebf5-403c-a446-44e39e017c08::y9yxe3xki0wlriqjxfjnj75u9: "/app/.next/standalone/workspace/projects": not found
```

## 问题原因

Next.js 16 的 standalone 输出路径与配置不一致。之前的 Dockerfile 假设输出路径为 `.next/standalone/workspace/projects`，但实际输出路径可能不同。

## 解决方案

### 方案 1：使用 GitHub Actions 云端构建（推荐）

由于 Next.js + Docker 构建需要大量内存（通常需要 2GB+），本地构建容易失败，强烈建议使用 GitHub Actions 云端构建。

**优点**：
- ✅ 无需本地环境
- ✅ 云端构建，速度快
- ✅ 避免内存不足问题
- ✅ 自动化流程

**步骤**：

1. **推送代码到 GitHub**

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ant-ai-nav.git
   git add .
   git commit -m "Update Dockerfile for standalone build"
   git push -u origin main
   ```

2. **运行 Build Docker Image 工作流**

   - 访问 GitHub 仓库 → Actions 标签页
   - 选择 "Build Docker Image" 工作流
   - 点击 "Run workflow"，选择分支 `main`
   - 等待构建完成（约 8-15 分钟）

3. **下载构建产物**

   - 构建完成后，下载 `docker-image.tar.gz`

4. **加载并运行镜像**

   ```bash
   # 加载镜像
   docker load < docker-image.tar.gz

   # 运行容器
   docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

   # 查看日志
   docker logs -f ant-ai-nav
   ```

---

### 方案 2：本地构建（需要 2GB+ 内存）

**前提条件**：
- 系统内存 ≥ 4GB
- Docker 已安装
- 至少 10GB 可用磁盘空间

**步骤**：

```bash
# 1. 测试构建脚本
./scripts/test-docker-build.sh

# 2. 或者手动构建
docker build -t ant-ai-nav:latest .

# 3. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

**注意事项**：
- 构建过程可能需要 5-10 分钟
- 如果内存不足，构建会失败
- 建议使用 GitHub Actions 云端构建

---

### 方案 3：使用 Build Static Export（文件小）

如果服务器性能有限，可以使用静态文件导出。

**步骤**：

1. **运行 Build Static Export 工作流**

   - 在 GitHub Actions 运行 "Build Static Export" 工作流

2. **下载构建产物**

   - 下载 `static-export.tar.gz`

3. **在服务器上构建**

   ```bash
   # 解压
   tar -xzf static-export.tar.gz

   # 构建镜像
   docker build -t ant-ai-nav:latest .

   # 运行容器
   docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
   ```

---

## Dockerfile 修复说明

已修复的 Dockerfile 主要变更：

### 变更 1：调整 standalone 输出路径

**之前（错误）**：
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects ./
```

**现在（正确）**：
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

### 变更 2：添加调试步骤

```dockerfile
# 调试：检查 standalone 输出结构
RUN echo "=== 调试：检查 .next/standalone 目录结构 ===" && \
    ls -la /app/.next/ && \
    echo "" && \
    echo "=== standalone 目录 ===" && \
    if [ -d "/app/.next/standalone" ]; then \
        ls -la /app/.next/standalone/; \
    else \
        echo "standalone 目录不存在"; \
    fi
```

---

## 构建流程图

### 推荐流程（GitHub Actions）

```
本地开发
    ↓
推送代码到 GitHub
    ↓
GitHub Actions 构建
    ↓
下载 docker-image.tar.gz
    ↓
docker load 加载镜像
    ↓
docker run 启动容器
    ↓
访问网站
```

### 备选流程（本地构建）

```
本地开发
    ↓
docker build 构建镜像
    ↓
docker run 启动容器
    ↓
访问网站
```

---

## 常见错误

### 错误 1: 内存不足

**错误信息**：
```
Error: JavaScript heap out of memory
```

**解决**：
- 使用 GitHub Actions 云端构建（推荐）
- 增加系统内存
- 增加 Docker 内存限制

### 错误 2: 构建超时

**错误信息**：
```
Build failed: timeout
```

**解决**：
- 增加构建超时时间
- 使用 GitHub Actions 云端构建
- 减少构建层级

### 错误 3: standalone 路径错误

**错误信息**：
```
"/app/.next/standalone/workspace/projects": not found
```

**解决**：
- 已修复 Dockerfile，使用正确的路径
- 确保使用最新版本的 Dockerfile

---

## 相关文档

- [部署快速参考](./deployment-quick-reference.md)
- [GitHub Actions 部署指南](./github-actions-deploy.md)
- [GitHub Actions 工作流对比](./github-workflows-comparison.md)
- [Docker 部署指南](./deploy-docker.md)

---

## 总结

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 本地内存 < 2GB | GitHub Actions | 避免内存不足 |
| 本地内存 ≥ 4GB | 本地构建或 GitHub Actions | 两种方式均可 |
| 服务器性能有限 | Build Static Export | 文件小，下载快 |
| 追求简单方便 | Build Docker Image | 一键加载 |

**强烈推荐**：使用 GitHub Actions 云端构建，最稳定可靠！

---

**更新时间**: 2025-04-01
