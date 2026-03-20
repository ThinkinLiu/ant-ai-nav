# 蚂蚁AI导航 - Docker 镜像构建文件
# 多阶段构建，优化镜像大小和构建速度
# 支持低内存服务器（1GB可用内存即可构建）

# ==================== 阶段1: 依赖安装 ====================
FROM node:20-alpine AS deps

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

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

# 禁用遥测和source maps，减少内存占用
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_BUILD_SOURCEMAPS=0
ENV NODE_ENV=production

# 复制依赖和源码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 创建构建脚本，动态检测内存
RUN echo '#!/bin/sh' > /tmp/build.sh && \
    echo 'set -e' >> /tmp/build.sh && \
    echo '' >> /tmp/build.sh && \
    echo '# 获取可用内存（KB）' >> /tmp/build.sh && \
    echo 'AVAIL_MEM=$(grep MemAvailable /proc/meminfo 2>/dev/null | awk "{print \$2}" || echo "0")' >> /tmp/build.sh && \
    echo 'if [ "$AVAIL_MEM" -eq 0 ]; then' >> /tmp/build.sh && \
    echo '  FREE_MEM=$(grep MemFree /proc/meminfo 2>/dev/null | awk "{print \$2}" || echo "0")' >> /tmp/build.sh && \
    echo '  BUFFERS=$(grep Buffers /proc/meminfo 2>/dev/null | awk "{print \$2}" || echo "0")' >> /tmp/build.sh && \
    echo '  CACHED=$(grep "^Cached" /proc/meminfo 2>/dev/null | awk "{print \$2}" || echo "0")' >> /tmp/build.sh && \
    echo '  AVAIL_MEM=$((FREE_MEM + BUFFERS + CACHED))' >> /tmp/build.sh && \
    echo 'fi' >> /tmp/build.sh && \
    echo '' >> /tmp/build.sh && \
    echo 'echo "可用内存: $((AVAIL_MEM / 1024))MB"' >> /tmp/build.sh && \
    echo '' >> /tmp/build.sh && \
    echo '# 根据可用内存计算Node.js限制（保留256MB给系统）' >> /tmp/build.sh && \
    echo 'if [ "$AVAIL_MEM" -gt 1500000 ]; then' >> /tmp/build.sh && \
    echo '  NODE_MEM=1024' >> /tmp/build.sh && \
    echo 'elif [ "$AVAIL_MEM" -gt 1000000 ]; then' >> /tmp/build.sh && \
    echo '  NODE_MEM=768' >> /tmp/build.sh && \
    echo 'elif [ "$AVAIL_MEM" -gt 700000 ]; then' >> /tmp/build.sh && \
    echo '  NODE_MEM=512' >> /tmp/build.sh && \
    echo 'elif [ "$AVAIL_MEM" -gt 400000 ]; then' >> /tmp/build.sh && \
    echo '  NODE_MEM=350' >> /tmp/build.sh && \
    echo 'else' >> /tmp/build.sh && \
    echo '  # 尝试清理缓存' >> /tmp/build.sh && \
    echo '  sync 2>/dev/null || true' >> /tmp/build.sh && \
    echo '  echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true' >> /tmp/build.sh && \
    echo '  sleep 2' >> /tmp/build.sh && \
    echo '  AVAIL_MEM=$(grep MemAvailable /proc/meminfo 2>/dev/null | awk "{print \$2}" || echo "0")' >> /tmp/build.sh && \
    echo '  if [ "$AVAIL_MEM" -gt 400000 ]; then' >> /tmp/build.sh && \
    echo '    NODE_MEM=350' >> /tmp/build.sh && \
    echo '  else' >> /tmp/build.sh && \
    echo '    NODE_MEM=300' >> /tmp/build.sh && \
    echo '  fi' >> /tmp/build.sh && \
    echo 'fi' >> /tmp/build.sh && \
    echo '' >> /tmp/build.sh && \
    echo 'echo "Node.js内存限制: ${NODE_MEM}MB"' >> /tmp/build.sh && \
    echo 'NODE_OPTIONS="--max-old-space-size=${NODE_MEM}" pnpm build' >> /tmp/build.sh && \
    chmod +x /tmp/build.sh

# 执行构建（使用动态内存检测）
RUN /tmp/build.sh

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
