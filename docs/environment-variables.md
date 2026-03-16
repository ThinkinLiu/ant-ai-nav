# 环境变量配置指南

## 问题说明

部署时出现 `缺少 Supabase URL 配置` 错误，这是因为 `.env.local` 文件被 `.gitignore` 忽略，不会提交到代码仓库。

## 解决方案

### 方案一：在 Coze 平台设置环境变量（推荐）

在 Coze 部署平台的环境变量设置中添加：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 或者使用 Coze 命名方式
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

### 方案二：使用 `.env.build` 文件

1. 创建 `.env.build` 文件（构建时使用）：

```bash
# 复制模板
cp .env.example .env.build

# 编辑文件，填写实际值
nano .env.build
```

2. 注意：`.env.build` 已添加到 `.gitignore`，不会被提交到代码仓库

### 方案三：修改部署配置

如果您的部署平台支持，可以在部署配置文件中设置环境变量。

## 环境变量优先级

构建脚本按以下优先级读取环境变量：

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `COZE_SUPABASE_URL`
3. `SUPABASE_URL`
4. `.env.build` 文件
5. 占位符值（构建不会失败）

## 验证环境变量

运行以下命令验证环境变量是否正确设置：

```bash
# 本地验证
pnpm tsx scripts/check-env.ts

# 或者在构建脚本中查看输出
bash scripts/build.sh
```

## 注意事项

- `NEXT_PUBLIC_*` 变量在构建时内联到代码中，必须构建前设置
- 不要将敏感信息提交到代码仓库
- 生产环境请使用真实的 Supabase URL 和 Key
