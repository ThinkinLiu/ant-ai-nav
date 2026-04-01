# GitHub Actions 错误排查总结

## 错误信息

```
Error: The process '/usr/bin/git' failed with exit code 1
```

## 问题根源

1. **当前环境**：Coze 沙箱开发环境
2. **GitHub Actions 配置**：期望从 `ThinkinLiu/ant-ai-nav` 仓库拉取 `main` 分支
3. **实际情况**：
   - 仓库 `ThinkinLiu/ant-ai-nav` 可能不存在或无法访问
   - 或者仓库名称不匹配
   - 或者分支名称不对

## 解决方案

### 方案 1：在 GitHub 上创建仓库（推荐）

#### 步骤：

1. **在 GitHub 上创建仓库**

   访问 https://github.com/new

   - Repository name: `ant-ai-nav`（或你的仓库名）
   - Visibility: `Public`（推荐）
   - 不要初始化 README、.gitignore 等

2. **配置 Git 远程仓库**

   ```bash
   cd /workspace/projects

   # 添加远程仓库（替换为你的用户名）
   git remote add origin https://github.com/YOUR_USERNAME/ant-ai-nav.git
   ```

3. **配置 Git 认证**

   **方法 A：使用 Personal Access Token**

   - 生成 Token: https://github.com/settings/tokens
   - 权限勾选: `repo`
   - 使用 Token:

   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/ant-ai-nav.git
   ```

   **方法 B：使用 SSH**

   ```bash
   # 生成 SSH 密钥
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # 添加公钥到 GitHub: Settings → SSH and GPG keys

   # 使用 SSH URL
   git remote set-url origin git@github.com:YOUR_USERNAME/ant-ai-nav.git
   ```

4. **推送代码**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

5. **运行 GitHub Actions**

   - 访问仓库的 Actions 页面
   - 运行 "Build Static Export" workflow
   - 下载构建产物

### 方案 2：修改 Workflow 配置

如果仓库名称不是 `ThinkinLiu/ant-ai-nav`，无需修改 workflow。workflow 会自动使用当前仓库。

但如果你想修改默认分支（例如从 `main` 改为 `master`）：

```yaml
# .github/workflows/build-static.yml
inputs:
  branch:
    description: 'Branch to build'
    required: false
    default: 'master'  # 改为你的分支名
```

## 快速部署脚本

我们提供了快速部署脚本，帮助你在几分钟内完成部署：

```bash
# 运行脚本
./scripts/quick-deploy.sh

# 脚本会：
# 1. 检查 Git 配置
# 2. 配置远程仓库
# 3. 提交代码
# 4. 推送到 GitHub
# 5. 显示后续步骤
```

## 检查脚本

使用检查脚本诊断问题：

```bash
./scripts/check-github-config.sh
```

输出示例：

```
🔍 检查 GitHub 仓库配置...

📋 当前 Git 配置：
  user.name=user5605260992
  user.email=...

📡 远程仓库配置：
  origin  https://github.com/YOUR_USERNAME/ant-ai-nav.git (fetch)

🌿 当前分支：
  main

⚙️  GitHub Actions 配置：
  ✅ build-static.yml 存在
  预期仓库: ThinkinLiu/ant-ai-nav
  预期分支: main
```

## 常见错误

### 错误 1: repository not found

**原因**：仓库名称错误或仓库不存在

**解决**：
```bash
# 检查远程仓库 URL
git remote -v

# 修改为正确的 URL
git remote set-url origin https://github.com/CORRECT_USERNAME/ant-ai-nav.git
```

### 错误 2: Permission denied

**原因**：未配置 Git 认证

**解决**：
```bash
# 使用 Token
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/ant-ai-nav.git

# 或使用 SSH
git remote set-url origin git@github.com:USERNAME/ant-ai-nav.git
```

### 错误 3: ref refs/heads/main not found

**原因**：远程仓库没有 `main` 分支

**解决**：
```bash
# 确保本地有提交
git commit -am "Add initial commit"

# 推送到 main
git push -u origin main
```

## 验证步骤

1. **验证远程仓库**

   ```bash
   git remote -v
   # 应该显示 origin https://github.com/USERNAME/ant-ai-nav.git
   ```

2. **验证分支**

   ```bash
   git branch
   # 应该显示 * main
   ```

3. **验证连接**

   ```bash
   # 如果使用 HTTPS
   git ls-remote origin

   # 如果使用 SSH
   ssh -T git@github.com
   ```

4. **验证推送**

   ```bash
   git push -u origin main
   # 应该成功推送
   ```

## 后续步骤

1. ✅ 在 GitHub 创建仓库
2. ✅ 配置 Git 远程仓库
3. ✅ 推送代码到 GitHub
4. ✅ 运行 GitHub Actions
5. ✅ 下载构建产物
6. ✅ 在服务器上部署
7. ✅ 访问 /settings 配置数据库

## 相关文档

- [GitHub Actions 完整部署指南](./github-actions-deploy.md)
- [GitHub Actions 调试指南](./github-actions-debug.md)
- [README.md](../README.md)

## 需要帮助？

如果遇到问题：

1. 运行检查脚本：`./scripts/check-github-config.sh`
2. 查看详细的调试指南：`docs/github-actions-debug.md`
3. 检查 GitHub Actions 日志

---

**最后更新**: 2025-04-01
