# Coze 部署环境变量配置

## 问题说明
在 Coze 部署后，登录接口返回 401 错误，原因是环境变量没有在部署时被正确加载。

## 解决方案

### 方案 1：通过 Coze 环境变量配置界面（推荐）

在 Coze 部署配置界面中，需要手动添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 方案 2：修改 .env.build 文件

由于 `.env.build` 会被 git 追踪，可以在 `.env.build` 中添加 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 环境变量说明

### NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
- 这些变量用于前端代码构建
- 在 Next.js 中，`NEXT_PUBLIC_` 前缀的变量会被嵌入到客户端代码中

### COZE_SUPABASE_URL / COZE_SUPABASE_ANON_KEY
- 这些变量用于后端 API 路由（Server-side）
- 在 Coze 部署环境中，运行时优先使用这些变量
- 如果未设置，会回退到 `NEXT_PUBLIC_` 变量

## 验证步骤

1. 登录 Coze 控制台
2. 进入部署配置界面
3. 检查环境变量是否正确设置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `COZE_SUPABASE_URL`
   - `COZE_SUPABASE_ANON_KEY`
4. 重新部署应用
5. 测试登录功能

## 注意事项

- **重要**：请勿将包含真实凭据的 `.env.production` 或 `.env.build` 文件提交到 GitHub！
- 建议使用 Coze 控制台配置环境变量，而不是依赖文件
- 如果必须使用文件，请确保在 `.gitignore` 中添加相应的文件

## 如何获取环境变量

### Supabase 配置
1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 进入项目设置 → API
3. 复制 `Project URL` 和 `anon public` 密钥

### Coze 认证配置
1. 登录 Coze 控制台
2. 进入部署配置 → 环境变量
3. 配置 Coze 工作负载身份验证
