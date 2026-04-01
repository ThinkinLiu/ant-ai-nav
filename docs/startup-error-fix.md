# 应用启动错误修复报告

## 问题描述

**错误信息**: `preview reload failed: 进程退出码: 1`

**症状**:
- 应用无法启动
- 预览重新加载失败
- 进程以退出码 1 终止

## 根本原因分析

### 1. Next.js 包损坏

通过日志分析发现：
```
ERR_PNPM_ENOTEMPTY ENOTEMPTY: directory not empty, rmdir '/workspace/projects/node_modules/.pnpm/next@16.1.1_...'
Next.js not found, reinstalling dependencies...
sh: 1: next: not found
```

**原因**:
- pnpm 在安装/更新依赖时，删除 Next.js 包遇到问题
- 目录删除不完整，导致 Next.js 包只剩下空目录
- `next` 命令找不到，导致启动失败

### 2. 检查结果

```bash
# 修复前：Next.js 包损坏
$ ls -la node_modules/.pnpm/next@16.1.1_*/node_modules/next/
total 12
drwxr-xr-x 3 root root 4096 Mar 30 18:28 .
drwxr-xr-x 5 root root 4096 Mar 30 18:28 ..
drwxr-xr-x 3 root root 4096 Mar 30 18:28 node_modules  # 只剩一个空目录

$ ls -la node_modules/.bin/next
ls: cannot access 'node_modules/.bin/next': No such file or directory
```

## 修复步骤

### 1. 清理损坏的 Next.js 包

```bash
rm -rf node_modules/.pnpm/next@16.1.1*
```

### 2. 重新安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
nohup pnpm dev > /app/work/logs/bypass/dev.log 2>&1 &
```

## 修复结果

### 修复后验证

```bash
# Next.js 包已恢复
$ ls -la node_modules/.bin/next
-rwxr-xr-x 1 root root 1634 Mar 30 19:06 node_modules/.bin/next

$ ls -la node_modules/.pnpm/next@16.1.1_*/node_modules/next/
total 440
drwxr-xr-x 11 root root 4096 Mar 30 19:06 .
-rw-r--r--  3 root root 3212 Mar 27 16:05 README.md
-rw-r--r--  3 root root    89 Mar 27 16:05 app.d.ts
-rw-r--r--  3 root root    46 Mar 27 16:05 app.js
...
-rw-r--r--  3 root root   141 Mar 27 16:05 head.d.ts
drwxr-xr-x 21 root root  4096 Mar 30 19:06 dist
...
```

### 服务器状态

```bash
# 服务器已成功启动
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:5000
- Network:       http://9.128.31.68:5000
✓ Ready in 941ms

# 首页正常访问
GET / 200 in 5.6s (compile: 4.8s, render: 803ms)
```

## 预防措施

### 1. 避免并发安装

```bash
# 不要同时运行多个安装命令
# 错误：
pnpm install
pnpm install next

# 正确：一次性安装所有依赖
pnpm install
```

### 2. 清理缓存

```bash
# 定期清理 pnpm 缓存
pnpm store prune
```

### 3. 检查依赖完整性

```bash
# 在启动前检查依赖
ls -la node_modules/.bin/next || pnpm install
```

### 4. 使用锁文件

```bash
# 始终使用 pnpm-lock.yaml
pnpm install --frozen-lockfile
```

## 故障排查流程

### 1. 检查 Next.js 是否存在

```bash
ls -la node_modules/.bin/next
```

**预期结果**: 应该看到一个可执行文件

### 2. 检查 Next.js 包完整性

```bash
ls -la node_modules/.pnpm/next@*/node_modules/next/
```

**预期结果**: 应该看到多个文件和目录

### 3. 检查服务器日志

```bash
tail -n 50 /app/work/logs/bypass/app.log
tail -n 50 /app/work/logs/bypass/dev.log
```

**预期结果**: 应该看到 "Ready in XXXms"

### 4. 测试服务器

```bash
curl -I http://localhost:5000
```

**预期结果**: `HTTP/1.1 200 OK`

## 常见错误及解决方案

### 错误 1: `next: not found`

**原因**: Next.js 包损坏或未安装

**解决方案**:
```bash
pnpm install
```

### 错误 2: `ERR_PNPM_ENOTEMPTY`

**原因**: pnpm 删除目录时遇到问题

**解决方案**:
```bash
rm -rf node_modules/.pnpm/next@*
pnpm install
```

### 错误 3: `Preview reload failed`

**原因**: 进程启动失败

**解决方案**:
1. 检查日志：`tail -n 50 /app/work/logs/bypass/app.log`
2. 修复错误后重启
3. 清理缓存：`pnpm store prune`

### 错误 4: `ENOTEMPTY: directory not empty`

**原因**: 目录删除不完整

**解决方案**:
```bash
# 手动清理
rm -rf node_modules/.pnpm/next@*
pnpm install
```

## 监控建议

### 1. 添加启动检查脚本

```bash
#!/bin/bash
# scripts/check-dependencies.sh

if [ ! -f "node_modules/.bin/next" ]; then
  echo "⚠️  Next.js not found, reinstalling dependencies..."
  pnpm install
fi

if [ ! -f "node_modules/.bin/next" ]; then
  echo "❌ Failed to install Next.js"
  exit 1
fi

echo "✅ Dependencies check passed"
```

### 2. 添加健康检查

```bash
# 定期检查服务器状态
curl -f http://localhost:5000 || echo "Server is down"
```

### 3. 添加日志监控

```bash
# 监控错误日志
tail -f /app/work/logs/bypass/app.log | grep -i "error"
```

## 总结

**问题**: Next.js 包损坏导致启动失败

**修复**: 清理损坏的包并重新安装依赖

**状态**: ✅ 已修复

**预防**: 避免并发安装，定期清理缓存

---

**修复完成时间**: 2026-03-30 19:06
**修复人员**: Vibe Coding Assistant
**状态**: ✅ 已完成，服务器正常运行
