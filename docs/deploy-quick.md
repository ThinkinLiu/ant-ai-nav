# 宝塔部署快速指南

> 5分钟快速部署蚂蚁AI导航到宝塔服务器

## 📋 准备工作

### 服务器要求
- 宝塔面板 7.x+
- Node.js 20.x 或 22.x
- pnpm 包管理器
- PM2 管理器
- Nginx

### 安装必要软件

在宝塔软件商店安装：
1. **Nginx** - Web服务器
2. **PM2管理器** - Node.js进程管理
3. **Node.js版本管理器** - 安装Node.js 20+

### 安装 pnpm

```bash
npm install -g pnpm
```

## 🚀 部署步骤

### 第一步：创建项目目录

```bash
mkdir -p /www/wwwroot/ant-ai-nav
cd /www/wwwroot/ant-ai-nav
```

### 第二步：上传项目代码

**方式A：Git克隆（推荐）**
```bash
git clone https://github.com/your-username/ant-ai-nav.git .
```

**方式B：上传压缩包**
- 本地构建后打包上传
- 解压到项目目录

### 第三步：配置环境变量

```bash
nano .env.local
```

填入以下内容：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

### 第四步：安装依赖并构建

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 第五步：启动服务

```bash
# 创建日志目录
mkdir -p logs

# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 第六步：配置 Nginx

1. 宝塔面板 → 网站 → 添加站点
2. 填写域名，PHP选择「纯静态」
3. 网站设置 → 反向代理 → 添加反向代理
   - 目标URL: `http://127.0.0.1:5000`
   - 发送域名: `$host`

### 第七步：配置 SSL

1. 网站设置 → SSL → Let's Encrypt
2. 申请免费证书
3. 开启「强制HTTPS」

## ✅ 验证部署

```bash
# 检查服务状态
pm2 status

# 检查端口响应
curl http://127.0.0.1:5000

# 查看日志
pm2 logs ant-ai-nav
```

## 🔄 更新部署

```bash
cd /www/wwwroot/ant-ai-nav

# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 构建
pnpm build

# 重启服务
pm2 restart ant-ai-nav
```

## 🔧 常用命令

```bash
pm2 status              # 查看状态
pm2 logs ant-ai-nav     # 查看日志
pm2 restart ant-ai-nav  # 重启服务
pm2 stop ant-ai-nav     # 停止服务
pm2 monit               # 监控面板
```

## ⚠️ 常见问题

### 端口被占用
```bash
lsof -i:5000
kill -9 <PID>
```

### 权限问题
```bash
chown -R www:www /www/wwwroot/ant-ai-nav
chmod -R 755 /www/wwwroot/ant-ai-nav
```

### 内存不足
修改 `ecosystem.config.js`：
```javascript
max_memory_restart: '512M'
```

---

需要详细配置请查看 [完整部署文档](./deploy-baota.md)
