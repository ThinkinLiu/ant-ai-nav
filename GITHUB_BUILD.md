# GitHub 构建快速开始

本文档帮助你快速在 GitHub 上构建和部署项目。

---

## 🚀 三步完成构建

### 第一步：配置 Secrets

1. 进入仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加必需的配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 💡 如何获取：登录 [Supabase](https://supabase.com) → 项目设置 → API

---

### 第二步：选择构建方式

#### 🤖 Docker 镜像构建（推荐服务器部署）

1. 进入 **Actions** 标签
2. 点击 **Build Static Export**
3. 点击 **Run workflow** → 选择分支 → 运行
4. 等待构建完成，下载 `docker-image` 产物
5. 上传到服务器并加载：
   ```bash
   docker load < ant-ai-nav.tar.gz
   docker run -d -p 5000:5000 ant-ai-nav:latest
   ```

#### 📄 静态导出构建（推荐静态托管）

1. 进入 **Actions** 标签
2. 点击 **Build Static Export**
3. 点击 **Run workflow** → 选择分支 → 运行
4. 等待构建完成，下载 `static-export` 产物
5. 解压到 Web 服务器目录

#### ✅ CI 自动构建（开发测试）

- 推送代码或创建 PR 时自动运行
- 查看 **Actions** 标签获取构建状态
- 可下载 `build-output` 产物

---

### 第三步：验证部署

访问你的应用 URL，确认服务正常运行。

---

## 📋 可用工作流

| 工作流 | 触发方式 | 用途 |
|--------|---------|------|
| **CI - Build and Test** | 自动（push/PR） | 代码检查、构建测试 |
| **Build Docker Image** | 手动 | Docker 镜像构建 |
| **Build Static Export** | 手动 | 静态文件导出 |

---

## 🔧 常见问题

**Q: 构建失败怎么办？**
- 检查 Secrets 是否配置正确
- 查看 Actions 运行日志
- 确认 Node.js 版本和依赖

**Q: 如何在本地测试构建？**
```bash
pnpm install
pnpm run build
```

**Q: 产物保留多久？**
- 所有产物保留 7 天

---

## 📚 详细文档

查看完整的 GitHub Actions 指南：
📖 [docs/github-actions-guide.md](./docs/github-actions-guide.md)

---

**需要帮助？** 📧 提交 [Issue](https://github.com/ThinkinLiu/ant-ai-nav/issues)
