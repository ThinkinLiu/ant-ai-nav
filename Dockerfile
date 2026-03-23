# 蚂蚁AI导航 - Docker 镜像构建文件
# 优化版本：支持低内存服务器（512MB可用内存即可构建）

# ==================== 阶段1: 依赖安装 ====================
FROM node:20-alpine AS deps

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（只安装生产依赖）
RUN pnpm install --frozen-lockfile --prod=false

# ==================== 阶段2: 构建 ====================
FROM node:20-alpine AS builder

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
ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=64"

# 复制依赖和源码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 使用单线程构建，减少内存峰值
RUN pnpm build --no-lint

# ==================== 阶段3: 运行 ====================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]
