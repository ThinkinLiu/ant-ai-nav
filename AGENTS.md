# 蚂蚁AI导航 - 项目规范

## 项目概览
- **项目名称**: 蚂蚁AI导航
- **描述**: 现代化的 AI 工具导航平台
- **技术栈**: Next.js 16 (App Router), React 19, TypeScript 5, shadcn/ui, Tailwind CSS 4, Supabase

## 构建和测试命令

### 开发环境
```bash
pnpm dev          # 启动开发服务器 (端口 5000)
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm ts-check     # TypeScript 类型检查
```

### 脚本文件
- `scripts/build.sh` - 构建脚本（支持 Coze 和独立服务器环境）
- `scripts/start.sh` - 生产环境启动脚本
- `scripts/dev.sh` - 开发环境启动脚本
- `scripts/prepare.sh` - 构建前准备脚本

## 环境变量配置

### 必需的环境变量
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥

### 可选的环境变量
- `COZE_WORKLOAD_IDENTITY_API_KEY` - Coze API 密钥
- `COZE_WORKLOAD_IDENTITY_CLIENT_ID` - Coze 客户端 ID
- `COZE_WORKLOAD_IDENTITY_CLIENT_SECRET` - Coze 客户端密钥

### 环境变量文件加载顺序
1. `.env.local` (最高优先级)
2. `.env.build`
3. `.env.production`
4. `.env`

## 目录结构
```
.
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/        # React 组件
│   ├── contexts/         # React Context
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   └── types/            # TypeScript 类型定义
├── public/               # 静态资源
├── scripts/              # 构建和部署脚本
├── .env*                 # 环境变量文件
└── .coze                 # Coze 配置文件
```

## API 接口

### 认证接口
- `POST /api/auth/login` - 邮箱登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/sync` - 跨域认证同步

### 公开接口
- `GET /api/health` - 健康检查
- `GET /api/tools` - 工具列表
- `GET /api/categories` - 分类列表
- `GET /api/news` - 资讯列表
- `GET /api/hall-of-fame` - 名人堂列表
- `GET /api/timeline` - 时间线列表

### 管理后台接口
- `GET/POST /api/admin/tools` - 工具管理
- `GET/POST /api/admin/categories` - 分类管理
- `GET/POST /api/admin/news` - 资讯管理
- `GET/POST /api/admin/announcements` - 公告管理

## 数据库

### Supabase 配置
- 使用 Supabase 作为后端即服务
- 使用 `@supabase/ssr` 进行服务端渲染支持
- 使用 `@supabase/supabase-js` 进行客户端操作

### 关键表
- `users` - 用户表
- `tools` - AI 工具表
- `categories` - 分类表
- `news` - 资讯表
- `announcements` - 公告表
- `hall_of_fame` - 名人堂表
- `timeline` - 时间线表

## 代码风格指南

### TypeScript
- 使用严格的 TypeScript 配置
- 所有函数参数必须标注类型
- 禁止使用隐式 any 类型

### React
- 使用 App Router 架构
- 使用 shadcn/ui 组件库
- 遵循 React 17+ 规范（无需显式导入 React）

### CSS
- 使用 Tailwind CSS 进行样式
- 使用 dark mode 支持

## 安全注意事项

### 认证
- 使用 Supabase Auth 进行用户认证
- JWT token 存储在 Cookie 中
- 支持跨域认证同步
- 使用 refreshTrigger 模式实现无闪烁登录/登出体验

### AuthContext 刷新机制
AuthContext 提供了 `refreshTrigger` 机制用于在不刷新页面的情况下通知组件刷新用户状态：

**导出值**：
- `refreshTrigger: number` - 刷新触发器计数，每次登录/登出后递增
- `triggerAuthRefresh: () => void` - 手动触发刷新的函数

**使用方式**：
```tsx
// 在组件中使用
const { user, refreshTrigger, triggerAuthRefresh } = useAuth()

// 监听用户状态变化（当 refreshTrigger 变化时会自动触发）
useEffect(() => {
  // 刷新用户相关数据
  fetchUserData()
}, [refreshTrigger, user])
```

**注意事项**：
- 登录/登出后 AuthContext 会自动触发 refreshTrigger
- 大多数组件通过依赖 `user` 状态来响应登录变化，无需额外监听 refreshTrigger
- 只有在数据获取不直接依赖 user 状态时，才需要额外监听 refreshTrigger

### API 安全
- 管理接口需要进行身份验证
- 使用 middleware 进行路由保护
- 敏感操作需要 CSRF 保护

## 部署

### Coze 部署
1. 使用 `pnpm run build` 构建项目
2. 使用 `pnpm run start` 启动生产服务器
3. 确保 `.env.production` 文件包含正确的环境变量

### 独立服务器部署
1. 构建 Docker 镜像
2. 运行容器并配置环境变量
3. 使用 Nginx 反向代理到 5000 端口
