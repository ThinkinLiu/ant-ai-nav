# Docker 部署快速参考

本文档提供 Docker 部署的快速命令参考。

---

## 🚀 首次部署

### 使用 GitHub Actions 构建（推荐）

```bash
# 1. 配置 GitHub Secrets
# Settings → Secrets and variables → Actions
# 添加：NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. 触发构建
# Actions → Build Static Export → Run workflow

# 3. 下载构建产物

# 4. 上传到服务器
scp ant-ai-nav.tar.gz user@server:/tmp/

# 5. 加载镜像
docker load < /tmp/ant-ai-nav.tar.gz

# 6. 配置环境变量
cp .env.example .env
vi .env

# 7. 启动服务
docker-compose up -d

# 8. 验证
curl http://localhost:5000
```

---

## 🔄 更新部署

### 自动更新脚本（推荐）

```bash
# 1. 下载新镜像
# 2. 上传到服务器
scp ant-ai-nav.tar.gz user@server:/path/to/ant-ai-nav/

# 3. 运行更新脚本
cd /path/to/ant-ai-nav
./scripts/update-docker.sh
```

### 手动更新

```bash
# 停止容器
docker-compose down

# 删除旧镜像
docker rmi ant-ai-nav:latest

# 加载新镜像
docker load < ant-ai-nav-new.tar.gz

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## ✅ 验证更新

```bash
# 检查容器状态
docker-compose ps

# 检查服务响应
curl http://localhost:5000

# 查看日志
docker-compose logs --tail=50

# 检查镜像版本
docker images ant-ai-nav
```

---

## 🔧 常用命令

```bash
# 状态查看
docker-compose ps                    # 查看运行状态
docker-compose logs -f               # 查看日志
docker stats ant-ai-nav              # 查看资源使用

# 服务控制
docker-compose stop                  # 停止服务
docker-compose start                 # 启动服务
docker-compose restart               # 重启服务
docker-compose down                  # 停止并删除容器
docker-compose down -v               # 删除容器和卷（⚠️）

# 故障排查
docker-compose logs --tail=100       # 查看详细日志
docker inspect ant-ai-nav            # 查看容器详情
docker exec -it ant-ai-nav sh        # 进入容器
```

---

## 🆘 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs --tail=100

# 检查端口占用
netstat -tulpn | grep 5000

# 重启容器
docker-compose restart
```

### 服务无响应

```bash
# 检查容器状态
docker-compose ps

# 查看最新日志
docker-compose logs --tail=50

# 检查环境变量
docker-compose config

# 重启服务
docker-compose restart
```

### 磁盘空间不足

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 查看磁盘使用
docker system df
```

---

## 📦 备份与恢复

### 备份

```bash
# 备份数据卷
docker run --rm \
  -v ant-ai-nav_data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz /data

# 备份环境变量
cp .env .env.backup
```

### 恢复

```bash
# 恢复数据卷
docker run --rm \
  -v ant-ai-nav_data:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/backup.tar.gz -C /

# 恢复环境变量
cp .env.backup .env
```

---

## 🔐 安全建议

```bash
# 1. 使用非 root 用户运行
# 已在 Dockerfile 中配置

# 2. 限制容器权限
docker-compose up -d --read-only

# 3. 定期更新镜像
docker pull ant-ai-nav:latest
docker-compose up -d

# 4. 配置防火墙
# 只开放必要端口（5000）
ufw allow 5000/tcp
ufw enable

# 5. 使用 HTTPS
# 配置 Nginx 反向代理
```

---

## 📊 监控与日志

```bash
# 实时监控资源使用
docker stats ant-ai-nav

# 查看容器事件
docker events --filter container=ant-ai-nav

# 查看日志并过滤
docker-compose logs -f | grep -i error

# 导出日志
docker-compose logs > app.log
```

---

## 🌐 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

**详细文档**: [README.md - Docker 部署](../README.md#docker-部署)
