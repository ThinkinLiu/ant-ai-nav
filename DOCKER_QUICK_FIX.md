# Docker 静态资源 404 快速修复指南

## ✅ 已修复的问题

### 1. Dockerfile 静态资源复制顺序
```dockerfile
# 修复前（错误顺序）
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 修复后（正确顺序）
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```

### 2. start.sh 启动脚本
```bash
# 修复前
exec pnpm start

# 修复后（自动检测模式）
if [ -f "server.js" ]; then
  exec node server.js  # standalone 模式
else
  exec pnpm start      # 传统模式
fi
```

## 🔍 快速诊断

### 在 Docker 容器中运行

```bash
# 进入容器
docker exec -it <container_id> sh

# 运行诊断
bash /app/scripts/check-static-assets.sh
```

### 预期结果

```
✅ 所有检查通过，静态资源配置正确
```

## 🚀 重新部署步骤

### 方法 1：完全重新构建（推荐）

```bash
# 1. 停止并删除旧容器
docker stop ant-ai-nav
docker rm ant-ai-nav

# 2. 删除旧镜像
docker rmi ant-ai-nav:latest

# 3. 清理构建缓存（可选）
docker builder prune -f

# 4. 构建新镜像
docker build -t ant-ai-nav:latest .

# 5. 运行新容器
docker run -d \
  -p 5000:5000 \
  --name ant-ai-nav \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-url.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  ant-ai-nav:latest

# 6. 验证
docker exec -it ant-ai-nav bash /app/scripts/check-static-assets.sh
```

### 方法 2：使用 GitHub Actions 自动构建

如果项目使用 GitHub Actions，确保工作流文件包含：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.SUPABASE_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }} \
            -t ant-ai-nav:latest \
            .

      - name: Test image
        run: |
          docker run -d -p 5000:5000 --name test-ant-ai-nav ant-ai-nav:latest
          sleep 10
          docker exec test-ant-ai-nav bash /app/scripts/check-static-assets.sh
          docker stop test-ant-ai-nav
          docker rm test-ant-ai-nav
```

## 🧪 测试静态资源

### 1. 检查容器日志

```bash
docker logs ant-ai-nav | grep -i "static\|404"
```

### 2. 测试静态资源访问

```bash
# 测试关键静态文件
curl -I http://localhost:5000/_next/static/chunks/_app.js
curl -I http://localhost:5000/_next/static/css/app.css
curl -I http://localhost:5000/favicon.ico
```

**预期结果：**
- 状态码：`200 OK`
- Content-Type：`application/javascript` 或 `text/css`

### 3. 浏览器测试

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 刷新页面
4. 检查所有静态资源的加载状态
5. 应该全部显示 `200`，没有 `404`

## ❓ 常见错误

### 错误 1：`Cannot GET /_next/static/...`

**原因：** 静态资源目录不存在或路径不正确

**解决方案：**
```bash
# 检查容器内静态资源
docker exec -it ant-ai-nav ls -la .next/static
docker exec -it ant-ai-nav ls -la public

# 如果为空，重新构建镜像
```

### 错误 2：`ENOENT: no such file or directory`

**原因：** 文件权限问题

**解决方案：**
```bash
# 检查文件权限
docker exec -it ant-ai-nav ls -la .next/static
docker exec -it ant-ai-nav ls -la public

# 修复权限（在 Dockerfile 中已设置）
RUN chown -R nextjs:nodejs /app
```

### 错误 3：容器启动失败

**原因：** 环境变量缺失或构建失败

**解决方案：**
```bash
# 查看容器日志
docker logs ant-ai-nav

# 检查环境变量
docker exec -it ant-ai-nav env | grep SUPABASE

# 重新构建并注入环境变量
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t ant-ai-nav:latest \
  .
```

## 📊 性能监控

### 检查容器资源使用

```bash
# 查看容器资源使用
docker stats ant-ai-nav

# 查看容器详细信息
docker inspect ant-ai-nav
```

### 查看静态资源加载时间

在浏览器开发者工具中：
1. Network 标签
2. 筛选 JS/CSS 资源
3. 查看加载时间
4. 应该在毫秒级别

## 🔧 进阶优化

### 1. 启用 CDN 加速

将静态资源上传到 CDN，修改 Next.js 配置：

```javascript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
  assetPrefix: 'https://cdn.yourdomain.com',
}
```

### 2. 启用 HTTP/2

在反向代理（如 Nginx）中启用 HTTP/2：

```nginx
server {
    listen 443 ssl http2;
    # ...
}
```

### 3. 启用 Brotli 压缩

```javascript
// next.config.ts
const nextConfig: NextConfig = {
  compress: true,  // 启用 gzip
}
```

## 📚 相关文档

- [Docker 部署完整文档](./DOCKER_DEPLOYMENT.md)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## 💡 提示

1. **定期更新基础镜像**：`FROM node:20-alpine`
2. **使用多阶段构建**：减小镜像体积
3. **清理构建缓存**：避免旧代码残留
4. **监控容器日志**：及时发现异常
5. **使用健康检查**：确保容器正常运行

---

## ✅ 修复确认清单

部署完成后，请确认以下项：

- [ ] Docker 镜像构建成功
- [ ] 容器成功启动
- [ ] 诊断脚本通过所有检查
- [ ] 静态资源返回 200 状态码
- [ ] 页面正常显示（无样式丢失）
- [ ] 所有 JS 文件正常加载
- [ ] 所有 CSS 文件正常加载
- [ ] 图片资源正常显示
- [ ] 浏览器控制台无 404 错误

如果所有项都通过 ✅，恭喜你，部署成功！
