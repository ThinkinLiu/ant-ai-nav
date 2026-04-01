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

# 声明构建参数（可选，支持运行时配置）
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

# 设置构建时环境变量
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NODE_ENV=production

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 复制 public 目录（用于构建时静态资源）
RUN cp -r public .public 2>/dev/null || true

# 构建 Next.js 应用
RUN pnpm build

# 调试：检查 standalone 输出结构
RUN echo "=== 调试：检查 .next/standalone 目录结构 ===" && \
    ls -la /app/.next/ && \
    echo "" && \
    echo "=== standalone 目录 ===" && \
    if [ -d "/app/.next/standalone" ]; then \
        ls -la /app/.next/standalone/; \
        echo ""; \
        echo "=== standalone/.next 目录 ===" && \
        if [ -d "/app/.next/standalone/.next" ]; then \
            ls -la /app/.next/standalone/.next/; \
        else \
            echo "standalone/.next 不存在"; \
        fi \
    else \
        echo "standalone 目录不存在"; \
    fi

# ==================== 阶段3: 运行 ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 配置国内镜像源
ENV npm_config_registry=https://registry.npmmirror.com

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
# Next.js 16 standalone 模式：需要正确的复制路径
# 关键：必须按此顺序复制，否则静态资源可能丢失

# 1. 先复制 standalone 输出（包含 server.js 和最小化 node_modules）
# 注意：Next.js standalone 输出在 .next/standalone/
# 复制整个 standalone 目录到容器根目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. 复制静态文件（CSS、JS 等资源）到正确位置
# standalone 输出中 .next 目录不完整，需要单独复制静态资源
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 4. 创建配置目录并设置权限
RUN mkdir -p /app/config && \
    chown -R nextjs:nodejs /app/config && \
    chmod -R 755 /app/config

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
    echo "=== node_modules 检查 ===" && \
    ls -la /app/node_modules | head -10 && \
    echo "" && \
    echo "=== 检查静态资源是否存在 ===" && \
    [ -d "/app/.next/static" ] && echo "✅ .next/static 存在" || echo "❌ .next/static 不存在" && \
    [ -d "/app/public" ] && echo "✅ public 存在" || echo "❌ public 不存在" && \
    [ -f "/app/server.js" ] && echo "✅ server.js 存在" || echo "❌ server.js 不存在"

USER nextjs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
