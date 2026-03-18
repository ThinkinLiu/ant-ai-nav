# 宝塔部署快速指南

> 5分钟快速部署蚂蚁AI导航到宝塔服务器

## 🐳 方式一：Docker 部署（推荐）

> 适用于 CentOS 7 等旧系统，不受 GLIBC 版本限制

### 准备工作

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl start docker
systemctl enable docker

# 验证
docker -v
```

### 部署步骤

```bash
# 1. 创建项目目录并进入
mkdir -p /www/wwwroot/ant-ai-nav
cd /www/wwwroot/ant-ai-nav

# 2. 克隆代码
git clone https://github.com/your-username/ant-ai-nav.git .

# 3. 配置环境变量
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
EOF

# 4. 一键部署
chmod +x deploy-docker.sh
./deploy-docker.sh ant-ai-nav
```

### 常用命令

```bash
docker-compose ps        # 查看状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启服务
docker-compose down      # 停止服务
```

---

## 📦 方式二：PM2 部署

> 适用于 Node.js 20+ 环境

### 准备工作

在宝塔软件商店安装：
1. **Nginx** - Web服务器
2. **PM2管理器** - Node.js进程管理
3. **Node.js版本管理器** - 安装Node.js 20+

```bash
# 安装 pnpm
npm install -g pnpm
```

### 部署步骤

```bash
# 1. 创建项目目录
mkdir -p /www/wwwroot/ant-ai-nav
cd /www/wwwroot/ant-ai-nav

# 2. 克隆代码
git clone https://github.com/your-username/ant-ai-nav.git .

# 3. 配置环境变量
nano .env.local

# 4. 安装依赖并构建
pnpm install
pnpm build

# 5. 启动服务
mkdir -p logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 常用命令

```bash
pm2 status              # 查看状态
pm2 logs ant-ai-nav     # 查看日志
pm2 restart ant-ai-nav  # 重启服务
```

---

## 🌐 Nginx 配置（通用）

1. 宝塔面板 → 网站 → 添加站点
2. 填写域名，PHP选择「纯静态」
3. 网站设置 → 反向代理 → 添加反向代理
   - 目标URL: `http://127.0.0.1:5000`
   - 发送域名: `$host`

### SSL 配置

1. 网站设置 → SSL → Let's Encrypt
2. 申请免费证书
3. 开启「强制HTTPS」

---

## ✅ 验证部署

```bash
curl http://127.0.0.1:5000
```

---

## 📚 详细文档

- [Docker 部署指南](./deploy-docker.md) - 完整 Docker 部署方案
- [宝塔部署指南](./deploy-baota.md) - PM2 部署方案
