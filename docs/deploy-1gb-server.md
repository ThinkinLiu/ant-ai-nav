# 1GB 服务器部署指南

本文档针对内存有限的 1GB 服务器，提供蚂蚁AI导航的优化部署方案。

## 📊 内存使用分析

### 优化前 vs 优化后

| 项目 | 优化前 | 优化后 | 节省 |
|------|--------|--------|------|
| 运行时内存 | ~800MB | ~450-500MB | ~300MB |
| 依赖包数量 | 75+ | 46 | 29 |
| 镜像大小 | ~350MB | ~280MB | ~70MB |

### 1GB 服务器内存分配

| 组件 | 内存占用 | 剩余 |
|------|---------|------|
| 系统保留 | ~250MB | 750MB |
| Docker 容器 | ~450MB | 300MB |
| 应用运行 | ~400MB | 100MB |

**结论：优化后可稳定运行在 1GB 服务器**

---

## 🚀 快速部署

### 方式一：GitHub Actions 构建（推荐）

**优势：**
- 无需本地构建，节省服务器内存
- 云端构建速度快（约 5-10 分钟）
- 构建过程稳定可靠

#### 步骤 1：配置 GitHub Secrets

在 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** 中添加：

| Secret 名称 | 说明 | 必填 |
|------------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |

#### 步骤 2：触发构建

1. 进入仓库 → **Actions** 标签页
2. 选择 **Build Static Export** 工作流
3. 点击 **Run workflow**
4. 选择分支（默认 `main`）
5. 点击绿色 **Run workflow** 按钮

#### 步骤 3：下载并部署

```bash
# 在服务器上执行

# 1. 下载构建产物
# 在 GitHub Actions 页面，构建完成后点击 Artifacts
# 下载 docker-image artifact，解压得到 ant-ai-nav.tar.gz

# 2. 上传到服务器
scp ant-ai-nav.tar.gz root@your-server:/www/wwwroot/ant-ai-nav/

# 3. 加载镜像
cd /www/wwwroot/ant-ai-nav
docker load < ant-ai-nav.tar.gz

# 4. 配置环境变量
cat > .env.local << 'EOF'
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
EOF

# 5. 启动服务
docker-compose up -d

# 6. 查看日志
docker-compose logs -f
```

---

### 方式二：本地构建（不推荐）

**警告：** 1GB 服务器本地构建可能会因为内存不足而失败。强烈建议使用 GitHub Actions 构建。

如果必须本地构建，请先添加 swap 空间：

```bash
# 添加 2GB swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 验证
free -h
```

然后构建：

```bash
cd /www/wwwroot/ant-ai-nav
docker-compose build
docker-compose up -d
```

---

## 🔧 配置文件

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    image: ant-ai-nav:latest
    container_name: ant-ai-nav
    restart: unless-stopped
    ports:
      - "5000:5000"
    env_file:
      - .env.local
    environment:
      - NODE_ENV=production
      - PORT=5000
    # 内存限制（可选）
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### .env.local

```bash
# 必需配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 可选配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📋 验证部署

### 1. 检查容器状态

```bash
docker ps
```

应该看到 `ant-ai-nav` 容器正在运行。

### 2. 检查内存使用

```bash
docker stats ant-ai-nav
```

运行时内存应该在 400-500MB 之间。

### 3. 测试服务响应

```bash
curl http://localhost:5000
```

应该返回 HTML 内容。

### 4. 查看日志

```bash
docker-compose logs -f
```

---

## 🔍 故障排查

### 问题 1：容器启动失败

**症状：** 容器无法启动或立即退出

**原因：** 内存不足

**解决方案：**

```bash
# 检查内存使用
free -h

# 检查容器日志
docker-compose logs --tail=50

# 如果内存不足，重启服务
docker-compose restart
```

### 问题 2：静态资源 404

**症状：** CSS/JS 文件返回 404

**原因：** 构建时 static 文件未正确复制

**解决方案：**

```bash
# 重新构建镜像
docker-compose build --no-cache

# 重启容器
docker-compose up -d
```

### 问题 3：构建失败（内存不足）

**症状：** 构建过程中出现 OOM killed

**原因：** 本地构建内存不足

**解决方案：**

使用 GitHub Actions 构建代替本地构建。

---

## 💡 优化建议

### 1. 添加 Swap（提高稳定性）

```bash
# 添加 2GB swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 2. 限制内存使用

在 `docker-compose.yml` 中添加资源限制：

```yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

### 3. 启用自动重启

```yaml
restart: unless-stopped
```

### 4. 定期清理无用资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune
```

---

## 📈 性能监控

### 实时监控内存

```bash
# 实时查看容器资源使用
docker stats ant-ai-nav

# 或使用 watch
watch -n 1 docker stats ant-ai-nav --no-stream
```

### 设置告警

使用 Uptime Kungfu 或其他监控工具设置：

- 内存使用超过 500MB 告警
- 容器重启告警
- 响应时间超过 3s 告警

---

## 🔄 更新部署

### 更新应用

```bash
cd /www/wwwroot/ant-ai-nav

# 1. 拉取最新代码
git pull

# 2. 触发 GitHub Actions 构建
# 或下载新的镜像

# 3. 加载新镜像
docker load < ant-ai-nav.tar.gz

# 4. 重启容器
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

---

## 📚 相关文档

- [Docker 部署指南](./deploy-docker.md)
- [完整部署指南](./deployment-guide.md)
- [故障排查](./coze-env-troubleshooting.md)

---

## ✅ 检查清单

部署前请确认：

- [ ] 服务器内存 >= 1GB
- [ ] Docker 已安装
- [ ] Docker Compose 已安装
- [ ] GitHub Secrets 已配置
- [ ] .env.local 已创建
- [ ] docker-compose.yml 已配置
- [ ] 端口 5000 未被占用
- [ ] Swap 已添加（推荐）
