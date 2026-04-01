# Docker 构建问题修复总结

## 问题描述

用户在使用 GitHub Actions 构建时遇到错误：

```
#17 ERROR: failed to calculate checksum of ref 26c853c4-ebf5-403c-a446-44e39e017c08::y9yxe3xki0wlriqjxfjnj75u9: "/app/.next/standalone/workspace/projects": not found
```

## 根本原因

Dockerfile 中假设 Next.js 16 的 standalone 输出路径为 `.next/standalone/workspace/projects`，但实际输出路径是 `.next/standalone`。

## 修复方案

### 修改 Dockerfile

**文件**: `Dockerfile`

**变更 1**: 修正 standalone 输出路径复制

```dockerfile
# 之前（错误）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects ./

# 现在（正确）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

**变更 2**: 添加调试步骤

在构建阶段添加了调试输出，用于检查 standalone 目录的实际结构：

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

## 解决方案选择

### 方案 1：使用 GitHub Actions 云端构建（推荐）

由于 Next.js + Docker 构建需要大量内存（通常需要 2GB+），本地构建容易失败，强烈建议使用 GitHub Actions 云端构建。

**步骤**：

1. 推送代码到 GitHub
2. 运行 "Build Docker Image" 工作流
3. 下载 `docker-image.tar.gz`
4. 加载并运行镜像

```bash
# 加载镜像
docker load < docker-image.tar.gz

# 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

### 方案 2：使用 Build Static Export

如果服务器性能有限，可以使用静态文件导出。

**步骤**：

1. 运行 "Build Static Export" 工作流
2. 下载 `static-export.tar.gz`
3. 解压并构建镜像

```bash
tar -xzf static-export.tar.gz
docker build -t ant-ai-nav:latest .
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

## 新增文档

1. **docs/docker-build-fix.md** - Docker 构建问题完整解决方案
2. **scripts/test-docker-build.sh** - Docker 构建测试脚本

## 相关文档

- [部署快速参考](./deployment-quick-reference.md)
- [GitHub Actions 部署指南](./github-actions-deploy.md)
- [GitHub Actions 工作流对比](./github-workflows-comparison.md)

## 快速开始

```bash
# 推荐方式：使用 GitHub Actions

# 1. 推送代码
git push origin main

# 2. 运行 Build Docker Image 工作流

# 3. 下载 docker-image.tar.gz

# 4. 加载并运行
docker load < docker-image.tar.gz
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 5. 访问配置页面
# http://your-server-ip:5000/settings
```

## 总结

- ✅ 已修复 Dockerfile standalone 路径问题
- ✅ 添加调试步骤帮助排查问题
- ✅ 创建详细的解决方案文档
- ✅ 提供多种部署方案选择

**建议**：使用 GitHub Actions 云端构建，避免本地构建的内存问题。

---

**更新时间**: 2025-04-01
