# Coze 部署环境变量问题排查

## 问题现象

在 Coze 部署时，构建阶段提示缺少 `NEXT_PUBLIC_SUPABASE_URL` 环境变量，即使在以下位置都配置了：
- ✅ Coze 平台的生产环境变量
- ✅ .env.example.coze 文件
- ✅ .env.local 文件

## 问题原因

### 1. Next.js 环境变量加载机制

**关键点**：`NEXT_PUBLIC_*` 前缀的变量在**构建时**被内联到客户端代码中，必须在构建时就存在！

Next.js 只会自动加载以下文件：
```
.env.local          # 本地开发（优先级最高）
.env.development    # 开发环境
.env.production     # 生产环境
.env                # 通用配置
```

**注意**：`.env.example.coze` 这个文件名不会被 Next.js 识别！

### 2. Coze 环境变量作用域

- **运行时变量**：Coze 平台设置的环境变量通常在运行时注入
- **构建时缺失**：在构建阶段，这些变量可能还不可用

### 3. 构建脚本问题

当前的 `build.sh` 虽然尝试导出变量，但可能不够完善。

## 解决方案

### 方案一：在 Coze 平台直接设置标准变量（推荐）

在 Coze 平台的环境变量设置中，直接使用 `NEXT_PUBLIC_*` 命名：

```bash
# 在 Coze 平台设置以下环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

这样构建时和运行时都能正确读取。

### 方案二：使用构建脚本映射（自动化）

我已经更新了构建脚本，会在构建时自动映射变量。

### 方案三：使用 next.config.ts 注入（兜底）

在 `next.config.ts` 中添加环境变量配置。

## 验证步骤

1. **检查环境变量是否设置**
   ```bash
   # 在构建日志中查看
   echo "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
   echo "COZE_SUPABASE_URL: $COZE_SUPABASE_URL"
   ```

2. **验证构建时变量存在**
   - 查看 Coze 构建日志
   - 确认环境变量在构建阶段就可用

3. **测试运行时访问**
   - 部署后访问应用
   - 检查浏览器控制台是否有环境变量错误

## 推荐配置

### 在 Coze 平台设置的环境变量

```bash
# 必需 - 使用标准 Next.js 命名
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 可选 - Coze API 配置
COZE_WORKLOAD_IDENTITY_API_KEY=your-key
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-id
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-secret
```

### 文件配置（不要在模板文件中写实际值）

`.env.example.coze` 应该只包含注释说明，不包含实际值：

```bash
# Coze 环境变量配置模板
# 请在 Coze 平台的环境变量设置中添加以下变量

# 必需配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 注意事项

1. **不要提交实际配置值**
   - `.env.local` 应该在 `.gitignore` 中
   - `.env.example.*` 文件只作为模板

2. **构建时变量要求**
   - 所有 `NEXT_PUBLIC_*` 变量必须在构建时可用
   - 非 `NEXT_PUBLIC_*` 变量可以在运行时设置

3. **安全性**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理所有配置

---

**需要帮助？** 查看详细文档：
- [部署指南](./deployment-guide.md)
- [Coze 环境部署](./coze-deployment.md)
