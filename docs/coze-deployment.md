# Coze 环境部署指南

本文档专门针对 Coze 环境部署，提供详细的配置步骤和最佳实践。

## 📋 目录

- [Coze 环境特点](#coze-环境特点)
- [快速部署](#快速部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## Coze 环境特点

### 优势
- ✅ **自动构建**: 代码提交后自动构建和部署
- ✅ **弹性扩展**: 自动处理流量高峰
- ✅ **集成服务**: 内置 AI、存储等服务
- ✅ **简化配置**: 无需管理服务器

### 注意事项
- ⚠️ 环境变量需要通过平台设置，不能使用 `.env` 文件
- ⚠️ 构建时间有限制，需优化构建流程
- ⚠️ 需要使用特定的环境变量命名规范

---

## 快速部署

### 第一步：准备数据库

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 创建新项目
3. 获取配置信息：
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGc...`

### 第二步：配置 Coze 环境变量

在 Coze 平台的环境变量设置中添加：

#### 必需配置

```bash
# 方式 1: Coze 专用命名（推荐）
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key

# 方式 2: 标准命名（也支持）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 可选配置（AI 功能）

```bash
# Coze API 配置
COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
```

### 第三步：部署应用

1. 在 Coze 平台创建新应用
2. 连接 Git 仓库
3. 配置构建设置（项目已内置）
4. 点击部署

### 第四步：验证部署

部署完成后检查：

```bash
# 1. 访问应用 URL，确认页面加载
https://your-app.coze.cn

# 2. 检查数据库连接
# 访问任意需要数据库的页面

# 3. 测试 AI 功能（如已配置）
# 尝试使用 AI 生成功能
```

---

## 环境变量配置

### 必需变量

| 变量名 | 如何获取 | 示例值 |
|--------|---------|--------|
| `COZE_SUPABASE_URL` | Supabase 控制台 → Settings → API | `https://xxx.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | Supabase 控制台 → Settings → API | `eyJhbGc...` (约 100 字符) |

### 可选变量

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 | Coze 平台 → 个人中心 → API Keys |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | Coze 客户端 ID | Coze 平台 → 应用设置 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | Coze 客户端密钥 | Coze 平台 → 应用设置 |

### 环境变量命名规则

项目支持以下命名方式（按优先级排序）：

#### Supabase URL
1. `NEXT_PUBLIC_SUPABASE_URL` ⭐ 推荐
2. `COZE_SUPABASE_URL` ⭐ Coze 环境
3. `SUPABASE_URL`

#### Supabase Anon Key
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⭐ 推荐
2. `COZE_SUPABASE_ANON_KEY` ⭐ Coze 环境
3. `SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`

---

## 常见问题

### Q1: 部署失败，提示"缺少数据库配置"

**原因**: 环境变量未设置或命名不正确

**解决方案**:
1. 检查 Coze 平台的环境变量设置
2. 确保变量名完全匹配（区分大小写）
3. 确保变量值没有多余的空格或引号

### Q2: 页面加载正常，但数据无法显示

**可能原因**:
1. Supabase URL 或 Key 不正确
2. 数据库未初始化
3. 网络访问限制

**解决方案**:
1. 验证 Supabase 配置：
   ```bash
   # 检查配置
   pnpm tsx scripts/check-env.ts --config
   ```
2. 在 Supabase 控制台检查数据库表
3. 检查 Supabase 项目的网络访问设置

### Q3: AI 功能无法使用

**原因**: 未配置 Coze API 密钥

**解决方案**:
1. 在 Coze 平台设置以下变量：
   ```bash
   COZE_WORKLOAD_IDENTITY_API_KEY=your-key
   ```
2. 确保密钥有效且有正确的权限

### Q4: 如何更新环境变量？

1. 登录 Coze 平台
2. 进入应用设置 → 环境变量
3. 修改变量值
4. 保存后重新部署

### Q5: 如何查看部署日志？

1. 进入 Coze 应用控制台
2. 点击"部署"或"日志"选项卡
3. 查看构建和运行日志

---

## 最佳实践

### 1. 环境变量管理

- ✅ 使用 `COZE_*` 前缀的变量名，更清晰
- ✅ 定期更新 API 密钥，确保安全
- ✅ 不要在代码中硬编码敏感信息

### 2. 构建优化

项目已优化构建流程：
- ✅ 自动检测环境类型
- ✅ 智能处理环境变量
- ✅ 缓存依赖加速构建

### 3. 监控和调试

#### 查看环境信息
```bash
# 在构建日志中查看环境检测结果
# 会显示:
# - 当前环境: coze
# - 配置状态: ✅ 有效
# - 已配置的服务
```

#### 调试技巧
1. 检查构建日志中的环境变量验证结果
2. 查看运行时日志的错误信息
3. 使用 `console.log` 输出调试信息

### 4. 安全建议

- 🔒 不要在代码中提交敏感信息
- 🔒 使用环境变量存储所有密钥
- 🔒 定期轮换 API 密钥
- 🔒 限制 Supabase 的访问 IP（如需要）

### 5. 性能优化

- ⚡ 启用 Supabase 的连接池
- ⚡ 使用 CDN 加速静态资源
- ⚡ 优化数据库查询
- ⚡ 启用缓存策略

---

## 配置示例

### 完整的环境变量配置示例

```bash
# ============================================
# Supabase 数据库配置（必需）
# ============================================
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# Coze API 配置（可选 - AI 功能）
# ============================================
COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key-here
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id-here
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret-here
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn

# ============================================
# S3 存储配置（可选 - 文件上传）
# ============================================
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://your-s3-endpoint.com
```

---

## 快速参考

### 环境变量命名对照表

| 用途 | Coze 环境 | 标准命名 | 通用命名 |
|------|----------|----------|----------|
| Supabase URL | `COZE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` |
| Supabase Key | `COZE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |

### 部署检查清单

部署前确认：
- [ ] 已创建 Supabase 项目
- [ ] 已获取 Supabase URL 和 Key
- [ ] 已在 Coze 平台设置环境变量
- [ ] 变量名正确（区分大小写）
- [ ] 变量值无多余空格或引号
- [ ] 已配置 AI 功能（可选）

部署后验证：
- [ ] 页面正常加载
- [ ] 数据库连接正常
- [ ] AI 功能可用（如已配置）
- [ ] 无错误日志

---

## 获取帮助

- **Supabase 文档**: https://supabase.com/docs
- **Coze 文档**: https://www.coze.cn/docs
- **项目文档**: [deployment-guide.md](./deployment-guide.md)
- **问题反馈**: GitHub Issues

---

**最后更新**: 2025-01-17
