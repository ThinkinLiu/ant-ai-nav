# 快速开始指南

本指南帮助你快速在 Coze 环境或独立服务器上部署蚂蚁AI导航。

## 🚀 快速部署（5分钟）

### Coze 环境

#### 步骤 1: 准备数据库
1. 访问 [Supabase](https://supabase.com) 创建项目
2. 获取项目 URL 和 Anon Key

#### 步骤 2: 配置环境变量
在 Coze 平台设置：
```
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

#### 步骤 3: 部署
1. 连接 Git 仓库
2. 点击部署
3. 完成！

### 独立服务器

#### 步骤 1: 克隆项目
```bash
git clone <your-repo-url>
cd ant-ai-navigation
pnpm install
```

#### 步骤 2: 配置环境
```bash
cp .env.example.standalone .env.local
# 编辑 .env.local 填写配置
```

#### 步骤 3: 检查配置
```bash
pnpm tsx scripts/check-env.ts
```

#### 步骤 4: 启动服务
```bash
pnpm dev  # 开发环境
# 或
pnpm build && pnpm start  # 生产环境
```

## 📋 环境变量说明

### 必需配置
| 变量名 | Coze 环境 | 独立服务器 | 获取方式 |
|--------|----------|-----------|---------|
| Supabase URL | `COZE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 控制台 → Settings → API |
| Supabase Key | `COZE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 控制台 → Settings → API |

### 可选配置
| 变量名 | 用途 | 获取方式 |
|--------|------|---------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | AI 生成功能 | Coze 平台 → 个人中心 |
| `S3_*` 变量 | 文件上传功能 | S3 服务提供商 |

## 🔍 验证部署

### 检查环境配置
```bash
pnpm tsx scripts/check-env.ts --config
```

### 测试环境兼容性
```bash
pnpm tsx scripts/test-env-compatibility.ts
```

### 验证服务运行
访问应用 URL，检查：
- ✅ 页面正常加载
- ✅ 数据库连接正常
- ✅ AI 功能可用（如已配置）

## 🆘 常见问题

### Q: 部署时提示"缺少数据库配置"
**A**: 检查环境变量是否正确设置：
- Coze 环境: 确保设置了 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY`
- 独立服务器: 确保 `.env.local` 文件存在且配置正确

运行环境检查：
```bash
pnpm tsx scripts/check-env.ts
```

### Q: 环境变量应该用哪个命名？
**A**: 
- **Coze 环境**: 使用 `COZE_*` 前缀（推荐）或 `NEXT_PUBLIC_*`
- **独立服务器**: 使用 `NEXT_PUBLIC_*`（推荐）

两种命名方式都支持，项目会按优先级读取。

### Q: 如何查看详细日志？
**A**: 
- **Coze 环境**: 在 Coze 控制台查看部署日志
- **独立服务器**: 
  ```bash
  # PM2
  pm2 logs ant-ai-nav
  
  # Docker
  docker logs ant-ai-nav
  ```

## 📚 详细文档

- [完整部署指南](./deployment-guide.md)
- [Coze 环境部署](./coze-deployment.md)
- [环境兼容性说明](./environment-compatibility-report.md)

## 💡 提示

1. **首次部署**: 建议先在本地测试环境配置，再部署到生产环境
2. **安全性**: 不要在代码中提交敏感信息，使用环境变量
3. **备份**: 定期备份 Supabase 数据库
4. **监控**: 使用日志监控应用运行状态

---

**需要帮助?** 
- 查看 [完整文档](./deployment-guide.md)
- 提交 [Issue](your-repo-url/issues)
