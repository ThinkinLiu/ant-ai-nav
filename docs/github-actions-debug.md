# GitHub Actions 构建失败排查指南

## 问题描述

GitHub Actions 在执行 `actions/checkout@v4` 时失败，错误信息：

```
Error: The process '/usr/bin/git' failed with exit code 1
```

## 常见原因及解决方案

### 1. 仓库名称不正确

**症状：** Actions 尝试拉取 `ThinkinLiu/ant-ai-nav`，但该仓库不存在

**解决方法：**

1. 确认你的 GitHub 仓库名称：
   ```bash
   # 在 GitHub 网页上查看仓库 URL
   # 格式应为：https://github.com/用户名/仓库名.git
   ```

2. 检查 `.github/workflows/build-static.yml` 中的默认分支设置：
   ```yaml
   inputs:
     branch:
       description: 'Branch to build'
       required: false
       default: 'main'  # 确保这是你的默认分支名
   ```

3. 如果仓库名称不同，无需修改 workflow，只需确保 GitHub Actions 在正确的仓库下运行

### 2. 分支名称不匹配

**症状：** Workflow 尝试拉取 `main` 分支，但你的默认分支是 `master`

**解决方法：**

**方案 A：修改默认分支为 main（推荐）**
```bash
# 在 GitHub 网页上：
# 1. 进入仓库 Settings → Branches
# 2. 将 master 重命名为 main
```

**方案 B：修改 Workflow 使用 master 分支**
```yaml
# .github/workflows/build-static.yml
inputs:
  branch:
    description: 'Branch to build'
    required: false
    default: 'master'  # 改为 master
```

### 3. 仓库不存在

**症状：** 仓库已被删除或从未创建

**解决方法：**

1. 在 GitHub 上创建仓库：
   ```bash
   # 访问 https://github.com/new
   # 创建 ThinkinLiu/ant-ai-nav 仓库
   ```

2. 推送本地代码到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ThinkinLiu/ant-ai-nav.git
   git push -u origin main
   ```

### 4. 分支为空

**症状：** 仓库存在，但 `main` 分支没有提交

**解决方法：**

```bash
# 确保有至少一个提交
git commit -am "Add initial commit"
git push origin main
```

### 5. 权限问题

**症状：** Actions 无法访问私有仓库

**解决方法：**

1. **公开仓库（推荐）**：将仓库设为 Public，Actions 无需特殊权限

2. **私有仓库**：在仓库 Settings → Secrets and variables → Actions 中添加：
   - 不需要额外配置，`actions/checkout@v4` 自动使用 GitHub Token

## 快速诊断

运行检查脚本：

```bash
chmod +x scripts/check-github-config.sh
./scripts/check-github-config.sh
```

输出示例：

```
🔍 检查 GitHub 仓库配置...

📋 当前 Git 配置：
  (无配置)

📡 远程仓库配置：
  origin  https://github.com/ThinkinLiu/ant-ai-nav.git (fetch)

🌿 当前分支：
  main

🌳 所有分支：
* main
```

## 重新运行 Workflow

修复后，在 GitHub Actions 页面：

1. 进入 Actions 标签
2. 选择 "Build Static Export" workflow
3. 点击 "Run workflow" 按钮
4. 选择分支（通常是 main）
5. 点击 "Run workflow"

## 调试技巧

### 查看 Actions 日志

在 Actions 运行日志中，查看 "Checkout code" 步骤的输出：

```log
Run actions/checkout@v4
  with:
    ref: main
    fetch-depth: 1
Syncing repository: ThinkinLiu/ant-ai-nav
Getting Git version info
...
```

检查：
- 仓库名称是否正确
- 分支名称是否正确
- 是否有权限错误

### 本地测试

在本地验证 Git 配置：

```bash
# 测试克隆仓库
git clone --depth 1 https://github.com/ThinkinLiu/ant-ai-nav.git /tmp/test-clone

# 测试拉取特定分支
git clone --depth 1 --branch main https://github.com/ThinkinLiu/ant-ai-nav.git /tmp/test-main
```

## 常见错误及含义

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `repository not found` | 仓库不存在或无权限 | 检查仓库名称和权限 |
| `ref refs/heads/main not found` | main 分支不存在 | 检查分支名称或创建分支 |
| `failed with exit code 128` | Git 认证失败 | 检查 Token 设置 |
| `failed with exit code 1` | 一般性 Git 错误 | 查看详细日志 |

## 最佳实践

1. **统一分支命名**：建议统一使用 `main` 作为默认分支
2. **首次提交**：确保远程仓库至少有一个提交
3. **公开仓库**：如果无需保密，使用公开仓库简化配置
4. **使用 workflow_dispatch**：允许手动触发构建

## 相关文档

- [GitHub Actions Checkout Action](https://github.com/actions/checkout)
- [GitHub Actions 调试](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- [Git 分支管理](https://git-scm.com/book/zh/v2/Git-分支管理)

## 需要帮助？

如果以上方法都无法解决问题：

1. 查看 GitHub Actions 完整日志（包括所有重试）
2. 确认仓库 URL 完全正确（区分大小写）
3. 检查 GitHub 账号是否正常
4. 联系 GitHub 支持（如果是平台问题）
