# Coze 部署环境变量配置

## 问题说明
在 Coze 部署后，登录接口返回 401 错误，原因是环境变量没有在部署时被正确加载。

## 解决方案

### 方案 1：通过 Coze 环境变量配置界面（推荐）

在 Coze 部署配置界面中，需要手动添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0
COZE_SUPABASE_URL=https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0
```

### 方案 2：修改 .env.build 文件

由于 `.env.build` 会被 git 追踪，可以在 `.env.build` 中添加 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0
COZE_SUPABASE_URL=https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0
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

- 确保 Supabase URL 和 ANON KEY 与本地开发环境一致
- 环境变量设置后需要重新部署才能生效
- 如果使用方案 2，请将 `.env.build` 提交到 Git 仓库
- 建议同时设置 `NEXT_PUBLIC_` 和 `COZE_` 前缀的变量，以确保前后端都能正确使用
