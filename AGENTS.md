# 蚂蚁AI导航 - 项目规范

## 项目概览
- **项目名称**: 蚂蚁AI导航
- **描述**: 现代化的 AI 工具导航平台
- **技术栈**: Next.js 16 (App Router), React 19, TypeScript 5, shadcn/ui, Tailwind CSS 4, Supabase

## 主要功能
- **AI工具导航**: 收录各类AI工具，支持分类浏览和搜索
- **发布功能**: 登录用户可在顶部导航栏使用发布功能
  - **发布工具**: 发布AI工具（需要 publisher 或 admin 角色）
  - **发布资讯**: 发布AI相关资讯（需要 publisher 或 admin 角色）
- **名人堂**: 展示AI领域杰出人物
- **时间线**: 记录AI发展重要事件

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
- `GET /api/seo?site_type=nav|home` - 获取指定站点的SEO配置
- `GET /api/sitemap-home` - 获取蚂蚁AI之家站点地图

### 管理后台接口
- `GET/POST /api/admin/tools` - 工具管理
- `GET/POST /api/admin/categories` - 分类管理
- `GET/POST /api/admin/news` - 资讯管理
- `GET/POST /api/admin/announcements` - 公告管理
- `GET/PUT /api/admin/seo?site_type=nav|home` - SEO设置管理（支持多站点）

## 数据库

### Supabase 配置
- 使用 Supabase 作为后端即服务
- 使用 `@supabase/ssr` 进行服务端渲染支持
- 使用 `@supabase/supabase-js` 进行客户端操作

### 关键表
- `users` - 用户表
- `ai_tools` - AI 工具表
- `categories` - 分类表
- `ai_news` - AI 资讯表
- `tags` - 标签表
- `tool_tags` - 工具标签关联表
- `announcements` - 公告表
- `comments` - 评论表
- `favorites` - 收藏表
- `ai_hall_of_fame` - AI 名人堂表
- `ai_timeline` - AI 大事纪表
- `friend_links` - 友情链接表
- `publisher_applications` - 发布者申请表
- `ai_tool_rankings` - AI工具排行榜表
- `ranking_update_log` - 排行榜更新日志表
- `site_settings` - 站点设置
- `smtp_settings` - SMTP设置
- `traffic_data_sources` - 流量数据源表
- `seo_settings` - SEO配置表（支持多站点，通过 `site_type` 字段区分：`nav`=蚂蚁AI导航，`home`=蚂蚁AI之家）
- `cross_domain_config` - 跨域认证配置表

### SEO 多站点配置
项目支持为不同站点配置独立的 SEO 设置：

| 站点 | site_type | 描述 |
|------|-----------|------|
| 蚂蚁AI导航 | `nav` | AI工具导航平台 |
| 蚂蚁AI之家 | `home` | AI博客/资讯平台 |

**配置说明**：
- 管理后台 `/admin/seo` 支持切换站点进行配置
- 公开 API `/api/seo?site_type=nav|home` 获取指定站点配置
- 蚂蚁AI之家站点地图：`/api/sitemap-home`

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
- 支持表格编辑
- 支持从网页粘贴内容（保留基本格式）
- **支持AI工具（DeepSeek等）代码块粘贴**

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
- **从DeepSeek等AI工具粘贴代码块**：智能清理复杂格式，保留纯文本和换行
- 粘贴图片：自动转换为 base64 或通过 `onImageUpload` 上传
- 拖拽图片：同上

**代码块处理**：
- 自动检测 Markdown 代码块（```python```）并转换为 `<pre><code>` 格式
- 识别带代码特征的 div/p 标签（class 包含 language-、code-block、highlight 等）
- 自动提取纯文本内容，移除语法高亮标签
- **保护代码块内的换行和缩进**（防止全局空格清理破坏代码格式）
- 保留原始换行和缩进
- 清理连续空行（最多保留一行）
- 支持多种代码块样式识别

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
