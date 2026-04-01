# 管理后台配置指南

## 概述

管理后台提供数据库配置和站点信息管理功能，支持在运行时修改配置，无需重启服务。

## 访问管理后台

```
http://your-domain.com/admin/settings
```

## 功能特性

### 1. 配置查看
- 查看当前数据库配置
- 查看站点信息
- 密钥自动脱敏显示

### 2. 配置修改
- 修改 Supabase URL
- 修改 Supabase Anonymous Key
- 修改 Supabase Service Role Key
- 修改站点 URL
- 修改站点名称

### 3. 连接验证
- 验证数据库连接
- 实时测试配置有效性

### 4. 安全保护
- 密钥脱敏处理
- 不会在前端暴露完整密钥
- 支持显示/隐藏密钥切换

## 脱敏处理

### API 返回脱敏

当 API 返回配置信息时，会自动对密钥进行脱敏处理：

```json
{
  "configured": true,
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseAnonKey": "eyJhbGc...5cCI6Ikp",
    "supabaseServiceRoleKey": "eyJhbGc...5cCI6Ikp",
    "siteUrl": "https://your-domain.com",
    "siteName": "蚂蚁AI导航"
  }
}
```

### 前端显示

管理后台加载配置时：
- 不会显示完整密钥
- 用户需要重新输入密钥才能修改
- 支持显示/隐藏密钥切换

## 配置修改流程

### 步骤 1: 访问管理后台

```
http://your-domain.com/admin/settings
```

### 步骤 2: 查看当前配置

页面会自动加载当前配置（密钥已脱敏）。

### 步骤 3: 修改配置

填写需要修改的字段：
- 如果要修改密钥，需要重新输入完整密钥
- 如果不修改密钥，可以留空（保持原值）

### 步骤 4: 验证连接（可选）

点击"验证连接"按钮，测试新配置是否有效。

### 步骤 5: 保存配置

点击"保存配置"按钮，配置会立即生效。

## 配置优先级

系统按以下优先级读取配置：

1. **环境变量**（最高优先级）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **运行时配置文件**
   - `/app/config/database.json`

**注意**：如果设置了环境变量，运行时配置文件会被忽略。

## 安全建议

### 1. 密钥保护
- ✅ 不要在前端存储完整密钥
- ✅ 使用 HTTPS 传输配置
- ✅ 定期更换密钥
- ✅ 使用最小权限原则

### 2. 访问控制
- ✅ 管理后台需要登录
- ✅ 限制管理后台访问 IP
- ✅ 使用强密码
- ✅ 启用双因素认证

### 3. 审计日志
- ✅ 记录配置修改历史
- ✅ 监控异常配置变更
- ✅ 定期审计配置

## 配置文件

### 位置

配置文件保存在容器内：

```
/app/config/database.json
```

### 格式

```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "supabaseServiceRoleKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "siteUrl": "https://your-domain.com",
  "siteName": "蚂蚁AI导航"
}
```

### 安全性

- ✅ 配置文件保存在服务器端
- ✅ 不会暴露给前端
- ✅ 不会被复制到 Docker 镜像中
- ✅ 支持随时修改

## API 端点

### GET /api/config/database

检查数据库是否已配置（返回脱敏后的配置）。

**响应**：
```json
{
  "configured": true,
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseAnonKey": "eyJhbGc...5cCI6Ikp",
    "supabaseServiceRoleKey": "eyJhbGc...5cCI6Ikp",
    "siteUrl": "https://your-domain.com",
    "siteName": "蚂蚁AI导航"
  }
}
```

### POST /api/config/database/save

保存数据库配置。

**请求**：
```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "supabaseServiceRoleKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "siteUrl": "https://your-domain.com",
  "siteName": "蚂蚁AI导航"
}
```

**响应**：
```json
{
  "success": true,
  "message": "配置保存成功",
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
    "siteUrl": "https://your-domain.com",
    "siteName": "蚂蚁AI导航"
  }
}
```

### POST /api/config/database/validate

验证数据库连接。

**请求**：
```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**：
```json
{
  "success": true,
  "message": "数据库连接成功"
}
```

## 客户端和服务端配置分离

### 客户端配置

**用途**：浏览器端直接连接数据库

**配置来源**：
- 环境变量（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- 不支持运行时配置文件（安全考虑）

**使用场景**：
- 客户端组件
- 浏览器直接查询
- 实时订阅

### 服务端配置

**用途**：服务端 API 操作数据库

**配置来源**：
- 环境变量（优先）
- 运行时配置文件（`/app/config/database.json`）

**使用场景**：
- API 路由
- 服务端组件
- 管理后台

### 配置统一

所有服务端 API 路由和服务端组件都使用统一的配置来源，确保一致性：

1. 优先使用环境变量
2. 如果环境变量不存在，使用运行时配置文件
3. 两者都不存在时，抛出错误

## 故障排查

### 问题 1：管理后台无法访问

**症状**：访问 `/admin/settings` 显示 404 或权限错误。

**解决方案**：

1. 确保已登录管理员账号
2. 检查路由配置
3. 清除浏览器缓存

### 问题 2：配置修改后不生效

**症状**：保存配置后，系统仍然使用旧配置。

**解决方案**：

1. 检查是否设置了环境变量（环境变量优先级最高）
2. 重启容器：
```bash
docker-compose restart
```

### 问题 3：密钥显示为空

**症状**：管理后台显示密钥为空。

**原因**：这是正常的安全行为，完整密钥不会显示在前端。

**解决方案**：
- 修改配置时需要重新输入完整密钥
- 或者通过服务器直接查看配置文件

### 问题 4：验证连接失败

**症状**：点击"验证连接"提示连接失败。

**解决方案**：

1. 检查 Supabase URL 是否正确
2. 检查 Supabase Anonymous Key 是否正确
3. 确保数据库中有 `tools` 表
4. 检查 Supabase 项目的 RLS 策略是否允许匿名访问

## 最佳实践

1. **首次配置**：使用 `/settings` 页面配置
2. **日常维护**：使用 `/admin/settings` 管理后台
3. **备份配置**：定期备份配置文件
4. **测试连接**：配置前先验证数据库连接
5. **使用环境变量**：生产环境建议使用环境变量
6. **权限管理**：配置文件权限设置为 644
7. **定期审计**：定期检查配置变更日志

## 更新日志

- 2025-04-01: 新增管理后台配置功能
- 2025-04-01: 添加配置脱敏处理
- 2025-04-01: 统一客户端和服务端配置
