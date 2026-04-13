# 跨域名认证系统

本系统支持在多个域名间共享登录状态，适用于以下场景：

- **子域名共享**：`www.example.com`, `ai.example.com`, `blog.example.com` 等
- **完全不同域名**：`example.com`, `another-site.com` 等

## 快速开始

### 1. 配置数据库

在 `cross_domain_config` 表中配置：

```sql
UPDATE cross_domain_config SET 
  enabled = true,
  main_domains = ARRAY['.example.com', '.another-site.com'],
  shared_domains = ARRAY['example.com', 'www.example.com', 'ai.example.com', 'another-site.com']
WHERE id = 1;
```

### 2. 重新部署

配置完成后，重新部署应用即可。

## 技术架构

### 核心原理

1. **子域名共享**：
   - 登录时 `/api/auth/login` 设置带有 `Domain=.example.com` 的 Cookie
   - 所有子域名浏览器自动共享该 Cookie
   - 无需额外同步调用

2. **跨域名验证**：
   - 其他域名访问时，`/api/auth/me` 从 Cookie 读取 token
   - 后端验证 token 有效性，自动恢复登录状态
   - 无需主动同步

3. **登出处理**：
   - 删除本地 Cookie
   - 调用 `/api/auth/logout` 清除后端 session
   - 无需同步到其他域名

### 核心组件

1. **跨域 Cookie 管理** (`src/lib/auth/cross-domain.ts`)
   - 设置/删除跨域 Cookie
   - 计算主域名
   - 管理共享域名列表

2. **跨域认证 Hook** (`src/hooks/use-cross-domain-auth.ts`)
   - 监听跨域消息（向后兼容）
   - 管理配置缓存

3. **认证同步 API** (`src/app/api/auth/sync/route.ts`)
   - 处理跨域认证同步请求（向后兼容）

4. **认证上下文集成** (`src/contexts/AuthContext.tsx`)
   - 自动处理登录/登出
   - Cookie 已在 `/api/auth/login` 中设置

### 工作流程

#### 子域名共享流程

```
登录 → /api/auth/login 设置 Cookie (Domain=.example.com) → 所有子域名自动共享
```

#### 跨域名验证流程

```
访问 → /api/auth/me 读取 Cookie 中的 token → 后端验证 → 恢复登录状态
```

## API 参考

### 数据库表

```sql
-- cross_domain_config 表结构
CREATE TABLE cross_domain_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT false,           -- 是否启用
  main_domains TEXT[] DEFAULT '{}',         -- 主域名列表，如 [".example.com"]
  shared_domains TEXT[] DEFAULT '{}',       -- 共享域名列表
  auth_sync_timeout INTEGER DEFAULT 5000    -- 同步超时（毫秒）
);
```

### 环境变量（可选）

```env
# 子域名共享（可选，优先使用数据库配置）
NEXT_PUBLIC_MAIN_DOMAIN=example.com

# 共享域名列表（可选）
NEXT_PUBLIC_SHARED_DOMAINS=example.com,another-site.com
```

## 安全建议

1. **使用 HTTPS**：跨域 Cookie 必须在 HTTPS 下才能正确设置
2. **限制域名范围**：只在配置中包含真正需要的域名
3. **定期刷新 Token**：Token 有有效期限制

## 故障排查

### 子域名无法共享登录

1. 检查数据库 `cross_domain_config` 表配置
2. 确保 `main_domains` 包含正确的主域名（如 `.example.com`）
3. 确保使用 HTTPS
4. 清除浏览器缓存和 Cookie

### 跨域名无法验证

1. 确保 `cross_domain_config` 表 `enabled = true`
2. 检查 `shared_domains` 是否包含目标域名
3. 查看浏览器控制台错误信息
4. 确保所有域名使用相同协议
