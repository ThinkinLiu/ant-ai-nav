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

## 常用命令

```bash
docker-compose ps        # 查看状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启
docker-compose down      # 停止
```

## 配置 Nginx

宝塔面板配置反向代理到 `http://127.0.0.1:5000`

## 更新部署

```bash
git pull
docker-compose down
docker-compose up -d --build
```
