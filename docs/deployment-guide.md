# 部署指南

本文档详细介绍如何在 **Coze 环境** 和 **独立服务器环境** 部署蚂蚁AI导航项目。

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [Coze 环境部署](#coze-环境部署)
- [独立服务器部署](#独立服务器部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 环境要求

### 必需环境
- **Node.js**: 18.x 或更高版本
- **pnpm**: 8.x 或更高版本
- **Git**: 用于克隆代码库

### 必需账号
- **Supabase 账号**: 用于数据库服务
  - 注册地址: https://supabase.com
  - 免费额度: 500MB 数据库，1GB 文件存储

### 可选服务
- **Coze 平台账号**: 用于 AI 生成功能
  - 注册地址: https://www.coze.cn
- **S3 兼容存储**: 用于文件上传功能
  - 推荐服务: Cloudflare R2, AWS S3, 阿里云 OSS

---

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ant-ai-navigation
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

根据你的部署环境，选择对应的配置模板：

#### Coze 环境
```bash
# 参考 .env.example.coze 配置 Coze 平台环境变量
cat .env.example.coze
```

#### 独立服务器
```bash
# 复制模板并编辑
cp .env.example.standalone .env.local
# 编辑 .env.local 填写实际配置
```

### 4. 检查环境配置

```bash
# 运行环境检查脚本
pnpm tsx scripts/check-env.ts

# 显示详细配置
pnpm tsx scripts/check-env.ts --config

# JSON 格式输出（适合 CI/CD）
pnpm tsx scripts/check-env.ts --json
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000 查看效果。

---

## Coze 环境部署

### 第一步：准备 Supabase 数据库

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 创建新项目或使用现有项目
3. 获取项目配置信息：
   - **Project URL**: Settings → API → Project URL
   - **Anon Key**: Settings → API → Project API keys → anon public

### 第二步：配置 Coze 环境变量

在 Coze 平台设置以下环境变量：

#### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGc...` |

#### 可选变量（AI 功能）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 | 从 Coze 平台获取 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | Coze 客户端 ID | 从 Coze 平台获取 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | Coze 客户端密钥 | 从 Coze 平台获取 |

### 第三步：部署到 Coze

1. 在 Coze 平台创建新的应用
2. 连接你的代码仓库
3. 配置构建命令（已内置）：
   ```bash
   bash ./scripts/build.sh
   ```
4. 配置启动命令（已内置）：
   ```bash
   bash ./scripts/start.sh
   ```
5. 部署应用

### 第四步：验证部署

部署完成后，访问应用 URL，检查：
- ✅ 页面正常加载
- ✅ 数据库连接正常
- ✅ AI 功能可用（如已配置）

---

## 独立服务器部署

### 方案一：使用 Docker（推荐）

#### 1. 构建镜像

```bash
# 构建生产镜像
docker build -t ant-ai-navigation:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name ant-ai-nav \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... \
  -e COZE_WORKLOAD_IDENTITY_API_KEY=your-key \
  ant-ai-navigation:latest
```

#### 3. 使用 Docker Compose（推荐）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: ant-ai-navigation:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
      - COZE_WORKLOAD_IDENTITY_API_KEY=your-key
      - NODE_ENV=production
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

### 方案二：使用 PM2

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 构建项目

```bash
# 配置环境变量
cp .env.example.standalone .env.local
# 编辑 .env.local

# 安装依赖
pnpm install --frozen-lockfile

# 构建
pnpm run build
```

#### 3. 启动服务

```bash
pm2 start pnpm --name "ant-ai-nav" -- start
```

#### 4. 设置开机自启

```bash
pm2 startup
pm2 save
```

### 方案三：使用 Vercel / Netlify

#### Vercel 部署

1. 连接 GitHub 仓库
2. 自动检测 Next.js 框架
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

#### Netlify 部署

1. 连接 GitHub 仓库
2. 构建命令: `pnpm run build`
3. 发布目录: `.next`
4. 配置环境变量
5. 部署

---

## 环境变量配置

### 环境变量命名支持

项目支持多种环境变量命名方式，优先级从高到低：

#### Supabase URL

1. `NEXT_PUBLIC_SUPABASE_URL` （标准 Next.js 命名）
2. `COZE_SUPABASE_URL` （Coze 环境命名）
3. `SUPABASE_URL` （通用命名）

#### Supabase Anon Key

1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` （标准命名）
2. `COZE_SUPABASE_ANON_KEY` （Coze 环境命名）
3. `SUPABASE_ANON_KEY` （通用命名）
4. `SUPABASE_SERVICE_ROLE_KEY` （服务端命名）

### 环境检测

项目会自动检测运行环境：

- **Coze 环境**: 检测到 `COZE_WORKSPACE_PATH` 或 `COZE_INTEGRATION_BASE_URL`
- **独立服务器**: 生产环境且非 Coze 环境
- **开发环境**: 本地开发（`NODE_ENV=development`）

### 配置验证

#### 命令行验证

```bash
# 检查环境配置
pnpm tsx scripts/check-env.ts

# 显示详细配置（隐藏敏感信息）
pnpm tsx scripts/check-env.ts --config

# JSON 格式输出（适合 CI/CD）
pnpm tsx scripts/check-env.ts --json

# 显示帮助信息
pnpm tsx scripts/check-env.ts --help
```

#### 代码中验证

```typescript
import { validateEnv, detectEnvironment } from '@/lib/env-config';

// 验证环境变量
const result = validateEnv();
if (!result.isValid) {
  console.error('缺少环境变量:', result.missing);
}

// 检测当前环境
const env = detectEnvironment();
console.log('当前环境:', env); // 'coze' | 'standalone' | 'development'
```

---

## 常见问题

### Q1: 部署时提示"缺少数据库配置"

**原因**: 环境变量未正确设置

**解决方案**:

1. 检查环境变量是否设置：
   ```bash
   pnpm tsx scripts/check-env.ts
   ```

2. **Coze 环境**: 在 Coze 平台设置环境变量
   - `COZE_SUPABASE_URL`
   - `COZE_SUPABASE_ANON_KEY`

3. **独立服务器**: 创建 `.env.local` 文件
   ```bash
   cp .env.example.standalone .env.local
   # 编辑 .env.local 填写实际配置
   ```

### Q2: Coze 环境和独立服务器的区别

| 特性 | Coze 环境 | 独立服务器 |
|------|----------|----------|
| 环境变量命名 | `COZE_*` 或 `NEXT_PUBLIC_*` | `NEXT_PUBLIC_*` |
| 配置方式 | Coze 平台设置 | `.env.local` 文件 |
| 构建脚本 | 自动处理 | 需手动配置 |
| 热更新 | 支持 | 需配置 PM2 等 |
| 日志查看 | Coze 控制台 | 服务器日志文件 |

### Q3: 如何切换环境？

项目会自动检测环境，无需手动切换。只需确保：
- **Coze 环境**: 设置 `COZE_*` 环境变量
- **独立服务器**: 创建 `.env.local` 文件

### Q4: AI 功能不可用

**可能原因**:
1. 未配置 Coze API 密钥
2. API 密钥无效或过期

**解决方案**:
1. 检查环境变量：
   ```bash
   pnpm tsx scripts/check-env.ts --config
   ```
2. 确保配置了 `COZE_WORKLOAD_IDENTITY_API_KEY`
3. 验证 API 密钥是否有效

### Q5: 文件上传功能不可用

**可能原因**: 未配置 S3 存储服务

**解决方案**:
配置以下环境变量：
```bash
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=auto
S3_ENDPOINT=https://your-s3-endpoint.com
```

### Q6: 如何更新部署？

#### Coze 环境
1. 推送代码到仓库
2. Coze 平台自动构建和部署（如已开启自动部署）
3. 或手动触发重新部署

#### 独立服务器
```bash
# 拉取最新代码
git pull

# 重新构建
pnpm run build

# 重启服务
pm2 restart ant-ai-nav
```

### Q7: 如何查看日志？

#### Coze 环境
在 Coze 控制台查看应用日志

#### 独立服务器
```bash
# PM2 日志
pm2 logs ant-ai-nav

# Docker 日志
docker logs ant-ai-nav

# 应用日志文件
tail -f /app/work/logs/bypass/app.log
```

---

## 技术支持

- **文档**: [README.md](../README.md)
- **问题反馈**: [GitHub Issues](your-repo-url/issues)
- **Coze 文档**: https://www.coze.cn/docs
- **Supabase 文档**: https://supabase.com/docs

---

## 附录

### 环境变量完整列表

| 变量名 | 必需 | 说明 | 默认值 |
|--------|------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 | - |
| `COZE_SUPABASE_URL` | ⭕ | Coze 环境的 Supabase URL | - |
| `COZE_SUPABASE_ANON_KEY` | ⭕ | Coze 环境的 Supabase 密钥 | - |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | ⭕ | Coze API 密钥 | - |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | ⭕ | Coze 客户端 ID | - |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | ⭕ | Coze 客户端密钥 | - |
| `S3_ACCESS_KEY_ID` | ⭕ | S3 访问密钥 ID | - |
| `S3_SECRET_ACCESS_KEY` | ⭕ | S3 访问密钥 | - |
| `S3_BUCKET_NAME` | ⭕ | S3 存储桶名称 | - |
| `S3_REGION` | ⭕ | S3 区域 | `auto` |
| `S3_ENDPOINT` | ⭕ | S3 端点 URL | - |
| `NODE_ENV` | ⭕ | 运行环境 | `development` |

### 部署检查清单

部署前请确认：

- [ ] 已配置 Supabase 数据库
- [ ] 已设置必需的环境变量
- [ ] 已运行环境检查脚本
- [ ] 已测试本地开发环境
- [ ] 已准备生产环境配置
- [ ] 已配置域名和 HTTPS（如需要）
- [ ] 已设置监控和日志（如需要）

---

**最后更新**: 2025-01-17
