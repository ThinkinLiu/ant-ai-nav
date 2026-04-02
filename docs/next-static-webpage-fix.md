# Next.js 静态资源返回网页问题解决方案

## 问题描述

现象：
- `/app/_next/static/xxx.js` ✅ 能访问
- `/_next/static/xxx.js` ❌ 不能访问
- `/.next/static/xxx.js` ❌ 返回网页而不是 JS 文件

## 根本原因

1. **软链接时机问题**：软链接可能在 Next.js 服务器启动后才创建，导致服务器无法识别
2. **路由冲突**：`.next` 路径被 Next.js 路由系统捕获，当作应用路由处理
3. **权限问题**：软链接的权限可能不正确

## 解决方案

### 方案 1: 使用启动脚本（推荐）

在 Dockerfile 中创建启动脚本，确保软链接在服务器启动前就存在：

```dockerfile
# 创建启动脚本
RUN echo '#!/bin/sh\n\
# 确保 _next 软链接存在\n\
if [ ! -L "/app/_next" ]; then\n\
  ln -sf /app/.next /app/_next\n\
  echo "✅ Created _next symlink"\n\
fi\n\
# 启动 Next.js 服务器\n\
exec node "$@"\n\
' > /app/start.sh && chmod +x /app/start.sh

# 使用启动脚本
ENTRYPOINT ["/app/start.sh"]
CMD ["node", "server.js"]
```

### 方案 2: 在 Dockerfile 构建时创建软链接

```dockerfile
# 复制 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 创建 _next 软链接
RUN ln -sf /app/.next /app/_next
```

### 方案 3: 运行时手动创建（临时解决）

```bash
# 在容器内执行
docker exec -it -u root ant-ai-nav sh -c "cd /app && rm -f _next && ln -sf .next _next"
docker restart ant-ai-nav
```

## 验证方法

### 1. 检查软链接

```bash
docker exec ant-ai-nav sh -c "ls -la /app/_next"
# 应该显示: _next -> .next
```

### 2. 测试静态资源访问

```bash
# 测试 _next 路径
curl -I http://localhost:5000/_next/static/BUILD_ID
# 应该返回 HTTP 200

# 测试返回内容是否正确
curl http://localhost:5000/_next/static/BUILD_ID
# 应该返回 BUILD_ID 字符串，而不是 HTML 网页
```

### 3. 检查容器启动日志

```bash
docker logs ant-ai-nav | grep -i "symlink\|_next"
```

## 常见问题

### Q1: 为什么 /.next/static 返回网页？

A: Next.js 把 `.next` 当作动态路由处理了。正确的做法是：
- 不要直接访问 `.next` 路径
- 使用 `_next` 软链接，Next.js 会自动处理这个路径

### Q2: 软链接创建后仍然不能访问？

A: 可能的原因：
1. 软链接在服务器启动后才创建，需要重启容器
2. 软链接权限问题，使用 `-u root` 创建
3. Next.js 缓存问题，需要清理 `.next/cache`

### Q3: 如何避免这个问题？

A:
1. 在 Dockerfile 构建时创建软链接
2. 使用启动脚本确保软链接在服务器启动前就存在
3. 重新构建镜像

## 重新构建镜像

如果需要重新构建镜像：

```bash
# 1. 提交代码
git add .
git commit -m "fix: 添加启动脚本确保 _next 软链接存在"
git push origin main

# 2. 在 GitHub Actions 重新构建
# 访问 Actions 页面，运行 "Build Docker Image" 工作流

# 3. 下载新镜像并更新
./scripts/update-docker-image.sh
```

## 临时解决方法

如果无法立即重新构建镜像，可以尝试：

```bash
# 使用 root 用户创建软链接
docker exec -it -u root ant-ai-nav sh -c "cd /app && rm -f _next && ln -sf .next _next"

# 验证
docker exec ant-ai-nav sh -c "ls -la /app/_next"

# 重启容器
docker restart ant-ai-nav

# 测试
curl -I http://localhost:5000/_next/static/BUILD_ID
```

## 相关文件

- Dockerfile - 镜像构建文件
- next.config.ts - Next.js 配置文件
- docs/static-404-solution.md - 静态资源 404 问题解决方案
