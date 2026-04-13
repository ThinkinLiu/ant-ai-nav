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

### 富文本编辑器
项目使用 TipTap 作为富文本编辑器，支持丰富的编辑功能：

**组件位置**：`src/components/ui/rich-text-editor.tsx`

**功能特性**：
- 支持加粗、斜体、删除线、行内代码
- 支持标题（H1、H2、H3）
- 支持有序列表、无序列表、任务列表
- 支持引用和代码块
- 支持添加链接
- 支持插入图片（支持粘贴、拖拽上传）
- 支持从网页粘贴内容（保留基本格式）

**使用方式**：
```tsx
import RichTextEditor from '@/components/ui/rich-text-editor'

<RichTextEditor
  content={htmlContent}
  onChange={(html) => setContent(html)}
  placeholder="请输入内容..."
  minHeight="200px"
  onImageUpload={async (file) => {
    // 返回图片 URL
    return '/uploads/image.png'
  }}
/>
```

**粘贴行为**：
- 从网页粘贴：自动清理外部样式，保留基本 HTML 结构（标题、列表、图片等）
- 粘贴图片：自动转换为 base64 或通过 `onImageUpload` 上传
- 拖拽图片：同上

## 安全注意事项

### 认证
- 使用 Supabase Auth 进行用户认证
- JWT token 存储在 Cookie 中
- 支持跨域认证同步（多域名登录状态共享）
- 使用 refreshTrigger 模式实现无闪烁登录/登出体验

### 跨域认证同步机制
支持在多个域名之间共享登录状态（如 `ai.mayiai.site`、`mayi.mayiai.site`、`mayiai.site` 等）。

**简化后的实现（2024年优化）**：

1. **子域名共享**：
   - 登录时 `/api/auth/login` 设置带有 `Domain=.mayiai.site` 的 Cookie
   - 所有子域名（ai.mayiai.site, mayi.mayiai.site 等）自动共享该 Cookie
   - 无需额外同步调用

2. **跨域名验证**：
   - 其他域名访问时，`/api/auth/me` 从 Cookie 读取 token
   - 后端验证 token 有效性，自动恢复登录状态
   - 无需主动同步

3. **登出处理**：
   - 删除本地 Cookie
   - 调用 `/api/auth/logout` 清除后端 session
   - 无需同步到其他域名

**配置方式**：
跨域配置存储在数据库 `cross_domain_config` 表中：
- `enabled`: 是否启用跨域同步
- `main_domains`: 主域名列表（如 `[".mayiai.site", ".itlao5.com", ".coze.site"]`）
- `shared_domains`: 需要同步的完整域名列表（如 `["ai.mayiai.site", "mayi.mayiai.site", ...]`）
- `auth_sync_timeout`: 同步超时时间（毫秒）

**API 端点**：
- `GET /api/auth/sync` - 跨域认证同步
  - 支持多种格式：`html`（默认）、`json`、`jsonp`、`window`
  - `window` 模式用于 `window.open` + `postMessage` 方式

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
