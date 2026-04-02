# 静态资源 404 问题解决方案

## 问题现象

浏览器请求 `/_next/static/...` 时返回 404 错误，控制台显示：

```
GET https://mayiai.itlao5.com/_next/static/chunks/xxx.js 404 (Not Found)
GET https://mayiai.itlao5.com/_next/static/css/xxx.css 404 (Not Found)
```

## 根本原因

### Next.js 静态资源路径机制

1. **构建时**：Next.js 将静态资源输出到 `.next/static/` 目录
2. **浏览器请求**：浏览器通过 `/_next/static/...` 路径请求静态资源
3. **服务器响应**：Next.js 服务器需要将 `/_next` 映射到 `.next/static` 目录

### 为什么会出问题？

在 **standalone 模式**下：
- `.next/static` 目录被正确复制到容器
- 但 Next.js 服务器可能没有正确处理 `/_next` 路径
- 需要确保服务器知道 `/_next` 对应 `.next/static`

## 解决方案

### 方案 1: 创建 _next 软链接（快速解决）

**临时解决（在运行中的容器）：**

```bash
# 删除旧的软链接（如果存在）
docker exec -it -u root ant-ai-nav sh -c "rm -f /app/_next"

# 创建正确的软链接：_next -> .next
docker exec -it -u root ant-ai-nav sh -c "ln -sf /app/.next /app/_next"

# 验证
docker exec ant-ai-nav sh -c "ls -la /app/_next"
# 应该显示: _next -> .next

# 验证静态资源路径
docker exec ant-ai-nav sh -c "ls -la /app/_next/static"
# 应该显示 .next/static 目录的内容

# 重启容器
docker restart ant-ai-nav

# 查看日志
docker logs --tail 20 ant-ai-nav
```

### 方案 2: 修改 Dockerfile（永久解决）

**在 Dockerfile 中添加软链接创建：**

```dockerfile
# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 创建 _next 软链接，指向 .next 目录
# 浏览器请求 /_next/static/... 时，实际路径是 .next/static/...
RUN ln -sf /app/.next /app/_next
```

**修改后需要重新构建镜像：**

```bash
# 1. 提交更改
git add .
git commit -m "fix: 添加 _next 软链接修复静态资源 404"
git push origin main

# 2. 在 GitHub Actions 重新构建
# 访问 Actions 页面，运行 "Build Docker Image" 工作流

# 3. 下载新镜像并更新
./scripts/update-docker-image.sh
```

## 验证修复

### 1. 检查容器内文件结构

```bash
# 进入容器
docker exec -it ant-ai-nav sh

# 检查软链接
ls -la /app/_next
# 应该显示: _next -> .next/static

# 检查静态资源
ls -la /app/.next/static

# 退出
exit
```

### 2. 浏览器测试

1. 清除浏览器缓存
2. 刷新页面
3. 打开开发者工具（F12）
4. 查看 Network 标签
5. 确认所有 `/_next/static/...` 请求都返回 200

### 3. 使用 curl 测试

```bash
# 测试 BUILD_ID
curl -I http://localhost:5000/_next/static/BUILD_ID

# 应该返回 HTTP 200
```

## 为什么软链接可以解决？

Next.js 服务器会自动处理 `/_next` 路径，它会：
1. 检查文件系统中的 `/app/_next` 目录
2. 如果存在，直接提供静态资源
3. 通过软链接，`/_next` 实际指向 `.next`
4. 浏览器请求 `/_next/static/xxx.js` 时，服务器读取 `.next/static/xxx.js`

**为什么是 `_next` -> `.next` 而不是 `_next` -> `.next/static`？**

- 如果 `_next` -> `.next`：
  - 浏览器请求 `/_next/static/xxx.js`
  - 实际路径：`.next/static/xxx.js` ✅ 正确

- 如果 `_next` -> `.next/static`：
  - 浏览器请求 `/_next/static/xxx.js`
  - 实际路径：`.next/static/static/xxx.js` ❌ 错误（多了一层 static）

## 替代方案

### 方案 3: 使用 Nginx 反向代理

如果软链接方案不行，可以使用 Nginx 反向代理：

```nginx
location /_next/ {
    alias /app/.next/static/;
}
```

### 方案 4: 修改 Next.js 配置

在 `next.config.js` 中配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 确保静态资源正确处理
  generateStaticParams: true,
}
```

## 相关文件

- Dockerfile - 镜像构建文件
- next.config.js - Next.js 配置文件
- scripts/check-static-resources.sh - 静态资源检查脚本

## 参考资料

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Next.js Static File Serving](https://nextjs.org/docs/basic-features/static-file-serving)
- [Next.js Standalone Mode](https://nextjs.org/docs/app/building-your-application/deploying#standalone-mode)
