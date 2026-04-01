# Coze 平台环境变量配置指南

## 🎯 快速配置（3步完成）

### 步骤 1: 获取 Supabase 配置

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL** (例如: `https://xxx.supabase.co`)
   - **anon public** 密钥 (以 `eyJ` 开头的长字符串)

### 步骤 2: 在 Coze 平台配置环境变量

1. 登录 [Coze 平台](https://www.coze.cn)
2. 进入你的应用
3. 找到 **设置** → **环境变量**
4. 添加以下两个**必需**变量：

```
变量名: NEXT_PUBLIC_SUPABASE_URL
变量值: https://your-project.supabase.co

变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY  
变量值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步骤 3: 重新部署

1. 保存环境变量
2. 触发重新部署
3. 等待部署完成

## ✅ 验证配置

部署完成后，查看构建日志，应该看到：

```
🔧 配置环境变量...
  ✅ NEXT_PUBLIC_SUPABASE_URL 已设置
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置

✅ 环境变量配置完成
```

## ⚠️ 常见错误

### 错误 1: 在文件中配置而不是平台

❌ **错误做法**：
- 在 `.env.example.coze` 文件中填写实际值
- 期望 Next.js 自动读取这个文件

✅ **正确做法**：
- 在 **Coze 平台**的环境变量设置中配置
- 文件只是模板，不会被自动读取

### 错误 2: 使用错误的变量名

❌ **错误示例**：
```
SUPABASE_URL=https://xxx.supabase.co  # 缺少 NEXT_PUBLIC_ 前缀
```

✅ **正确示例**：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # 标准命名
# 或
COZE_SUPABASE_URL=https://xxx.supabase.co  # Coze 命名（也支持）
```

### 错误 3: 只在运行时设置，构建时缺失

❌ **错误理解**：
- 认为环境变量只需要在运行时存在

✅ **正确理解**：
- `NEXT_PUBLIC_*` 变量在**构建时**就被内联到代码中
- 必须在构建前就存在于 Coze 平台的环境变量中

## 🔍 支持的环境变量命名

项目支持以下环境变量命名方式，按优先级读取：

### Supabase URL
1. `NEXT_PUBLIC_SUPABASE_URL` ⭐ 推荐
2. `COZE_SUPABASE_URL` ⭐ Coze 环境
3. `SUPABASE_URL`

### Supabase Anon Key
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⭐ 推荐
2. `COZE_SUPABASE_ANON_KEY` ⭐ Coze 环境
3. `SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`

## 📋 完整配置清单

### 必需配置

| 变量名 | 值示例 | 在哪里获取 |
|--------|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase → Settings → API → anon public |

### 可选配置（AI 功能）

| 变量名 | 说明 |
|--------|------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 |
| `COZE_WORKLOAD_IDENTITY_CLIENT_ID` | Coze 客户端 ID |
| `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` | Coze 客户端密钥 |

## 🎓 工作原理

### Next.js 环境变量机制

```
构建阶段:
├── 读取环境变量
├── NEXT_PUBLIC_* 变量被内联到客户端代码
└── 生成生产构建

运行阶段:
├── 服务端变量从 process.env 读取
└── 客户端变量已被内联（构建时确定）
```

### 我们的双重保障机制

1. **next.config.ts** - 在构建时映射变量
   ```typescript
   env: {
     NEXT_PUBLIC_SUPABASE_URL: process.env.COZE_SUPABASE_URL || ...
   }
   ```

2. **build.sh** - 在构建脚本中显式导出
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="$COZE_SUPABASE_URL"
   ```

## 📞 获取帮助

如果配置后仍有问题：

1. 查看构建日志中的环境变量验证部分
2. 确认变量名完全正确（区分大小写）
3. 确认变量值没有多余的空格或引号
4. 查看 [故障排查指南](./coze-env-troubleshooting.md)

---

**快速链接**：
- [部署指南](./deployment-guide.md)
- [快速开始](./quick-start.md)
- [故障排查](./coze-env-troubleshooting.md)
