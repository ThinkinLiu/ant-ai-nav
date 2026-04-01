# Docker 部署指南

本文档提供蚂蚁AI导航项目的 Docker 容器化部署方案。

## 前置要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Docker | 20.10+ | 容器运行环境 |
| Docker Compose | 2.0+ | 容器编排工具（可选） |

## 快速开始

### 方法 1：使用 GitHub Actions 构建（推荐）

如果您的服务器内存较小（如 1GB），建议使用 GitHub Actions 在云端构建 Docker 镜像。

#### 步骤 1：配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

1. 进入仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJ...` |

**注意**：可以不配置，部署后通过 `/settings` 页面配置。

#### 步骤 2：触发构建

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **Build Static Export** 工作流
3. 点击 **Run workflow**
4. 等待构建完成

#### 步骤 3：下载并部署

```bash
# 下载构建产物
# 在 Actions 页面下载 docker-image artifact

# 解压并加载镜像
tar -xzf ant-ai-nav.tar.gz
docker load < ant-ai-nav.tar.gz

# 运行容器
docker run -d -p 5000:5000 --name ant-ai-nav ant-ai-nav:latest
```

### 方法 2：本地构建

#### 步骤 1：克隆项目

```bash
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
cd ant-ai-nav
```

#### 步骤 2：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: ant-ai-nav:latest
    container_name: ant-ai-nav
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./config:/app/config
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 步骤 3：构建并启动

```bash
# 构建并启动
docker-compose up -d --build

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 首次配置

### 访问配置页面

首次访问网站会自动跳转到配置页面：

```
http://your-domain.com/settings
```

### 配置数据库

填写 Supabase 连接信息：

- **Supabase URL**: `https://your-project.supabase.co`
- **Supabase Anonymous Key**: 在 Supabase 控制台获取

点击"验证连接" → "保存配置" → 完成！

## Nginx 配置

### 宝塔面板配置

1. **宝塔面板** → **网站** → **添加站点**
2. 填写域名，PHP 选择「纯静态」
3. 网站设置 → **反向代理** → **添加反向代理**
   - 代理名称：`ant-ai-nav`
   - 目标URL：`http://127.0.0.1:5000`

### 手动配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL 证书配置

### 使用宝塔面板

1. 宝塔面板 → 网站 → 设置 → **SSL**
2. 选择 **Let's Encrypt** 免费证书
3. 点击申请
4. 开启 **强制 HTTPS**

### 使用 Certbot

```bash
# 安装 certbot
apt-get install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com
```

## 常用命令

### 容器管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 进入容器
docker exec -it ant-ai-nav sh
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 查看日志确认
docker-compose logs -f
```

### 清理资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 一键清理
docker system prune -a
```

## 故障排查

### 静态资源 404

**症状**：页面能访问但样式和脚本全部 404

**解决方案**：

[查看静态资源 404 修复指南 →](./docker-static-404-fix.md)

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs --tail=100 app

# 检查容器状态
docker inspect ant-ai-nav

# 手动启动容器排查
docker run -it --rm ant-ai-nav:latest sh
```

### 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 5000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "5001:5000"  # 改为其他端口
```

### 内存不足

```bash
# 查看容器资源使用
docker stats ant-ai-nav

# 增加内存限制或清理资源
docker system prune -a
```

## 镜像构建失败

```bash
# 清理构建缓存重新构建
docker-compose build --no-cache

# 查看构建日志
docker-compose build --progress=plain
```

## 备份与恢复

### 备份

```bash
# 备份镜像
docker save ant-ai-nav:latest | gzip > ant-ai-nav-backup.tar.gz

# 备份配置文件
tar -czvf ant-ai-nav-config.tar.gz .env.local docker-compose.yml
```

### 恢复

```bash
# 恢复镜像
docker load < ant-ai-nav-backup.tar.gz

# 恢复配置文件
tar -xzvf ant-ai-nav-config.tar.gz

# 启动服务
docker-compose up -d
```

## 进阶配置

### 资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'        # 最大 CPU 核心数
          memory: 2G       # 最大内存
        reservations:
          cpus: '0.5'      # 最小 CPU 核心数
          memory: 512M     # 最小内存
```

### 多实例部署

```bash
# 启动多个实例（负载均衡）
docker-compose up -d --scale app=3

# 需要配合 Nginx 负载均衡使用
```

### 自动重启

```yaml
# docker-compose.yml 中已配置
restart: unless-stopped
```

### 健康检查

```yaml
# docker-compose.yml 中已配置
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 监控与日志

### 日志管理

```yaml
# docker-compose.yml 中已配置日志轮转
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # 单个日志文件最大 10MB
    max-file: "3"      # 保留最近 3 个日志文件
```

### 实时监控

```bash
# 实时查看资源使用
docker stats ant-ai-nav

# 实时查看日志
docker-compose logs -f --tail=100
```

## 更多资源

- [静态资源 404 修复指南](./docker-static-404-fix.md)
- [运行时配置指南](./runtime-database-config.md)
- [管理后台配置指南](./admin-settings-guide.md)
- [数据库部署指南](./database-deployment.md)

---

**最后更新**: 2025-04-01
