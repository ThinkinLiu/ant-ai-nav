# 蚂蚁AI导航 - Docker 镜像构建文件（修复静态资源问题）
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

# 调试：检查构建输出结构
RUN echo "=== 调试：检查 .next 目录结构 ===" && \
    ls -la /app/.next/ && \
    echo "" && \
    echo "=== standalone 目录 ===" && \
    if [ -d "/app/.next/standalone" ]; then \
        echo "✅ standalone 存在"; \
        ls -la /app/.next/standalone/; \
        echo ""; \
        echo "=== standalone 内部结构 ===" && \
        find /app/.next/standalone -maxdepth 2 -type f -o -type d | head -20; \
    else \
        echo "❌ standalone 目录不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== .next/static 目录 ===" && \
    if [ -d "/app/.next/static" ]; then \
        echo "✅ .next/static 存在"; \
        ls -la /app/.next/static/ | head -10; \
    else \
        echo "❌ .next/static 不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== public 目录 ===" && \
    if [ -d "/app/public" ]; then \
        echo "✅ public 存在"; \
        ls -la /app/public/ | head -10; \
    else \
        echo "❌ public 不存在"; \
        exit 1; \
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
# Next.js 16 standalone 输出：需要正确处理结构
# standalone 输出包含 server.js, node_modules, package.json

# 方案：复制整个 standalone 目录内容到 /app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./

# 确保静态资源存在并复制到正确位置
# standalone 输出可能不包含完整的 .next/static，需要从构建阶段复制
RUN echo "=== 检查当前目录结构 ===" && \
    ls -la /app && \
    echo "" && \
    echo "=== 检查 server.js ===" && \
    if [ -f "/app/server.js" ]; then \
        echo "✅ server.js 存在"; \
    else \
        echo "❌ server.js 不存在"; \
        exit 1; \
    fi

# 复制 .next/static 目录（如果 standalone 中没有完整复制）
# Next.js standalone 模式下，.next/static 可能需要单独复制
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 4. 创建配置目录并设置权限
RUN mkdir -p /app/config && \
    chown -R nextjs:nodejs /app/config && \
    chmod -R 755 /app/config

# 验证最终文件结构
RUN echo "=== 验证最终文件结构 ===" && \
    echo "根目录:" && \
    ls -la /app && \
    echo "" && \
    echo "=== .next 目录 ===" && \
    ls -la /app/.next && \
    echo "" && \
    echo "=== .next/static 目录（检查前10个） ===" && \
    if [ -d "/app/.next/static" ]; then \
        echo "✅ .next/static 存在"; \
        ls -la /app/.next/static | head -15; \
    else \
        echo "❌ .next/static 不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== public 目录（检查前10个） ===" && \
    if [ -d "/app/public" ]; then \
        echo "✅ public 存在"; \
        ls -la /app/public | head -15; \
    else \
        echo "❌ public 不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== server.js 检查 ===" && \
    if [ -f "/app/server.js" ]; then \
        echo "✅ server.js 存在"; \
        ls -la /app/server.js; \
    else \
        echo "❌ server.js 不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== node_modules 检查 ===" && \
    if [ -d "/app/node_modules" ]; then \
        echo "✅ node_modules 存在"; \
        ls /app/node_modules | head -10; \
    else \
        echo "❌ node_modules 不存在"; \
        exit 1; \
    fi && \
    echo "" && \
    echo "=== 检查关键静态资源 ===" && \
    find /app/.next/static -name "*.js" -o -name "*.css" 2>/dev/null | head -5

USER nextjs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
