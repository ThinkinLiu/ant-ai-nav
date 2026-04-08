# 跨域名共享登录方案

## 方案概述

本方案支持两种跨域名场景：

### 场景1：子域名共享（推荐）
**适用范围：** `www.example.com`, `ai.example.com`, `blog.example.com` 等主域名相同的子域名

**实现原理：** 设置 Cookie domain 为顶级域名（如 `.example.com`），所有子域名共享相同 Cookie

**优点：**
- 简单高效，无需额外代码
- 自动同步登录状态
- 安全性高

**配置方法：**
```env
# 设置主域名
NEXT_PUBLIC_MAIN_DOMAIN=example.com
```

### 场景2：完全不同域名
**适用范围：** `example.com`, `another-site.com` 等完全不同的域名

**实现原理：** 使用 postMessage API 在不同域名间传递认证 token

**优点：**
- 支持任意域名组合
- 实时同步登录/登出状态

**配置方法：**
```env
# 配置所有需要共享登录的域名（逗号分隔）
NEXT_PUBLIC_SHARED_DOMAINS=example.com,another-site.com,third-site.com
```

## 实现步骤

### 1. 环境变量配置

在 `.env.local` 中添加：

```env
# 主域名（用于子域名共享）
NEXT_PUBLIC_MAIN_DOMAIN=example.com

# 共享域名列表（用于完全不同域名的同步）
NEXT_PUBLIC_SHARED_DOMAINS=example.com,www.example.com,ai.example.com

# 认证同步超时时间（毫秒）
NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=5000
```

### 2. 使用方式

#### 子域名共享（自动）
如果使用子域名，只需配置 `NEXT_PUBLIC_MAIN_DOMAIN`，系统会自动设置 Cookie domain。

```typescript
// 登录时
await login('user@example.com', 'password')
// Cookie 会自动在所有子域名间共享
```

#### 完全不同域名（需要初始化）

```typescript
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

function App() {
  const { initCrossDomainAuth } = useCrossDomainAuth()

  useEffect(() => {
    // 初始化跨域认证
    initCrossDomainAuth()
  }, [])

  return <YourApp />
}
```

### 3. 工作流程

#### 登录流程
1. 用户在任意域名登录
2. 系统保存 token 到 localStorage 和 Cookie
3. 如果是子域名模式：Cookie 自动在所有子域名共享
4. 如果是完全不同域名模式：通过 postMessage 同步到其他域名

#### 登出流程
1. 用户在任意域名登出
2. 系统清除本地 token
3. 通知所有关联域名清除 token
4. 重定向到登录页

### 4. 安全注意事项

1. **HTTPS 要求**：跨域 Cookie 必须使用 HTTPS
2. **SameSite 策略**：设置为 `Lax` 或 `None`（配合 Secure）
3. **Token 验证**：每次请求都需在后端验证 token 有效性
4. **定期刷新**：实现 token 自动刷新机制

## 测试方法

### 测试子域名共享
```bash
# 1. 在 www.example.com 登录
# 2. 打开 ai.example.com
# 3. 应该自动处于登录状态
```

### 测试完全不同域名同步
```bash
# 1. 在 example.com 登录
# 2. 打开 another-site.com
# 3. 应该自动处于登录状态（需要初始化）
```

## 故障排查

### 问题1：子域名间无法共享登录
**解决：** 检查 `NEXT_PUBLIC_MAIN_DOMAIN` 配置是否正确

### 问题2：完全不同域名无法同步
**解决：**
- 确保已调用 `initCrossDomainAuth()`
- 检查 `NEXT_PUBLIC_SHARED_DOMAINS` 是否包含所有域名
- 查看浏览器控制台是否有跨域错误

### 问题3：Cookie 无法设置
**解决：**
- 确保使用 HTTPS
- 检查域名格式（不能包含协议和端口）
