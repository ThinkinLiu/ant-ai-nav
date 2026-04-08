# 跨域名认证 - 动态配置版

## 概述

跨域名认证系统现在支持**动态配置**，无需重新部署即可修改域名配置。所有配置都在管理后台进行，立即生效。

## 快速开始

### 1. 访问管理后台

登录管理后台，进入"跨域认证配置"页面。

### 2. 配置跨域认证

在管理后台配置页面，你可以：

- **启用/禁用**跨域认证
- **配置主域名**（用于子域名共享）
- **配置共享域名列表**（用于完全不同域名同步）
- **配置同步超时时间**

### 3. 保存配置

配置完成后，点击"保存配置"按钮。配置会立即生效，无需重新部署。

## 配置方式

### 子域名共享（推荐）

**适用场景**：`www.example.com`, `ai.example.com`, `blog.example.com`

**配置步骤**：

1. 在管理后台打开"跨域认证配置"
2. 启用跨域认证开关
3. 在"主域名"输入框中输入：`example.com`
4. 点击"保存配置"

**效果**：
- 所有子域名自动共享登录状态
- 无需额外代码
- 自动处理 Cookie domain

### 完全不同域名同步

**适用场景**：`example.com`, `another-site.com`, `third-site.com`

**配置步骤**：

1. 在管理后台打开"跨域认证配置"
2. 启用跨域认证开关
3. 在"共享域名列表"中添加所有需要共享登录的域名
4. 点击"保存配置"

**额外步骤**（仅需一次）：
在每个域名的应用根组件中初始化跨域认证：

```tsx
'use client'

import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { reloadConfig } = useCrossDomainAuth()

  useEffect(() => {
    // 配置更改后重新加载
    reloadConfig()
  }, [reloadConfig])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

**注意**：`useCrossDomainAuth` Hook 会自动初始化，通常不需要手动调用。

## 配置说明

### 启用跨域认证

- **开关**：启用/禁用跨域认证功能
- **影响**：关闭后，所有跨域同步功能停止

### 主域名（子域名共享）

- **用途**：用于子域名自动共享登录状态
- **示例**：`example.com`
- **效果**：`www.example.com`, `ai.example.com`, `blog.example.com` 等所有子域名共享登录状态
- **优先级**：高于共享域名列表

### 共享域名列表（完全不同域名）

- **用途**：用于完全不同域名间的登录状态同步
- **示例**：`example.com`, `another-site.com`, `third-site.com`
- **添加方法**：在输入框中输入域名，点击"+"按钮
- **删除方法**：点击域名标签上的"×"按钮
- **数量限制**：建议不超过 10 个

### 同步超时时间

- **用途**：跨域同步的超时时间
- **默认值**：5000 毫秒（5秒）
- **建议范围**：3000-10000 毫秒
- **影响**：超时后仍会尝试继续同步，但不会无限等待

## API 接口

### 获取配置

```typescript
GET /api/admin/cross-domain-config
```

**响应**：
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "mainDomain": "example.com",
    "sharedDomains": ["another-site.com"],
    "authSyncTimeout": 5000
  }
}
```

### 更新配置

```typescript
PUT /api/admin/cross-domain-config
Content-Type: application/json

{
  "enabled": true,
  "mainDomain": "example.com",
  "sharedDomains": ["another-site.com"],
  "authSyncTimeout": 5000
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "mainDomain": "example.com",
    "sharedDomains": ["another-site.com"],
    "authSyncTimeout": 5000
  }
}
```

## 缓存机制

系统使用 5 分钟的缓存机制，避免频繁请求配置。

- **缓存时间**：5 分钟
- **自动清除**：保存配置后自动清除缓存
- **手动清除**：调用 `clearCrossDomainConfigCache()` 函数

## 与环境变量的兼容性

系统完全向后兼容环境变量配置方式。

**优先级**：
1. 环境变量（`NEXT_PUBLIC_*`）
2. 管理后台动态配置

如果配置了环境变量，环境变量优先。

## 故障排查

### 问题 1：配置保存后未生效

**解决方案**：

1. 检查是否点击了"保存配置"按钮
2. 刷新浏览器页面
3. 清除浏览器缓存
4. 检查管理后台日志

### 问题 2：跨域同步失败

**解决方案**：

1. 确认跨域认证已启用
2. 检查域名格式是否正确
3. 检查目标域名是否可以访问
4. 增加同步超时时间
5. 查看浏览器控制台错误信息

### 问题 3：配置无法加载

**解决方案**：

1. 检查数据库连接
2. 查看服务器日志
3. 重启应用
4. 检查 API 是否正常

## 安全建议

1. **HTTPS**：生产环境必须使用 HTTPS
2. **域名验证**：只添加可信域名
3. **定期审查**：定期检查共享域名列表
4. **访问控制**：限制管理后台访问权限

## 性能优化

- 使用 5 分钟缓存减少 API 请求
- 子域名共享无额外性能开销
- 跨域同步有超时机制
- 建议域名数量不超过 10 个

## 测试

### 子域名共享测试

1. 配置主域名：`example.com`
2. 在 `www.example.com` 登录
3. 打开 `ai.example.com`
4. 验证自动登录状态

### 完全不同域名测试

1. 添加域名：`another-site.com`
2. 在 `example.com` 登录
3. 打开 `another-site.com`
4. 等待 1-2 秒，验证自动登录状态

### 配置更改测试

1. 修改配置（添加/删除域名）
2. 点击"保存配置"
3. 验证配置立即生效

## 迁移指南

### 从环境变量迁移到动态配置

1. 在管理后台配置相同的域名
2. 删除或注释环境变量
3. 测试配置是否正常工作

**优势**：
- 无需重新部署即可修改配置
- 配置更改立即生效
- 更灵活的域名管理

### 从动态配置迁移到环境变量

1. 在环境变量中配置域名
2. 禁用管理后台配置（可选）
3. 重新部署应用

**注意**：环境变量优先于管理后台配置。

## 常见问题

**Q: 修改配置后需要重新部署吗？**

A: 不需要。配置保存后立即生效。

**Q: 环境变量和动态配置可以同时使用吗？**

A: 可以。环境变量优先于动态配置。

**Q: 配置会缓存多久？**

A: 默认缓存 5 分钟，保存配置后自动清除缓存。

**Q: 可以配置多少个域名？**

A: 理论上没有限制，但建议不超过 10 个。

**Q: 配置保存在哪里？**

A: 配置保存在数据库的 `cross_domain_config` 表中。

**Q: 如何查看当前配置？**

A: 在管理后台的"跨域认证配置"页面查看，或调用 API。

## 技术架构

### 数据库表

```sql
cross_domain_config (
  id BIGSERIAL PRIMARY KEY,
  main_domain VARCHAR(255),
  shared_domains TEXT[],
  auth_sync_timeout INTEGER DEFAULT 5000,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 核心组件

- **配置管理 API**：`/api/admin/cross-domain-config`
- **跨域工具库**：`src/lib/auth/cross-domain.ts`
- **跨域 Hook**：`src/hooks/use-cross-domain-auth.ts`
- **管理后台页面**：`/admin/cross-domain-config`

### 工作流程

1. 管理员在后台配置域名
2. 保存到数据库
3. 前端通过 API 获取配置（带缓存）
4. 根据配置执行跨域同步
5. 配置更改后自动清除缓存

## 文档

- **技术方案**：`/docs/CROSS_DOMAIN_AUTH.md`
- **配置指南**：`/docs/CROSS_DOMAIN_SETUP.md`
- **测试指南**：`/docs/CROSS_DOMAIN_TEST.md`

## 支持

如有问题，请：

1. 查看本文档
2. 查看浏览器控制台错误信息
3. 查看服务器日志
4. 提交 Issue 并附上详细信息和配置
