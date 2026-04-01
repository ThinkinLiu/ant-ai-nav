# 静态资源 404 问题快速修复指南

## 症状

部署后页面可以访问，但所有静态资源（CSS、JS）返回 404：
- 页面无样式
- 按钮无反应
- F12 Network 标签显示 `_next/static/` 路径全部 404

## 快速修复

### 步骤 1: 使用修复脚本（推荐）

```bash
# 运行自动修复脚本
./scripts/fix-static-404.sh
```

脚本会：
1. 停止并删除旧容器
2. 删除旧镜像
3. 提示加载新镜像
4. 验证镜像内容
5. 启动新容器
6. 检查服务状态

---

### 步骤 2: 手动修复

```bash
# 1. 停止旧容器
docker stop ant-ai-nav
docker rm ant-ai-nav

# 2. 删除旧镜像
docker rmi ant-ai-nav:latest

# 3. 加载新镜像（从 GitHub Actions 下载的 docker-image.tar.gz）
docker load < docker-image.tar.gz

# 4. 启动新容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest

# 5. 检查服务
curl -I http://localhost:5000

# 6. 访问浏览器验证
# http://localhost:5000
```

---

## 根本原因

Next.js 16 standalone 模式的特点：

1. **standalone 输出不完整**
   - 只包含运行所需的最小文件
   - `.next/static` 可能缺失或不完整
   - 需要从构建阶段单独复制

2. **Dockerfile 配置关键点**

   ```dockerfile
   # ✅ 正确的配置
   COPY --from=builder /app/.next/standalone/ ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/public ./public
   ```

   ```dockerfile
   # ❌ 错误的配置
   COPY --from=builder /app/.next/standalone ./
   # 缺少 .next/static 和 public 的复制
   ```

---

## Dockerfile 关键配置

### 必须包含的三个 COPY 命令

```dockerfile
# 1. 复制 standalone 输出（注意 trailing slash）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

# 2. 复制静态资源（关键步骤）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
```

### 常见错误

| 错误 | 后果 | 修复 |
|------|------|------|
| 缺少 trailing slash | 复制目录本身而非内容 | 添加 `/.next/standalone/` |
| 未复制 .next/static | 静态资源 404 | 添加 COPY 命令 |
| 未复制 public | public 资源 404 | 添加 COPY 命令 |
| 顺序错误 | 静态资源被覆盖 | 先 standalone 后 static |

---

## 调试工具

### 1. 检查容器文件结构

```bash
# 运行调试脚本
./scripts/debug-docker-static.sh
```

### 2. 手动检查

```bash
# 检查静态文件
docker exec ant-ai-nav ls -la /app/.next/static

# 检查 public
docker exec ant-ai-nav ls -la /app/public

# 查找 CSS 文件
docker exec ant-ai-nav find /app/.next/static -name "*.css"
```

### 3. 检查网络请求

```bash
# 检查静态资源是否可访问
curl -I http://localhost:5000/_next/static/css/

# 或在浏览器 F12 → Network 查看
```

---

## 预防措施

### 1. 在 Dockerfile 中添加验证

```dockerfile
# 在复制静态资源后立即验证
RUN if [ ! -d "/app/.next/static" ]; then \
        echo "❌ .next/static 不存在"; \
        exit 1; \
    fi && \
    if [ ! -d "/app/public" ]; then \
        echo "❌ public 不存在"; \
        exit 1; \
    fi
```

### 2. 在 GitHub Actions 中添加测试

```yaml
- name: Test Docker image
  run: |
    docker run -d -p 5000:5000 --name test ant-ai-nav:latest
    sleep 10
    curl -f http://localhost:5000/_next/static/css/ || exit 1
    docker stop test
    docker rm test
```

---

## 完整流程

### 使用 GitHub Actions 构建

```bash
# 1. 推送代码
git push origin main

# 2. 运行 "Build Docker Image" 工作流

# 3. 下载 docker-image.tar.gz

# 4. 加载镜像
docker load < docker-image.tar.gz

# 5. 运行修复脚本
./scripts/fix-static-404.sh

# 6. 访问网站
# http://localhost:5000
```

---

## 相关文档

- ⭐⭐⭐ [静态资源 404 修复指南](./docker-static-404-fix.md) - 完整解决方案
- [Docker 构建问题解决方案](./docker-build-fix.md)
- [部署快速参考](./deployment-quick-reference.md)
- [GitHub Actions 部署指南](./github-actions-deploy.md)

---

## 常见问题

### Q: 为什么修复后还是 404？

**A**: 可能原因：
1. 浏览器缓存 - 清除缓存或硬刷新（Ctrl+Shift+R）
2. Docker 镜像未更新 - 删除旧镜像重新加载
3. 端口冲突 - 检查 5000 端口是否被占用

### Q: 如何确认静态文件存在？

**A**: 运行调试脚本
```bash
./scripts/debug-docker-static.sh
```

### Q: 需要重新构建吗？

**A**: 如果 Dockerfile 已修复，只需要：
1. 重新构建镜像（GitHub Actions）
2. 加载新镜像
3. 重新部署

---

## 快速检查清单

部署前：

- [ ] Dockerfile 包含三个 COPY 命令
- [ ] 使用最新的 Dockerfile
- [ ] standalone 复制带 trailing slash

部署后：

- [ ] 容器正常运行
- [ ] `.next/static` 目录存在
- [ ] `public` 目录存在
- [ ] 静态资源可访问
- [ ] 页面有样式

---

## 总结

**核心问题**：Next.js standalone 输出不完整，需要单独复制静态资源

**解决关键**：
1. ✅ 使用 `/.next/standalone/`（带 trailing slash）
2. ✅ 单独复制 `./.next/static`
3. ✅ 单独复制 `./public`

**推荐工具**：
- `./scripts/fix-static-404.sh` - 自动修复
- `./scripts/debug-docker-static.sh` - 调试检查

**快速命令**：
```bash
docker stop ant-ai-nav && docker rm ant-ai-nav
docker rmi ant-ai-nav:latest
docker load < docker-image.tar.gz
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

---

**更新时间**: 2025-04-01
