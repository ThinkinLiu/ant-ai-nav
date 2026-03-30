# Docker 部署静态资源 404 问题诊断与解决

## 问题描述

Docker 部署后，静态资源（CSS、JS、图片等）全部返回 404 错误。

## 原因分析

Next.js 在 standalone 模式下，静态资源需要按照特定顺序复制到 Docker 镜像中。如果复制顺序或路径不正确，静态资源将无法访问。

## 解决方案

### 1. 已修复的 Dockerfile

已更新 `Dockerfile`，确保静态资源按正确顺序复制：

```dockerfile
# 1. 先复制 standalone 输出
COPY --from=builder /app/.next/standalone ./

# 2. 再复制静态文件（关键：必须复制到 ./.next/static）
COPY --from=builder /app/.next/static ./.next/static

# 3. 最后复制 public 目录
COPY --from=builder /app/public ./public
```

### 2. 已修复的启动脚本

已更新 `scripts/start.sh`，自动检测运行模式：

```bash
# 检测是否在 standalone 模式下运行
if [ -f "server.js" ]; then
  # 直接运行 server.js（standalone 模式）
  exec node server.js
else
  # 使用 next start 启动（传统模式）
  exec pnpm start
fi
```

### 3. 诊断工具

提供了 `scripts/check-static-assets.sh` 脚本，用于诊断静态资源配置。

## 使用方法

### 在 Docker 容器中运行诊断

```bash
# 进入运行中的容器
docker exec -it <container_id> sh

# 运行诊断脚本
bash /app/scripts/check-static-assets.sh
```

### 预期输出

```
=========================================
Docker 静态资源诊断工具
=========================================

📁 当前工作目录:
/app

🔍 检查 standalone 模式:
  ✅ server.js 存在（standalone 模式）

📁 检查静态资源目录:
  .next/static: ✅ 存在（245 个文件）
  public: ✅ 存在（15 个文件）
  node_modules: ✅ 存在

📄 检查关键静态文件:
  .next/static/chunks/_app.js: ✅ (156KB)
  .next/static/chunks/_buildManifest.js: ✅ (2KB)
  .next/static/chunks/_ssgManifest.js: ✅ (1KB)

=========================================
诊断结果:
=========================================
✅ 所有检查通过，静态资源配置正确
=========================================
```

## 重新构建和部署

### 1. 本地构建 Docker 镜像

```bash
# 构建镜像
docker build -t ant-ai-nav:latest .

# 查看镜像
docker images | grep ant-ai-nav
```

### 2. 运行容器

```bash
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  ant-ai-nav:latest
```

### 3. 验证部署

```bash
# 检查容器状态
docker ps | grep ant-ai-nav

# 查看日志
docker logs ant-ai-nav

# 测试静态资源
curl -I http://localhost:5000/_next/static/chunks/_app.js

# 运行诊断
docker exec -it ant-ai-nav bash /app/scripts/check-static-assets.sh
```

## 常见问题

### Q1: 静态资源仍然返回 404

**检查清单：**

1. ✅ 确认使用最新的 Dockerfile
2. ✅ 确认使用最新的 start.sh 脚本
3. ✅ 运行诊断脚本检查静态资源
4. ✅ 检查容器日志中的错误信息

**可能的解决方案：**

```bash
# 1. 删除旧镜像和容器
docker stop ant-ai-nav
docker rm ant-ai-nav
docker rmi ant-ai-nav:latest

# 2. 清理构建缓存
docker builder prune -f

# 3. 重新构建
docker build --no-cache -t ant-ai-nav:latest .

# 4. 运行新容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

### Q2: server.js 不存在

**原因：** 构建失败或 standalone 模式未启用

**解决方案：**

1. 检查 `next.config.ts` 中是否设置了 `output: 'standalone'`
2. 检查构建日志，确认构建成功
3. 重新构建镜像

### Q3: .next/static 目录为空

**原因：** Dockerfile 中的复制命令顺序错误

**解决方案：**

使用最新的 Dockerfile，确保复制顺序正确：

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```

### Q4: 权限问题导致静态资源无法访问

**原因：** Docker 容器中的文件权限不正确

**解决方案：**

Dockerfile 中已设置正确的权限：

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制文件后设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs
```

## 环境变量配置

确保在构建时注入正确的环境变量：

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -t ant-ai-nav:latest \
  .
```

## 性能优化

### 1. 减小镜像体积

使用多阶段构建已经最小化了镜像体积，当前镜像大小约为 200-300MB。

### 2. 启用压缩

在 Docker 容器中启用 gzip 压缩：

```dockerfile
# 安装 nginx 或使用 Next.js 内置压缩
```

### 3. 使用 CDN

将静态资源上传到 CDN，减轻服务器压力。

## 监控和日志

### 查看容器日志

```bash
# 实时查看日志
docker logs -f ant-ai-nav

# 查看最近 100 行日志
docker logs --tail 100 ant-ai-nav
```

### 检查资源加载

在浏览器开发者工具中：

1. 打开 Network 标签
2. 刷新页面
3. 检查所有静态资源的状态码
4. 如果状态码是 404，说明资源路径不正确

## 技术细节

### Next.js Standalone 模式

Standalone 模式会创建一个自包含的输出，包括：

- `server.js` - Node.js 服务器入口
- 最小化的 `node_modules` - 只包含运行时依赖
- `.next/static` - 静态资源（CSS、JS、图片等）
- `public` - 公共静态文件

### 目录结构

```
/app (容器内)
  ├── server.js          # 服务器入口
  ├── node_modules/      # 最小化依赖
  ├── .next/
  │   └── static/        # 静态资源（关键！）
  ├── public/            # 公共文件
  └── package.json
```

## 参考资料

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Standalone Output](https://nextjs.org/docs/deployment#standalone-output)
