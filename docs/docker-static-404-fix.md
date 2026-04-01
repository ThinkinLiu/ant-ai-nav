# 静态资源 404 修复指南

## 问题描述

使用 GitHub Actions 构建并部署后，访问网站时页面可以加载，但所有静态资源（CSS、JS 文件）返回 404 错误。

**症状**：
- 页面可以访问（HTML 正常返回）
- 但所有 `_next/static/` 路径的文件 404
- `public/` 目录下的资源也可能 404
- 页面无样式、无交互

## 根本原因分析

Next.js 16 的 standalone 模式有以下特点：

1. **standalone 输出不完整**：
   - standalone 输出只包含运行所需的最小文件集
   - `.next/static` 目录可能不完整或不存在
   - 需要从构建阶段单独复制

2. **路径问题**：
   - Dockerfile 中的 COPY 命令路径不正确
   - 工作目录设置不当
   - 相对路径与绝对路径混淆

3. **Next.js 配置问题**：
   - `next.config.ts` 的 `output: 'standalone'` 配置
   - `outputFileTracingIncludes` 配置不完整

## 解决方案

### 方案 1：重新构建镜像（推荐）

使用修复后的 Dockerfile 重新构建。

**步骤**：

1. **确保使用最新的 Dockerfile**

   检查 Dockerfile 是否包含以下关键步骤：

   ```dockerfile
   # 复制 standalone 输出
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

   # 复制静态资源（关键步骤）
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   # 复制 public 目录
   COPY --from=builder --chown=nextjs:nodejs /app/public ./public
   ```

2. **重新构建镜像**

   ```bash
   # 使用 GitHub Actions 重新构建
   # 1. 确保代码已推送
   git push origin main

   # 2. 运行 "Build Docker Image" 工作流

   # 3. 下载新的 docker-image.tar.gz

   # 4. 加载新镜像
   docker load < docker-image.tar.gz

   # 5. 停止并删除旧容器
   docker stop ant-ai-nav
   docker rm ant-ai-nav

   # 6. 运行新容器
   docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
   ```

3. **验证静态资源**

   ```bash
   # 检查静态文件是否可访问
   curl -I http://localhost:5000/_next/static/css/...  # 替换为实际的 CSS 文件路径

   # 或者使用调试脚本
   ./scripts/debug-docker-static.sh
   ```

---

### 方案 2：检查并修复容器内的文件

如果已经部署了镜像但静态资源 404，可以使用调试脚本检查：

```bash
# 运行调试脚本
./scripts/debug-docker-static.sh
```

**检查要点**：

1. **`.next/static` 目录是否存在**
   ```bash
   docker exec ant-ai-nav ls -la /app/.next/static
   ```

2. **`public` 目录是否存在**
   ```bash
   docker exec ant-ai-nav ls -la /app/public
   ```

3. **`server.js` 是否存在**
   ```bash
   docker exec ant-ai-nav ls -la /app/server.js
   ```

4. **检查实际的静态文件**
   ```bash
   docker exec ant-ai-nav find /app/.next/static -name "*.css" | head -5
   docker exec ant-ai-nav find /app/.next/static -name "*.js" | head -5
   ```

---

### 方案 3：使用 Build Static Export + 本地构建

如果 GitHub Actions 构建有问题，可以尝试：

```bash
# 1. 下载 static-export.tar.gz
# 2. 解压
tar -xzf static-export.tar.gz

# 3. 检查 .next/static 是否存在
ls -la .next/static

# 4. 构建 Docker 镜像
docker build -t ant-ai-nav:latest .

# 5. 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 6. 验证
curl -I http://localhost:5000
```

---

## Dockerfile 关键配置说明

### 正确的 Dockerfile 配置

```dockerfile
# 阶段 2: 构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖和源代码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建
RUN pnpm build

# 调试：检查输出
RUN ls -la /app/.next/standalone
RUN ls -la /app/.next/static
RUN ls -la /app/public

# 阶段 3: 运行
FROM node:20-alpine AS runner

WORKDIR /app

# 创建用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 关键步骤 1: 复制 standalone 输出
# 注意：使用 trailing slash / 确保复制内容而不是目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

# 关键步骤 2: 复制静态资源
# standalone 输出可能不包含完整的 .next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 关键步骤 3: 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 验证
RUN ls -la /app/.next/static
RUN ls -la /app/public

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]
```

### 常见错误

#### 错误 1: 路径末尾缺少 `/`

```dockerfile
# 错误（复制目录本身）
COPY --from=builder /app/.next/standalone ./

# 正确（复制目录内容）
COPY --from=builder /app/.next/standalone/ ./
```

#### 错误 2: 没有单独复制静态资源

```dockerfile
# 错误（standalone 输出不包含完整的 .next/static）
COPY --from=builder /app/.next/standalone/ ./

# 正确（需要单独复制静态资源）
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static
```

#### 错误 3: 复制顺序错误

```dockerfile
# 错误（先复制静态资源会被覆盖）
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone/ ./

# 正确（先复制 standalone，再补充静态资源）
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static
```

---

## 调试步骤

### 1. 检查 Docker 构建日志

```bash
# 查看构建日志
docker build -t ant-ai-nav:latest . 2>&1 | tee build.log

# 搜索关键信息
grep -E "(static|public|standalone)" build.log
```

### 2. 检查镜像内容

```bash
# 创建临时容器检查内容
docker run --rm -it ant-ai-nav:latest sh -c "ls -la /app/.next/static"
docker run --rm -it ant-ai-nav:latest sh -c "ls -la /app/public"
docker run --rm -it ant-ai-nav:latest sh -c "find /app -name '*.css' | head -5"
```

### 3. 检查运行时日志

```bash
# 查看容器日志
docker logs -f ant-ai-nav

# 检查错误信息
docker logs ant-ai-nav | grep -i error
```

### 4. 检查网络请求

```bash
# 检查静态资源请求
curl -I http://localhost:5000/_next/static/css/
curl -I http://localhost:5000/favicon.ico

# 使用浏览器开发者工具
# 打开浏览器 F12 → Network → 查看哪些资源 404
```

---

## 完整的修复流程

```bash
# 1. 停止旧容器
docker stop ant-ai-nav
docker rm ant-ai-nav

# 2. 删除旧镜像
docker rmi ant-ai-nav:latest

# 3. 下载新的构建产物
# (从 GitHub Actions 下载 docker-image.tar.gz)

# 4. 加载新镜像
docker load < docker-image.tar.gz

# 5. 运行调试脚本检查
./scripts/debug-docker-static.sh

# 6. 启动新容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 7. 等待服务启动
sleep 5

# 8. 检查服务
curl -I http://localhost:5000

# 9. 访问浏览器
# http://localhost:5000
```

---

## 预防措施

### 1. 在 Dockerfile 中添加验证步骤

```dockerfile
# 在复制静态资源后立即验证
RUN if [ ! -d "/app/.next/static" ]; then \
        echo "❌ .next/static 不存在"; \
        exit 1; \
    fi && \
    if [ ! -d "/app/public" ]; then \
        echo "❌ public 不存在"; \
        exit 1; \
    fi && \
    echo "✅ 静态资源验证通过"
```

### 2. 在 GitHub Actions 中添加测试

```yaml
- name: Test Docker image
  run: |
    docker run -d -p 5000:5000 --name test ant-ai-nav:latest
    sleep 10
    curl -f http://localhost:5000 || exit 1
    docker stop test
    docker rm test
```

### 3. 定期检查镜像内容

```bash
# 创建定期检查脚本
docker run --rm ant-ai-nav:latest sh -c "ls -la /app/.next/static"
```

---

## 相关文档

- [Docker 构建问题解决方案](./docker-build-fix.md)
- [部署快速参考](./deployment-quick-reference.md)
- [GitHub Actions 部署指南](./github-actions-deploy.md)
- [Docker 部署指南](./deploy-docker.md)

---

## 快速检查清单

部署前检查：

- [ ] Dockerfile 包含正确的 COPY 命令
- [ ] 复制 standalone 输出（带 trailing slash）
- [ ] 单独复制 .next/static 目录
- [ ] 单独复制 public 目录
- [ ] 添加验证步骤

部署后检查：

- [ ] 容器正常运行
- [ ] server.js 存在
- [ ] .next/static 目录存在且有文件
- [ ] public 目录存在
- [ ] 静态资源可访问（curl 测试）
- [ ] 页面正常渲染（有样式）

---

## 总结

静态资源 404 问题的核心原因是：

1. **Next.js standalone 输出不完整**
2. **Dockerfile COPY 命令路径错误**
3. **没有单独复制静态资源**

**解决关键**：
- 使用 `/.next/standalone/`（带 trailing slash）
- 单独复制 `./.next/static`
- 单独复制 `./public`
- 添加验证步骤确保文件存在

**推荐流程**：
使用 GitHub Actions 的 Build Docker Image 工作流，确保使用最新修复的 Dockerfile。

---

**更新时间**: 2025-04-01
