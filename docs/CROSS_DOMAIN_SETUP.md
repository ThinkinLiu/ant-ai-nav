# 跨域名登录配置指南

## 快速开始

### 场景一：子域名共享（推荐）

如果你的站点使用子域名（如 `www.example.com`, `ai.example.com`, `blog.example.com`），这是最简单的方案。

#### 配置步骤

1. **在环境变量中添加主域名**

在 Coze 平台的环境变量设置中添加：

```env
NEXT_PUBLIC_MAIN_DOMAIN=example.com
```

2. **重新部署应用**

配置完成后，重新部署应用即可。

3. **测试**

- 在 `www.example.com` 登录
- 打开 `ai.example.com`
- 应该自动处于登录状态

#### 工作原理

系统会自动设置 Cookie 的 `domain` 为 `.example.com`，所有子域名共享相同的 Cookie，实现登录状态的自动同步。

---

### 场景二：完全不同域名

如果你的站点使用完全不同的域名（如 `example.com`, `another-site.com`, `third-site.com`），需要使用跨域 Token 同步。

#### 配置步骤

1. **在环境变量中添加共享域名列表**

在 Coze 平台的环境变量设置中添加：

```env
NEXT_PUBLIC_SHARED_DOMAINS=example.com,www.example.com,another-site.com,third-site.com
```

注意：
- 使用逗号分隔多个域名
- 不要包含协议（http:// 或 https://）
- 不要包含端口号

2. **在应用根组件中初始化跨域认证**

在你的应用的根组件（通常是 `app/layout.tsx` 或 `_app.tsx`）中：

```tsx
'use client'

import { useEffect } from 'react'
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { initCrossDomainAuth } = useCrossDomainAuth()

  useEffect(() => {
    // 初始化跨域认证
    initCrossDomainAuth()
  }, [initCrossDomainAuth])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

3. **重新部署应用**

配置完成后，重新部署应用。

4. **测试**

- 在 `example.com` 登录
- 打开 `another-site.com`
- 应该自动处于登录状态

#### 工作原理

1. 用户在一个域名登录时，系统会通过 postMessage API 将认证 token 发送到其他域名
2. 其他域名接收到 token 后，自动保存到 localStorage
3. 页面自动刷新以加载用户信息
4. 登出时同样会同步到所有域名

---

## 高级配置

### 配置同步超时时间

默认情况下，跨域同步的超时时间为 5 秒。你可以根据需要调整：

```env
NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=10000  # 10秒
```

### 组合使用两种方案

如果你同时拥有子域名和完全不同的域名，可以同时配置两种方案：

```env
# 子域名共享
NEXT_PUBLIC_MAIN_DOMAIN=example.com

# 完全不同域名同步
NEXT_PUBLIC_SHARED_DOMAINS=another-site.com,third-site.com
```

---

## 故障排查

### 问题 1：子域名无法共享登录状态

**症状**：在 `www.example.com` 登录后，`ai.example.com` 仍然显示未登录

**解决方案**：

1. 检查 `NEXT_PUBLIC_MAIN_DOMAIN` 配置是否正确
   ```env
   # 错误
   NEXT_PUBLIC_MAIN_DOMAIN=https://www.example.com

   # 正确
   NEXT_PUBLIC_MAIN_DOMAIN=example.com
   ```

2. 确保使用 HTTPS（生产环境必须）
3. 清除浏览器缓存和 Cookie 后重试

### 问题 2：完全不同域名无法同步登录状态

**症状**：在 `example.com` 登录后，`another-site.com` 仍然显示未登录

**解决方案**：

1. 确保已调用 `initCrossDomainAuth()` 函数
2. 检查 `NEXT_PUBLIC_SHARED_DOMAINS` 配置
   ```env
   # 错误（包含协议）
   NEXT_PUBLIC_SHARED_DOMAINS=https://example.com,https://another-site.com

   # 正确
   NEXT_PUBLIC_SHARED_DOMAINS=example.com,another-site.com
   ```

3. 打开浏览器控制台，查看是否有跨域错误信息
4. 确保所有域名都使用相同的协议（都使用 HTTP 或都使用 HTTPS）

### 问题 3：同步超时

**症状**：登录成功，但其他域名没有自动登录

**解决方案**：

1. 增加超时时间
   ```env
   NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=10000  # 增加到 10 秒
   ```

2. 检查网络连接
3. 确认目标域名可以正常访问

### 问题 4：Cookie 无法设置

**症状**：浏览器控制台显示 Cookie 设置失败

**解决方案**：

1. 确保使用 HTTPS（生产环境必须）
2. 检查域名格式是否正确
3. 清除浏览器的 Cookie 和缓存

---

## 安全建议

### 1. 使用 HTTPS

跨域 Cookie 必须在 HTTPS 下才能正确设置。生产环境必须使用 HTTPS。

### 2. 设置合理的超时时间

不要设置过长的同步超时时间，建议使用 5-10 秒。

### 3. 定期刷新 Token

建议实现 Token 自动刷新机制，避免 Token 过期导致需要重新登录。

### 4. 限制共享域名范围

只在 `NEXT_PUBLIC_SHARED_DOMAINS` 中配置真正需要共享登录的域名。

---

## API 参考

### useCrossDomainAuth Hook

```typescript
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

const { initCrossDomainAuth, syncLogin, syncLogout, isCrossDomainEnabled } = useCrossDomainAuth()
```

**参数：**

- `options.onLogin(token)`: 登录回调
- `options.onLogout()`: 登出回调

**返回值：**

- `initCrossDomainAuth()`: 初始化跨域认证
- `syncLogin(token)`: 手动同步登录
- `syncLogout()`: 手动同步登出
- `isCrossDomainEnabled`: 是否启用了跨域认证

### setCrossDomainCookie

```typescript
import { setCrossDomainCookie } from '@/lib/auth/cross-domain'

setCrossDomainCookie('auth_token', 'your-token', {
  domain: '.example.com',
  maxAge: 30 * 24 * 60 * 60, // 30天
})
```

### syncAuthTokenToDomains

```typescript
import { syncAuthTokenToDomains } from '@/lib/auth/cross-domain'

await syncAuthTokenToDomains('your-token', 'login')
```

---

## 示例代码

### 完整的登录流程示例

```typescript
'use client'

import { useState } from 'react'
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isCrossDomainEnabled } = useCrossDomainAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      // 登录成功
      console.log('登录成功')
      
      // 跨域登录已自动处理，无需额外代码
    } else {
      console.error('登录失败:', data.error)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* 表单内容 */}
    </form>
  )
}
```

---

## 常见问题

**Q: 可以同时使用 Cookie 和 localStorage 吗？**

A: 可以。本方案会同时使用两种存储方式，确保最大兼容性。

**Q: 跨域同步安全吗？**

A: 是的。我们使用了 postMessage API 进行安全通信，并且会验证消息来源。

**Q: 支持多少个域名？**

A: 理论上没有限制，但建议不超过 10 个域名，以避免性能问题。

**Q: 如果某个域名无法访问怎么办？**

A: 同步过程有超时机制，不会影响其他域名的正常使用。

**Q: 需要修改后端代码吗？**

A: 不需要。跨域认证完全在前端实现，后端无需改动。

---

## 技术支持

如果遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查环境变量配置
3. 查看 `/docs/CROSS_DOMAIN_AUTH.md` 文档
4. 提交 Issue 并附上错误信息和配置
