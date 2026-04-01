# Docker 部署指南

本文档提供蚂蚁AI导航项目的 Docker 容器化部署方案，适用于 CentOS 7 等旧系统环境。

## 一、环境要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Docker | 20.10+ | 容器运行环境 |
| Docker Compose | 2.0+ | 容器编排工具 |

## 二、安装 Docker

### CentOS / RHEL

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证安装
docker -v
```

### Ubuntu / Debian

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 安装 Docker Compose（如果未自动安装）
apt-get install docker-compose-plugin

# 验证安装
docker -v
docker compose version
```

## 三、项目部署

### 🚀 推荐：使用 GitHub Actions 构建（适合低内存服务器）

如果您的服务器内存较小（如 1GB），建议使用 GitHub Actions 在云端构建 Docker 镜像，然后在服务器上下载并加载。

#### 步骤 1：配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

1. 进入仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJ...` |

#### 步骤 2：触发构建

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **Build and Export Docker Image** 工作流
3. 点击 **Run workflow**，选择要构建的分支（默认 `main`）
4. 等待构建完成（约 5-10 分钟）

#### 步骤 3：下载并加载镜像

```bash
# 在服务器上执行

# 1. 下载构建产物
# 在 GitHub Actions 页面，构建完成后下载 docker-image artifact
# 解压得到 ant-ai-nav.tar.gz

# 2. 上传到服务器
scp ant-ai-nav.tar.gz root@your-server:/www/wwwroot/ant-ai-nav/

# 3. 加载镜像
cd /www/wwwroot/ant-ai-nav
docker load < ant-ai-nav.tar.gz

# 4. 标记镜像（如果需要）
docker tag ant-ai-nav:latest ant-ai-nav:latest
```

#### 步骤 4：启动服务

```bash
# 配置环境变量（如前面的"第二步"所示）
# 创建 docker-compose.yml 文件

# 启动服务
docker-compose up -d
```

### 方式A：本地构建（适合内存充足的服务器）

#### 第一步：上传项目代码

```bash
# 创建项目目录
mkdir -p /www/wwwroot/ant-ai-nav
cd /www/wwwroot/ant-ai-nav

# 方式A：Git 克隆（推荐）
git clone https://github.com/your-username/ant-ai-nav.git .

# 方式B：上传压缩包
# 将项目压缩包上传到服务器后解压
```

### 第二步：配置环境变量

```bash
# 创建环境变量文件
cat > .env.local << 'EOF'
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=蚂蚁AI导航

# 运行环境
NODE_ENV=production
EOF
```

### 第三步：构建并启动

```bash
cd /www/wwwroot/ant-ai-nav

# 构建镜像并启动（首次部署）
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 第四步：验证部署

```bash
# 检查容器状态
docker ps

# 检查端口响应
curl http://127.0.0.1:5000

# 查看应用日志
docker-compose logs app
```

## 四、Nginx 配置

### 在宝塔面板配置反向代理

1. **宝塔面板** → **网站** → **添加站点**
2. 填写域名，PHP 选择「纯静态」
3. 网站设置 → **反向代理** → **添加反向代理**
   - 代理名称：`ant-ai-nav`
   - 目标URL：`http://127.0.0.1:5000`
   - 发送域名：`$host`

### 或手动配置 Nginx

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

## 五、SSL 证书配置

1. 宝塔面板 → 网站 → 设置 → **SSL**
2. 选择 **Let's Encrypt** 免费证书
3. 点击申请
4. 开启 **强制 HTTPS**

## 六、常用命令

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
cd /www/wwwroot/ant-ai-nav

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

## 七、进阶配置

### 资源限制

编辑 `docker-compose.yml`：

```yaml
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

## 八、故障排查

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

### 镜像构建失败

```bash
# 清理构建缓存重新构建
docker-compose build --no-cache

# 查看构建日志
docker-compose build --progress=plain
```

## 九、备份与恢复

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

## 十、监控与日志

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

---

## 快速参考卡

| 操作 | 命令 |
|------|------|
| 启动 | `docker-compose up -d` |
| 停止 | `docker-compose down` |
| 重启 | `docker-compose restart` |
| 日志 | `docker-compose logs -f` |
| 状态 | `docker-compose ps` |
| 更新 | `docker-compose up -d --build` |
| 进入容器 | `docker exec -it ant-ai-nav sh` |
