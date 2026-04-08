# 跨域名认证系统

本系统支持在多个域名间共享登录状态，适用于以下场景：

- **子域名共享**：`www.example.com`, `ai.example.com`, `blog.example.com` 等
- **完全不同域名**：`example.com`, `another-site.com`, `third-site.com` 等

## 快速开始

### 1. 配置环境变量

在 Coze 平台的环境变量设置中添加：

```env
# 子域名共享（推荐）
NEXT_PUBLIC_MAIN_DOMAIN=example.com

# 完全不同域名同步
NEXT_PUBLIC_SHARED_DOMAINS=example.com,another-site.com,third-site.com

# 同步超时时间（可选，默认5秒）
NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=5000
```

### 2. 重新部署

配置完成后，重新部署应用即可。

### 3. 测试

参考 `/docs/CROSS_DOMAIN_TEST.md` 进行测试。

## 文档

- **[方案概述](/docs/CROSS_DOMAIN_AUTH.md)** - 详细的技术方案说明
- **[配置指南](/docs/CROSS_DOMAIN_SETUP.md)** - 完整的配置步骤和故障排查
- **[测试指南](/docs/CROSS_DOMAIN_TEST.md)** - 测试方法和调试技巧

## 技术架构

### 核心组件

1. **跨域 Cookie 管理** (`src/lib/auth/cross-domain.ts`)
   - 设置/删除跨域 Cookie
   - 计算主域名
   - 管理共享域名列表

2. **跨域认证 Hook** (`src/hooks/use-cross-domain-auth.ts`)
   - 初始化跨域认证
   - 监听跨域消息
   - 同步登录/登出状态

3. **认证同步 API** (`src/app/api/auth/sync/route.ts`)
   - 处理跨域认证同步请求
   - 使用 postMessage 通信

4. **认证上下文集成** (`src/contexts/AuthContext.tsx`)
   - 自动调用跨域同步
   - 无缝集成现有认证系统

### 工作流程

#### 子域名共享流程

```
登录 → 设置 Cookie (.example.com) → 所有子域名自动共享
```

#### 完全不同域名同步流程

```
登录 → 保存 token → 通过 postMessage 同步 → 其他域名接收并保存 → 刷新页面
```

## 使用示例

### 自动集成（推荐）

跨域认证已自动集成到现有的登录/登出流程中，无需额外代码：

```typescript
// 登录时自动同步
await login('user@example.com', 'password')
// ✅ 跨域同步已自动处理

// 登出时自动同步
await logout()
// ✅ 跨域同步已自动处理
```

### 手动控制

如果需要手动控制跨域同步：

```typescript
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

function MyComponent() {
  const { syncLogin, syncLogout, isCrossDomainEnabled } = useCrossDomainAuth()

  const handleLogin = async (token: string) => {
    // 手动同步登录
    await syncLogin(token)
  }

  const handleLogout = async () => {
    // 手动同步登出
    await syncLogout()
  }

  return (
    <div>
      {isCrossDomainEnabled ? '已启用跨域认证' : '未启用跨域认证'}
    </div>
  )
}
```

### 初始化跨域认证（仅完全不同域名需要）

如果使用完全不同域名同步，需要在应用根组件初始化：

```tsx
'use client'

import { useEffect } from 'react'
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { initCrossDomainAuth } = useCrossDomainAuth()

  useEffect(() => {
    initCrossDomainAuth()
  }, [initCrossDomainAuth])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## API 参考

### 工具函数

```typescript
import {
  getMainDomain,
  setCrossDomainCookie,
  removeCrossDomainCookie,
  syncAuthTokenToDomains,
  getSharedDomains,
  isCrossDomainEnabled
} from '@/lib/auth/cross-domain'
```

### Hook

```typescript
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

const {
  initCrossDomainAuth,
  syncLogin,
  syncLogout,
  isCrossDomainEnabled
} = useCrossDomainAuth({
  onLogin: (token) => console.log('收到登录消息'),
  onLogout: () => console.log('收到登出消息')
})
```

## 安全建议

1. **使用 HTTPS**：跨域 Cookie 必须在 HTTPS 下才能正确设置
2. **限制域名范围**：只在 `NEXT_PUBLIC_SHARED_DOMAINS` 中配置真正需要的域名
3. **定期刷新 Token**：实现 Token 自动刷新机制
4. **监控同步成功率**：记录跨域同步的成功/失败日志

## 故障排查

### 子域名无法共享登录

1. 检查 `NEXT_PUBLIC_MAIN_DOMAIN` 配置
2. 确保使用 HTTPS
3. 清除浏览器缓存和 Cookie

### 完全不同域名无法同步

1. 确保已调用 `initCrossDomainAuth()`
2. 检查 `NEXT_PUBLIC_SHARED_DOMAINS` 配置
3. 查看浏览器控制台错误信息
4. 确保所有域名使用相同协议

### 同步超时

1. 增加超时时间：`NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=10000`
2. 检查网络连接
3. 确认目标域名可以访问

详细故障排查请参考 `/docs/CROSS_DOMAIN_SETUP.md`。

## 性能优化

- 子域名共享：无额外性能开销
- 完全不同域名同步：每次登录/登出需要 1-5 秒（取决于网络和域名数量）
- 建议域名数量不超过 10 个

## 浏览器兼容性

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- 移动浏览器 ✅

## 测试

运行测试命令：

```bash
# 测试 Cookie 设置
pnpm test:cookie

# 测试跨域同步
pnpm test:sync

# 完整测试套件
pnpm test:cross-domain
```

详细测试方法请参考 `/docs/CROSS_DOMAIN_TEST.md`。

## 贡献

如果你发现问题或有改进建议，请提交 Issue。

## 许可

MIT License
