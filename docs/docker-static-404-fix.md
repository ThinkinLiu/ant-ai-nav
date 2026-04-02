# Docker 静态资源 404 问题修复说明

## 问题描述

在 Docker 容器中部署后，发现静态资源（CSS、JS 文件）全部 404，导致页面无法正常显示样式和脚本。

### 表现症状

- 页面 HTML 能正常加载
- 所有 CSS 和 JS 文件返回 404
- 浏览器控制台显示资源加载失败
- 页面显示为纯文本，没有样式

### 构建错误

```dockerfile
ERROR: failed to build: failed to solve: failed to compute cache key:
"/app/.next/standalone/workspace/projects": not found
```

## 根本原因

Next.js standalone 模式的构建产物路径问题：

1. Next.js 会记住**构建时的工作目录**
2. standalone 输出路径会根据构建时的工作目录而变化
3. 不同构建环境的输出路径可能不同：
   - **标准路径**：`.next/standalone/`（工作目录是 `/app`）
   - **嵌套路径**：`.next/standalone/workspace/projects/`（工作目录是 `/workspace/projects`）

### 构建产物结构示例

**标准路径（Docker 构建时工作目录是 `/app`）**：
```
.next/
├── standalone/
│   ├── server.js
│   ├── node_modules/
│   ├── package.json
│   ├── public/
│   └── .next/          # 不包含 static
└── static/             # 需要单独复制
    ├── chunks/
    ├── media/
    └── 7cDB8QgaZ1FCFqYndeaOk/
```

**嵌套路径（构建时工作目录是 `/workspace/projects`）**：
```
.next/
├── standalone/
│   └── workspace/
│       └── projects/
│           ├── server.js
│           ├── node_modules/
│           ├── package.json
│           ├── public/
│           └── .next/      # 不包含 static
└── static/               # 需要单独复制
    ├── chunks/
    ├── media/
    └── 7cDB8QgaZ1FCFqYndeaOk/
```

### 不同构建环境对比

| 构建环境 | 工作目录 | standalone 路径 | Dockerfile 处理方式 |
|---------|---------|-----------------|-------------------|
| Docker 构建文件 | `/app` | `.next/standalone/` | 自动检测，直接复制 |
| GitHub Actions | `/app` | `.next/standalone/` | 自动检测，直接复制 |
| Coze 沙箱 | `/workspace/projects` | `.next/standalone/workspace/projects/` | 自动检测，移动文件 |
| 自有服务器（Docker） | `/app` | `.next/standalone/` | 自动检测，直接复制 |

## 解决方案

### 修复后的 Dockerfile

修改 Dockerfile，添加智能路径检测和处理：

```dockerfile
# 复制构建产物
# Next.js 16 standalone 模式：输出路径取决于构建时的工作目录

# 复制整个 standalone 目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 检查并调整目录结构（处理嵌套路径）
RUN if [ -d "workspace/projects" ]; then \
      echo "检测到嵌套路径，调整目录结构..." && \
      mv workspace/projects/* . 2>/dev/null || true; \
      mv workspace/projects/.next . 2>/dev/null || true; \
      rm -rf workspace; \
      echo "✅ 目录结构调整完成"; \
    elif [ -d "workspace" ]; then \
      echo "检测到 workspace 目录，调整目录结构..." && \
      mv workspace/* . 2>/dev/null || true; \
      rm -rf workspace; \
      echo "✅ 目录结构调整完成"; \
    else \
      echo "使用标准路径，无需调整"; \
    fi

# 复制静态文件（CSS、JS 等资源）到正确位置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
```

### 关键点

1. **复制整个 standalone 目录**：使用 `./` 而不是具体的子路径
2. **智能路径检测**：检查是否存在嵌套的 `workspace/projects` 目录
3. **自动调整结构**：如果是嵌套路径，自动将文件移动到根目录
4. **兼容所有环境**：支持标准路径和嵌套路径

### 工作原理

1. **复制阶段**：将 `.next/standalone` 目录下的所有内容复制到 `/app`
2. **检测阶段**：检查是否有 `workspace/projects` 或 `workspace` 目录
3. **调整阶段**：如果是嵌套路径，将文件移动到根目录并清理临时目录
4. **复制静态资源**：单独复制 `.next/static` 和 `public` 目录

## 验证修复

### 方法 1：构建时验证

重新构建镜像，查看构建日志中的验证部分：

```bash
docker-compose build --no-cache
```

应该看到：

```
使用标准路径，无需调整
=== 验证文件结构 ===
根目录:
...
=== .next 目录 ===
...
=== .next/static 目录 ===
...
=== 检查静态资源是否存在 ===
✅ .next/static 存在
✅ public 存在
```

或：

```
检测到嵌套路径，调整目录结构...
✅ 目录结构调整完成
=== 验证文件结构 ===
根目录:
...
=== .next/static 目录 ===
...
=== 检查静态资源是否存在 ===
✅ .next/static 存在
✅ public 存在
```

### 方法 2：容器内验证

构建完成后，进入容器检查：

```bash
# 启动容器
docker-compose up -d

# 进入容器
docker exec -it ant-ai-nav sh

# 检查文件结构
ls -la /app/.next/static

# 运行验证脚本
sh /app/scripts/verify-docker-static.sh
```

### 方法 3：浏览器验证

访问网站，检查：

1. 页面样式是否正常显示
2. 浏览器控制台是否还有 404 错误
3. 网络请求中 CSS 和 JS 文件是否返回 200

## 常见问题

### Q1: 为什么会出现路径嵌套的问题？

A: Next.js standalone 模式会记住构建时的工作目录。如果构建工作目录不是 `/app`（比如是 `/workspace/projects`），输出路径会保持这个层级结构。

### Q2: 如何避免这个问题？

A:
1. 在构建阶段使用固定的根目录（如 `/app`）
2. Dockerfile 中已添加智能检测，自动适配不同路径
3. 添加验证步骤检查文件结构

### Q3: GitHub Actions 构建会有这个问题吗？

A: 不会。修复后的 Dockerfile 会自动检测路径，所有构建环境都兼容。

### Q4: 构建时提示路径不存在怎么办？

A: 这是之前 Dockerfile 的问题，使用新的 Dockerfile 后不会出现。如果仍然遇到，检查：

1. Dockerfile 是否更新到最新版本
2. 构建是否成功完成
3. `.next` 目录是否正确生成

## 相关文件

- `Dockerfile` - 容器镜像构建文件（已修复）
- `scripts/verify-docker-static.sh` - 静态资源验证脚本
- `docs/deploy-docker.md` - Docker 部署完整文档

## 更新日志

- 2025-04-01: 修复 Dockerfile 路径问题，添加智能路径检测
- 2025-04-01: 支持所有构建环境（Docker、GitHub Actions、Coze）
- 2025-04-01: 添加静态资源验证脚本和文档
