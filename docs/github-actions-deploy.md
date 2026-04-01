# GitHub Actions 部署完整指南

## 环境说明

- **当前环境**：Coze 沙箱开发环境
- **目标环境**：GitHub 仓库 + GitHub Actions CI/CD
- **项目**：ant-ai-nav（蚂蚁AI导航）

## 快速开始（推荐方案）

### 方案一：通过 GitHub 网页创建仓库

#### 1. 在 GitHub 上创建新仓库

访问 https://github.com/new

配置如下：
- **Repository name**: `ant-ai-nav`
- **Description**: `现代化的AI工具导航平台`
- **Visibility**: `Public`（推荐）或 `Private`
- **Initialize with**: ❌ 不勾选任何选项
- 点击 "Create repository"

#### 2. 添加项目文件到 GitHub

**方法 A：通过 GitHub 网页上传**

1. 进入新创建的仓库页面
2. 点击 "uploading an existing file" 链接
3. 拖拽整个项目文件（除了 `.git`、`node_modules`）
4. 填写提交信息：`Initial commit`
5. 点击 "Commit changes"

**方法 B：通过 Git 命令推送**

```bash
# 在沙箱环境执行
cd /workspace/projects

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ant-ai-nav.git

# 提交当前更改
git add .
git commit -m "Initial commit - AI Navigation Platform"

# 推送到 GitHub（首次推送需要认证）
git push -u origin main
```

**认证方法：**

**使用 Personal Access Token（推荐）**：

1. 生成 Token：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 点击 "Generate token"
   - 复制 Token（只显示一次）

2. 使用 Token 推送：
```bash
# 配置 Git 使用 Token
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/ant-ai-nav.git

# 推送
git push -u origin main
```

**使用 SSH 密钥（推荐）**：

```bash
# 生成 SSH 密钥（如果没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 将公钥添加到 GitHub：
# Settings → SSH and GPG keys → New SSH key

# 测试连接
ssh -T git@github.com

# 修改远程仓库为 SSH
git remote set-url origin git@github.com:YOUR_USERNAME/ant-ai-nav.git

# 推送
git push -u origin main
```

#### 3. 配置 GitHub Actions Secrets（可选）

如果需要配置 Supabase：

1. 进入仓库页面：Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secrets：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase 匿名密钥

#### 4. 运行 GitHub Actions

1. 进入仓库的 Actions 标签
2. 选择 "Build Static Export" workflow
3. 点击 "Run workflow" 按钮
4. 选择分支：`main`
5. 点击 "Run workflow" 按钮

#### 5. 下载构建产物

1. 等待 workflow 完成后
2. 点击进入该次运行记录
3. 在底部的 "Artifacts" 部分
4. 下载 `static-export.tar.gz`

#### 6. 解压并部署

```bash
# 在目标服务器上
mkdir -p /opt/ant-ai-nav
cd /opt/ant-ai-nav

# 解压构建产物
tar -xzf static-export.tar.gz

# 使用 Docker 运行
docker-compose up -d
```

---

### 方案二：使用 GitHub CLI（需要先安装）

```bash
# 安装 GitHub CLI（如果未安装）
# macOS: brew install gh
# Ubuntu: sudo apt install gh

# 登录 GitHub
gh auth login

# 创建仓库并推送
cd /workspace/projects
gh repo create ant-ai-nav --public --source=. --remote=origin --push
```

---

## 当前项目状态

根据检查脚本输出：

```
🔍 检查 GitHub 仓库配置...

📋 当前 Git 配置：
  user.name=user5605260992
  user.email=737139855472236-user5605260992@noreply.coze.cn

📡 远程仓库配置：
  (未配置)

🌿 当前分支：
  main

🌳 所有分支：
* main

⚙️  GitHub Actions 配置：
  ✅ build-static.yml 存在
  预期仓库: ThinkinLiu/ant-ai-nav
  预期分支: main
```

**分析：**
- ✅ Git 已初始化，当前在 `main` 分支
- ❌ 未配置远程仓库
- ✅ GitHub Actions 配置已就绪
- ⚠️  需要将代码推送到 GitHub

---

## 工作流程图

```
开发环境 (沙箱)
    ↓ 开发代码
本地 Git 提交
    ↓ 推送代码
GitHub 仓库 (ant-ai-nav)
    ↓ 触发 Workflow
GitHub Actions CI/CD
    ↓ 构建产物
下载 Artifacts
    ↓ 解压部署
生产服务器 (Docker)
```

---

## 常见问题

### Q1: 推送时提示 "Permission denied"

**原因**: 没有配置认证

**解决**:
```bash
# 方法 1: 使用 Token
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/ant-ai-nav.git

# 方法 2: 使用 SSH
git remote set-url origin git@github.com:YOUR_USERNAME/ant-ai-nav.git
```

### Q2: Actions 构建失败 "No Supabase credentials"

**原因**: 未配置 Secrets

**解决**:
1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 重新运行 workflow

### Q3: Actions 失败 "repository not found"

**原因**: 仓库名称错误或不存在

**解决**:
1. 确认 GitHub 上的仓库名称
2. 检查 Git remote 配置：`git remote -v`
3. 如需要，修改 remote：`git remote set-url origin https://github.com/正确的用户名/ant-ai-nav.git`

### Q4: 下载的构建产物无法运行

**原因**: Docker 环境问题

**解决**:
```bash
# 检查 Dockerfile 是否存在
ls -la Dockerfile

# 检查 docker-compose.yml 配置
cat docker-compose.yml

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 完整部署示例

假设你的 GitHub 用户名是 `ThinkinLiu`：

```bash
# 1. 配置 Git 用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 2. 添加远程仓库
git remote add origin https://github.com/ThinkinLiu/ant-ai-nav.git

# 3. 提交所有更改
git add .
git commit -m "feat: Add AI navigation platform with runtime database config"

# 4. 推送到 GitHub（使用 Token）
# 首先在 GitHub 生成 Token，然后：
git remote set-url origin https://YOUR_TOKEN@github.com/ThinkinLiu/ant-ai-nav.git
git push -u origin main

# 5. 等待 GitHub Actions 完成
# 访问 https://github.com/ThinkinLiu/ant-ai-nav/actions

# 6. 下载构建产物 static-export.tar.gz

# 7. 在服务器上部署
mkdir -p /opt/ant-ai-nav
cd /opt/ant-ai-nav
tar -xzf ~/Downloads/static-export.tar.gz

# 8. 启动服务
docker-compose up -d

# 9. 访问配置页面
# 打开 http://your-server-ip:5000/settings
# 配置 Supabase 数据库连接
```

---

## 后续更新

当代码有更新时：

```bash
# 1. 提交更改
git add .
git commit -m "fix: 修复某个问题"

# 2. 推送到 GitHub
git push origin main

# 3. 等待 Actions 完成

# 4. 下载新的构建产物

# 5. 在服务器上更新
cd /opt/ant-ai-nav
tar -xzf ~/Downloads/static-export.tar.gz
docker-compose restart
```

---

## 自动化部署（可选）

可以使用 GitHub Actions 自动部署到服务器：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  workflow_run:
    workflows: ["Build Static Export"]
    types:
      - completed

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: static-export

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ant-ai-nav
            tar -xzf static-export.tar.gz
            docker-compose restart
```

---

## 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker 部署指南](./deploy-docker.md)
- [运行时数据库配置](./runtime-database-config.md)
- [管理后台配置指南](./admin-settings-guide.md)

---

## 需要帮助？

如果遇到问题：

1. 查看 GitHub Actions 日志
2. 运行检查脚本：`./scripts/check-github-config.sh`
3. 参考 [GitHub Actions 调试指南](./github-actions-debug.md)
4. 查看项目 README.md

---

## 总结

**关键步骤：**

1. ✅ 在 GitHub 创建仓库
2. ✅ 配置 Git 远程仓库
3. ✅ 推送代码到 GitHub
4. ✅ 运行 GitHub Actions 构建
5. ✅ 下载构建产物
6. ✅ 在服务器上部署
7. ✅ 访问 /settings 配置数据库

**下一步：**

完成上述步骤后，你将拥有一个可以在浏览器中访问的 AI 导航平台，支持运行时数据库配置。
