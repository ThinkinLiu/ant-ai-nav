# 蚂蚁AI导航 - Docker 镜像构建文件
# 优化版本：支持 1GB 低内存服务器运行（实际可用约 700-800MB）
# 构建建议：使用 GitHub Actions 云端构建，避免本地构建内存不足

# ==================== 阶段1: 依赖安装 ====================
FROM node:20-alpine AS deps

# 配置国内镜像源（解决 npmjs.org 访问超时问题）
ENV npm_config_registry=https://registry.npmmirror.com

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件和 npm 配置
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装依赖（只安装生产依赖），增加超时时间
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile --prod=false

# ==================== 阶段2: 构建 ====================
FROM node:20-alpine AS builder

# 配置国内镜像源
ENV npm_config_registry=https://registry.npmmirror.com

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 声明构建参数
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG COZE_WORKLOAD_IDENTITY_API_KEY
ARG COZE_WORKLOAD_IDENTITY_CLIENT_ID
ARG COZE_WORKLOAD_IDENTITY_CLIENT_SECRET
ARG COZE_INTEGRATION_BASE_URL

# 设置环境变量
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV COZE_WORKLOAD_IDENTITY_API_KEY=$COZE_WORKLOAD_IDENTITY_API_KEY
ENV COZE_WORKLOAD_IDENTITY_CLIENT_ID=$COZE_WORKLOAD_IDENTITY_CLIENT_ID
ENV COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=$COZE_WORKLOAD_IDENTITY_CLIENT_SECRET
ENV COZE_INTEGRATION_BASE_URL=$COZE_INTEGRATION_BASE_URL

# 禁用遥测、source maps，减少内存占用
ENV NEXT_TELEMETRY_DISABLED=1
ENV SOURCEMAP=0
ENV NODE_ENV=production

# 关键：限制Node.js内存和并行度
# GitHub Actions 构建：使用 768MB（云端有足够资源）
# 本地构建：建议使用 GitHub Actions，避免内存不足
ENV NODE_OPTIONS="--max-old-space-size=768 --max-semi-space-size=96"

# 复制依赖和源码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 使用单线程构建，减少内存峰值
RUN pnpm build

# ==================== 阶段3: 运行 ====================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 运行时内存限制 - 1GB 服务器优化（实际可用约 700-800MB）
# 限制 Node.js 使用 400MB，为系统和其他进程预留空间
ENV NODE_OPTIONS="--max-old-space-size=400 --max-semi-space-size=50"

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
# Next.js 16 standalone 模式：需要正确的复制路径
# 关键：必须按此顺序复制，否则静态资源可能丢失

# 1. 先复制 standalone 输出（包含 server.js 和最小化 node_modules）
# 注意：Next.js standalone 输出在 .next/standalone/workspace/projects/
# 需要复制 workspace/projects/* 到容器根目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects ./

# 2. 复制静态文件（CSS、JS 等资源）到正确位置
# standalone 输出中 .next 目录不完整，需要单独复制静态资源
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 验证文件结构
RUN echo "=== 验证文件结构 ===" && \
    echo "根目录:" && \
    ls -la /app && \
    echo "" && \
    echo "=== .next 目录 ===" && \
    ls -la /app/.next && \
    echo "" && \
    echo "=== .next/static 目录（检查前10个） ===" && \
    ls -la /app/.next/static | head -15 && \
    echo "" && \
    echo "=== public 目录（检查前10个） ===" && \
    ls -la /app/public | head -15 && \
    echo "" && \
    echo "=== server.js 检查 ===" && \
    ls -la /app/server.js && \
    echo "" && \
    echo "=== 检查静态资源是否存在 ===" && \
    [ -d "/app/.next/static" ] && echo "✅ .next/static 存在" || echo "❌ .next/static 不存在" && \
    [ -d "/app/public" ] && echo "✅ public 存在" || echo "❌ public 不存在"

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]
