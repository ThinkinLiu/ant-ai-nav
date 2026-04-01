# 宝塔服务器部署指南

本文档提供蚂蚁AI导航项目在宝塔面板环境下的完整部署方案。

## 一、服务器要求

### 最低配置
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB
- 系统: CentOS 7+ / Ubuntu 18+ / Debian 10+

### 推荐配置
- CPU: 4核
- 内存: 8GB
- 硬盘: 50GB

## 二、宝塔面板安装

### 1. 安装宝塔面板

**CentOS:**
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

**Ubuntu/Deepin:**
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

**Debian:**
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && bash install.sh ed8484bec
```

### 2. 登录宝塔面板
安装完成后，使用终端显示的面板地址和账号密码登录宝塔面板。

## 三、环境安装

### 1. 在宝塔软件商店安装以下软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Nginx | 1.20+ | Web服务器 |
| MySQL | 5.7+ 或 8.0 | 数据库（可选，项目使用Supabase） |
| PM2管理器 | 最新版 | Node.js进程管理 |
| Node.js版本管理器 | 最新版 | Node.js环境 |

### 2. 安装 Node.js

1. 在宝塔软件商店找到「Node.js版本管理器」
2. 点击「设置」进入管理界面
3. 安装 Node.js **20.x** 或 **22.x** 版本
4. 设置为默认版本

### 3. 安装 pnpm

通过宝塔终端执行：
```bash
npm install -g pnpm
```

## 四、项目部署

### 方式一：使用部署脚本（推荐）

#### 1. 上传部署脚本

将 `deploy.sh` 脚本上传到服务器 `/www/wwwroot/` 目录：

```bash
# 赋予执行权限
chmod +x /www/wwwroot/deploy.sh
```

#### 2. 创建项目目录

```bash
mkdir -p /www/wwwroot/ant-ai-nav
cd /www/wwwroot/ant-ai-nav
```

#### 3. 上传项目代码

**方式A：从Git拉取（推荐）**
```bash
cd /www/wwwroot/ant-ai-nav
git clone https://github.com/ThinkinLiu/ant-ai-nav.git .
```

**方式B：上传压缩包**
1. 在本地执行 `pnpm build` 构建项目
2. 打包以下文件/文件夹：
   - `.next/` (构建产物)
   - `public/` (静态资源)
   - `package.json`
   - `pnpm-lock.yaml`
   - `.env.production` (生产环境变量)
   - `.coze` (配置文件)
3. 上传到服务器 `/www/wwwroot/ant-ai-nav/`

#### 4. 配置环境变量

创建 `.env.local` 文件：
```bash
nano /www/wwwroot/ant-ai-nav/.env.local
```

填入以下内容（根据实际情况修改）：
```env
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=蚂蚁AI导航

# 其他配置
NODE_ENV=production
```

#### 5. 执行部署脚本

```bash
cd /www/wwwroot
./deploy.sh ant-ai-nav
```

### 方式二：手动部署

#### 1. 安装依赖

```bash
cd /www/wwwroot/ant-ai-nav
pnpm install --prod
```

#### 2. 构建项目（如果需要）

```bash
pnpm build
```

#### 3. 使用 PM2 启动

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 五、Nginx 配置

### 1. 在宝塔创建网站

1. 点击「网站」→「添加站点」
2. 填写域名（如：mayiai.com）
3. PHP版本选择「纯静态」
4. 创建数据库（可选）

### 2. 配置反向代理

点击网站「设置」→「反向代理」→「添加反向代理」：

| 配置项 | 值 |
|--------|-----|
| 代理名称 | ant-ai-nav |
| 目标URL | http://127.0.0.1:5000 |
| 发送域名 | $host |

### 3. 手动配置 Nginx（高级）

点击网站「设置」→「配置文件」，在 `server` 块内添加：

```nginx
# 将以下内容添加到 server 块内

# 代理到 Next.js 应用
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}

# Next.js 静态资源缓存
location /_next/static/ {
    alias /www/wwwroot/ant-ai-nav/.next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# 公共静态资源
location /public/ {
    alias /www/wwwroot/ant-ai-nav/public/;
    expires 30d;
}
```

## 六、SSL 证书配置

### 1. 在宝塔申请免费证书

1. 点击网站「设置」→「SSL」
2. 选择「Let's Encrypt」免费证书
3. 点击「申请」
4. 开启「强制HTTPS」

### 2. 或上传自有证书

1. 点击网站「设置」→「SSL」
2. 选择「其他证书」
3. 粘贴证书内容（PEM格式）和私钥内容
4. 保存并开启「强制HTTPS」

## 七、PM2 管理配置

### 1. 通过宝塔面板管理

在宝塔软件商店找到「PM2管理器」，可以：
- 查看运行状态
- 重启/停止应用
- 查看日志
- 监控资源

### 2. 命令行管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs ant-ai-nav

# 重启应用
pm2 restart ant-ai-nav

# 停止应用
pm2 stop ant-ai-nav

# 重新加载（无停机）
pm2 reload ant-ai-nav
```

## 八、更新部署

### 自动更新脚本

创建更新脚本 `update.sh`：

```bash
#!/bin/bash
# 项目更新脚本

PROJECT_DIR="/www/wwwroot/ant-ai-nav"
LOG_FILE="/www/wwwroot/update.log"

echo "$(date '+%Y-%m-%d %H:%M:%S') 开始更新..." >> $LOG_FILE

cd $PROJECT_DIR

# 拉取最新代码
git pull origin main >> $LOG_FILE 2>&1

# 安装依赖
pnpm install >> $LOG_FILE 2>&1

# 构建
pnpm build >> $LOG_FILE 2>&1

# 重启服务
pm2 restart ant-ai-nav >> $LOG_FILE 2>&1

echo "$(date '+%Y-%m-%d %H:%M:%S') 更新完成" >> $LOG_FILE
```

### 手动更新步骤

```bash
cd /www/wwwroot/ant-ai-nav

# 拉取代码
git pull

# 安装依赖
pnpm install

# 构建
pnpm build

# 重启服务
pm2 restart ant-ai-nav
```

## 九、常用命令速查

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs ant-ai-nav --lines 100

# 清空日志
pm2 flush

# 监控面板
pm2 monit

# 查看端口占用
netstat -tlnp | grep 5000

# 查看 Node 版本
node -v

# 查看 pnpm 版本
pnpm -v
```

## 十、常见问题

### 1. 端口被占用

```bash
# 查看占用进程
lsof -i:5000

# 杀死进程
kill -9 <PID>
```

### 2. 内存不足

编辑 PM2 配置文件，限制内存：
```javascript
max_memory_restart: '1G'
```

### 3. 权限问题

```bash
# 修复文件权限
chown -R www:www /www/wwwroot/ant-ai-nav
chmod -R 755 /www/wwwroot/ant-ai-nav
```

### 4. 构建失败

检查 Node.js 版本是否正确：
```bash
node -v  # 应该是 20.x 或 22.x
```

## 十一、性能优化建议

### 1. 开启 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 2. 开启 HTTP/2

在宝塔 SSL 设置中开启 HTTP/2

### 3. 配置 CDN

建议将静态资源托管到 CDN，提升访问速度

## 十二、监控与备份

### 1. 设置监控告警

在宝塔面板「监控」中设置：
- CPU 使用率告警（建议 >80%）
- 内存使用率告警（建议 >85%）
- 磁盘使用率告警（建议 >90%）

### 2. 定期备份

在宝塔面板「计划任务」中添加：
- 备份数据库（如有本地数据库）
- 备份网站目录
- 备份周期：建议每天

---

如有问题，请查看应用日志：
```bash
pm2 logs ant-ai-nav
```
