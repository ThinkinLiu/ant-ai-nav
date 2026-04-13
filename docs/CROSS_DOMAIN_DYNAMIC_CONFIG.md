# 跨域名认证 - 动态配置版

## 概述

跨域名认证系统支持**动态配置**，配置存储在数据库中，无需重新部署即可修改。

## 快速开始

### 1. 访问管理后台

登录管理后台，进入"跨域认证配置"页面。

### 2. 配置跨域认证

在管理后台配置页面，你可以：

- **启用/禁用**跨域认证
- **配置主域名**（用于子域名共享）
- **配置共享域名列表**（用于跨域名验证）
- **配置同步超时时间**

### 3. 保存配置

配置完成后，点击"保存配置"按钮。配置会立即生效，无需重新部署。

## 配置说明

### 启用跨域认证

- **开关**：启用/禁用跨域认证功能
- **影响**：关闭后，所有跨域功能停止

### 主域名（子域名共享）

- **用途**：用于子域名自动共享登录状态
- **示例**：`example.com` → 所有 `.example.com` 子域名共享
- **效果**：`www.example.com`, `ai.example.com`, `blog.example.com` 等自动共享登录状态

### 共享域名列表

- **用途**：用于跨域名验证
- **示例**：`example.com`, `another-site.com`
- **说明**：其他域名访问时会自动验证 Cookie 中的 token

## API 接口

### 获取配置

```
GET /api/admin/cross-domain-config
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "mainDomains": [".example.com"],
    "sharedDomains": ["example.com", "another-site.com"],
    "authSyncTimeout": 5000
  }
}
```

### 更新配置

```
PUT /api/admin/cross-domain-config
Content-Type: application/json

{
  "enabled": true,
  "mainDomains": [".example.com"],
  "sharedDomains": ["example.com", "another-site.com"],
  "authSyncTimeout": 5000
}
```

## 数据库表结构

```sql
CREATE TABLE cross_domain_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT false,           -- 是否启用
  main_domains TEXT[] DEFAULT '{}',       -- 主域名列表，如 [".example.com"]
  shared_domains TEXT[] DEFAULT '{}',      -- 共享域名列表
  auth_sync_timeout INTEGER DEFAULT 5000,  -- 同步超时（毫秒）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 工作原理

### 子域名共享

```
登录 → /api/auth/login 设置 Cookie (Domain=.example.com) 
     → 所有子域名浏览器自动共享该 Cookie
     → 无需额外同步
```

### 跨域名验证

```
访问 → /api/auth/me 读取 Cookie 中的 token 
     → 后端验证 token 有效性
     → 自动恢复登录状态
     → 无需主动同步
```

## 缓存机制

系统使用 5 分钟的缓存机制，避免频繁请求配置。

- **缓存时间**：5 分钟
- **自动清除**：保存配置后自动清除缓存

## 与环境变量的兼容性

系统完全向后兼容环境变量配置方式。

**优先级**：
1. 环境变量（`NEXT_PUBLIC_MAIN_DOMAIN`, `NEXT_PUBLIC_SHARED_DOMAINS`）
2. 管理后台动态配置

## 故障排查

### 问题 1：子域名无法共享登录

**解决方案**：

1. 确认 `enabled = true`
2. 检查 `main_domains` 包含正确的主域名（如 `.example.com`，带点前缀）
3. 确保使用 HTTPS
4. 清除浏览器缓存和 Cookie

### 问题 2：跨域名无法验证

**解决方案**：

1. 确认跨域认证已启用
2. 检查 `shared_domains` 是否包含目标域名
3. 查看浏览器控制台错误信息

### 问题 3：配置无法加载

**解决方案**：

1. 检查数据库连接
2. 查看服务器日志
3. 检查 `cross_domain_config` 表是否存在

## 安全建议

1. **HTTPS**：生产环境必须使用 HTTPS
2. **域名验证**：只添加可信域名
3. **定期审查**：定期检查共享域名列表
4. **访问控制**：限制管理后台访问权限

## 测试

### 子域名共享测试

1. 配置主域名：`.example.com`
2. 在 `www.example.com` 登录
3. 打开 `ai.example.com`
4. 验证自动登录状态

### 跨域名验证测试

1. 在 `example.com` 登录
2. 打开 `another-site.com`
3. 验证自动登录状态

## 常见问题

**Q: 修改配置后需要重新部署吗？**

A: 不需要。配置保存后立即生效。

**Q: 配置保存在哪里？**

A: 配置保存在数据库的 `cross_domain_config` 表中。

**Q: 配置会缓存多久？**

A: 默认缓存 5 分钟，保存配置后自动清除缓存。
