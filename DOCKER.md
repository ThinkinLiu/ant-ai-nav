# Docker 快速部署

## 一键部署

```bash
# 1. 配置环境变量
cp .env.docker .env
nano .env  # 修改配置

# 2. 一键启动
chmod +x start.sh
./start.sh
```

## 手动部署

```bash
# 1. 创建 .env 文件
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
EOF

# 2. 构建并启动
docker-compose up -d --build
```

## 低内存服务器（1G 内存）

```bash
# 添加 2G swap 空间
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 验证
free -h
```

## 常用命令

```bash
docker-compose ps        # 查看状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启
docker-compose down      # 停止
```

---

## 宝塔 Nginx 配置

### 步骤一：创建网站

1. 登录**宝塔面板**
2. 点击左侧菜单 **「网站」**
3. 点击 **「添加站点」**
4. 填写配置：

| 配置项 | 值 |
|--------|-----|
| 域名 | `your-domain.com`（你的域名） |
| 根目录 | `/www/wwwroot/your-domain.com`（默认即可） |
| PHP版本 | **纯静态** |
| 数据库 | 不创建 |

5. 点击 **「提交」** 创建网站

### 步骤二：配置反向代理

1. 在网站列表中，点击刚创建的网站 **「设置」**
2. 点击左侧 **「反向代理」** 选项卡
3. 点击 **「添加反向代理」**
4. 填写配置：

| 配置项 | 值 |
|--------|-----|
| 代理名称 | `ant-ai-nav` |
| 目标URL | `http://127.0.0.1:5000` |
| 发送域名 | `$host` |

5. 点击 **「提交」** 保存

### 步骤三：手动配置 Nginx（可选，更精细控制）

如果需要更精细的控制，可以手动编辑 Nginx 配置：

1. 在网站设置中，点击 **「配置文件」**
2. 在 `server` 块内添加以下配置：

```nginx
# 代理到 Docker 容器
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    
    # WebSocket 支持
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    
    # 代理头设置
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 超时设置
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # 缓存控制
    proxy_cache_bypass $http_upgrade;
}

# Next.js 静态资源缓存
location /_next/static/ {
    proxy_pass http://127.0.0.1:5000;
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# 图片资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
    proxy_pass http://127.0.0.1:5000;
    expires 30d;
}
```

3. 点击 **「保存」**
4. 点击 **「重载配置」** 使配置生效

### 步骤四：配置 SSL 证书

1. 在网站设置中，点击 **「SSL」** 选项卡
2. 选择 **「Let's Encrypt」**
3. 勾选你的域名
4. 点击 **「申请」**
5. 申请成功后，开启 **「强制HTTPS」**

### 步骤五：验证配置

```bash
# 检查 Nginx 配置语法
nginx -t

# 重载 Nginx
nginx -s reload

# 测试访问
curl -I https://your-domain.com
```

---

## 完整宝塔 Nginx 配置示例

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书（宝塔自动生成）
    # ssl_certificate /www/server/panel/vhost/cert/your-domain.com/fullchain.pem;
    # ssl_certificate_key /www/server/panel/vhost/cert/your-domain.com/privkey.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
    
    # 代理到 Docker 容器
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
    }
    
    # 静态资源缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:5000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
    
    # 访问日志
    access_log /www/wwwlogs/your-domain.com.log;
    error_log /www/wwwlogs/your-domain.com.error.log;
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 更新部署

```bash
cd /www/wwwroot/ant-ai-nav
git pull
docker-compose down
docker-compose up -d --build
```

## 故障排查

```bash
# 查看 Docker 容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f

# 查看 Nginx 错误日志
tail -f /www/wwwlogs/your-domain.com.error.log

# 检查端口监听
netstat -tlnp | grep 5000

# 测试后端服务
curl http://127.0.0.1:5000
```
