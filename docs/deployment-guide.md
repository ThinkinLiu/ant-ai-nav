# 部署配置指南

## 🚀 环境变量配置

部署时需要配置以下必需的环境变量：

### 必需环境变量

```bash
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0

# Coze API 配置（AI 功能）
COZE_WORKLOAD_IDENTITY_API_KEY=UFpMZ3VGRGdYYnU3M2RWR3pQajNzdE9yek1iaTJFaXM6cHBiVVhFVTZNaG43N2RacnVpS3FROVl6YzZ0ZEZmdWxTWEV0dUd2bG94ekRobGtyaDJZTG9OODNCRkd0Y1J4dQ==
COZE_WORKLOAD_IDENTITY_CLIENT_ID=PZLguFDgXbu73dVGzPj3stOrzMbi2Eis
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=ppbUXEU6Mhn77dZruiKqQ9Yzc6tdFfulSXEtuGvloxzDhlkrh2YLoN83BFGtcRxu
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
COZE_INTEGRATION_MODEL_BASE_URL=https://integration.coze.cn/api/v3
COZE_WORKLOAD_IDENTITY_TOKEN_ENDPOINT=https://api.coze.cn/.well-known/token
COZE_WORKLOAD_ACCESS_TOKEN_ENDPOINT=https://api.coze.cn/.well-known/token
```

## 📦 各平台部署配置

### 1. Vercel 部署

**方法一：通过 Vercel Dashboard**
1. 进入项目设置 → Environment Variables
2. 添加上述所有环境变量
3. 选择环境：Production, Preview, Development
4. 重新部署项目

**方法二：通过 Vercel CLI**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 粘贴值：https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 粘贴值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 重复以上步骤添加其他环境变量

# 部署
vercel --prod
```

### 2. Docker 部署

**创建 .env 文件**
```bash
# 在项目根目录创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，填入实际值
vim .env
```

**docker-compose.yml 已配置**
```yaml
# 项目已包含 docker-compose.yml
# 直接运行即可
docker-compose up -d
```

### 3. Railway 部署

1. 连接 GitHub 仓库
2. 在项目设置中添加环境变量：
   - 点击 Variables 标签
   - 点击 "Add Variable"
   - 输入变量名和值
3. Railway 会自动部署

### 4. 传统服务器部署

**方式一：创建 .env.local 文件**
```bash
# 在项目根目录创建 .env.local
vim .env.local

# 粘贴所有环境变量

# 构建并启动
pnpm install
pnpm build
pnpm start
```

**方式二：系统环境变量**
```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export NEXT_PUBLIC_SUPABASE_URL="https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 使配置生效
source ~/.bashrc  # 或 source ~/.zshrc

# 启动应用
pnpm start
```

**方式三：使用 PM2**
```bash
# 创建 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ant-ai-nav',
    script: 'pnpm',
    args: 'start',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      // 其他环境变量...
    }
  }]
}

# 启动
pm2 start ecosystem.config.js
```

## ✅ 验证配置

部署完成后，访问以下接口验证配置是否成功：

```bash
# 检查首页是否正常加载
curl https://your-domain.com/

# 检查 API 是否正常
curl https://your-domain.com/api/categories
```

## 🔒 安全注意事项

1. **不要提交 .env.local 到 Git**
   - 该文件已在 .gitignore 中
   - 只提交 .env.example 模板

2. **生产环境密钥安全**
   - 定期更换 API 密钥
   - 使用不同的 Supabase 项目（开发/生产分离）
   - 限制密钥的访问权限

3. **Supabase 安全规则**
   - 配置 Row Level Security (RLS)
   - 设置适当的表访问权限
   - 定期检查访问日志

## 🐛 常见问题

### Q: 部署后提示 "Supabase is not configured"
**A:** 检查环境变量是否正确设置：
- 变量名拼写是否正确（注意 `NEXT_PUBLIC_` 前缀）
- 变量值是否完整（没有多余的空格或换行）
- 是否在正确的环境设置了变量（Production/Preview/Development）

### Q: 本地正常，部署后数据库连接失败
**A:** 可能原因：
- 部署平台的环境变量未设置
- Supabase 防火墙限制（添加服务器 IP 到白名单）
- 网络问题（检查 Supabase 服务状态）

### Q: 如何查看当前的环境变量？
**A:** 
- Vercel: Dashboard → Settings → Environment Variables
- Docker: `docker exec <container> printenv`
- PM2: `pm2 show <app-name>`

## 📞 获取帮助

- Supabase 文档: https://supabase.com/docs
- Next.js 环境变量: https://nextjs.org/docs/basic-features/environment-variables
- 项目 Issues: [GitHub Issues]
