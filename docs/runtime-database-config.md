# 运行时数据库配置指南

## 概述

蚂蚁AI导航支持在首次部署后通过网页界面配置数据库连接信息，无需在构建时预配置环境变量。同时支持在管理后台修改数据库配置及站点信息。

## 配置方式

### 方式 1：首次配置（推荐新用户）

首次部署后访问网站，会自动跳转到 `/settings` 页面进行初始配置。

### 方式 2：管理后台修改（推荐已有用户）

登录管理后台，访问 `/admin/settings` 页面修改配置。

## 配置优先级

系统按以下优先级读取配置：

1. **环境变量**（最高优先级）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **运行时配置文件**
   - `/app/config/database.json`

**注意**：如果设置了环境变量，运行时配置文件会被忽略。

## 首次配置流程

### 1. 构建镜像

构建镜像时不需要提供数据库配置：

```bash
# 使用 GitHub Actions 构建（推荐）
# 或者本地构建
docker-compose up -d --build
```

### 2. 访问配置页面

首次访问网站时，如果数据库未配置，会自动跳转到 `/settings` 页面：

```
http://your-domain.com
```

或直接访问：

```
http://your-domain.com/settings
```

### 3. 配置数据库

在配置页面填写以下信息：

#### 必填项

- **Supabase URL**: 例如 `https://your-project.supabase.co`
- **Supabase Anonymous Key**: 在 Supabase 控制台获取

#### 可选项

- **Supabase Service Role Key**: 用于管理权限
- **站点 URL**: 例如 `https://your-domain.com`
- **站点名称**: 例如 `蚂蚁AI导航`

### 4. 验证连接

点击"验证连接"按钮，测试数据库连接是否正常。

### 5. 保存配置

验证通过后，点击"保存配置"按钮，配置会保存到服务器。

### 6. 完成配置

配置保存成功后，会自动跳转到首页，网站即可正常使用。

## 管理后台配置修改

### 访问管理后台

```
http://your-domain.com/admin/settings
```

### 功能特性

- ✅ 查看当前配置（密钥已脱敏）
- ✅ 修改数据库配置
- ✅ 修改站点信息
- ✅ 验证数据库连接
- ✅ 实时保存生效

### 脱敏处理

为了安全，API 返回配置时会自动脱敏处理密钥：

- 完整密钥：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- 脱敏后：`eyJhbGc...5cCI6Ikp`

管理后台加载配置时也不会显示完整密钥，需要重新输入。详细说明请查看 [管理后台配置指南](./admin-settings-guide.md)。

## 配置文件说明

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

## 修改配置

### 方法 1：通过网页界面（推荐）

1. 访问 `/settings` 页面（首次配置）
2. 访问 `/admin/settings` 页面（管理后台）
3. 修改配置信息
4. 验证连接
5. 保存配置

### 方法 2：直接修改配置文件

进入容器修改配置文件：

```bash
# 进入容器
docker exec -it ant-ai-nav sh

# 编辑配置文件
vi /app/config/database.json

# 重启容器使配置生效
docker-compose restart
```

### 方法 3：使用环境变量（不推荐）

修改 `docker-compose.yml`，添加环境变量：

```yaml
services:
  app:
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 故障排查

### 问题 1：无法保存配置

**症状**：点击"保存配置"后提示错误。

**解决方案**：

1. 检查容器是否有 `/app/config` 目录的写权限：

```bash
docker exec -it ant-ai-nav sh
ls -la /app/config
```

2. 如果目录不存在或权限不足，重新构建镜像（Dockerfile 已修复）。

### 问题 2：配置保存后仍然提示未配置

**症状**：配置保存成功，但访问 `/settings` 仍然显示配置页面。

**解决方案**：

1. 检查配置文件是否正确保存：

```bash
docker exec -it ant-ai-nav sh
cat /app/config/database.json
```

2. 检查文件权限：

```bash
docker exec -it ant-ai-nav sh
ls -la /app/config/database.json
```

3. 重启容器：

```bash
docker-compose restart
```

### 问题 3：数据库连接验证失败

**症状**：点击"验证连接"提示连接失败。

**解决方案**：

1. 检查 Supabase URL 是否正确
2. 检查 Supabase Anonymous Key 是否正确
3. 确保数据库中有 `tools` 表
4. 检查 Supabase 项目的 RLS 策略是否允许匿名访问

### 问题 4：页面 404

**症状**：访问 `/settings` 页面显示 404。

**解决方案**：

1. 检查是否使用最新版本的代码
2. 重新构建镜像：

```bash
docker-compose build --no-cache
docker-compose up -d
```

## 常见问题

### Q1: 可以不配置直接使用吗？

A: 不可以。网站需要数据库才能正常工作，必须配置 Supabase 连接信息。

### Q2: 配置文件可以备份吗？

A: 可以。备份 `/app/config/database.json` 文件：

```bash
docker cp ant-ai-nav:/app/config/database.json ./database.json.backup
```

恢复：

```bash
docker cp ./database.json.backup ant-ai-nav:/app/config/database.json
docker-compose restart
```

### Q3: 配置文件会被提交到 Git 吗？

A: 不会。配置文件保存在容器内，不在项目代码中，不会被提交到 Git。

### Q4: 可以使用其他数据库吗？

A: 目前只支持 Supabase 数据库。

### Q5: 配置文件可以在多个容器间共享吗？

A: 不建议。每个容器应该有独立的配置文件。如果需要共享，使用环境变量或 Docker 卷。

## 最佳实践

1. **首次配置**：使用网页界面 `/settings` 配置
2. **日常维护**：使用 `/admin/settings` 管理后台
3. **备份配置**：定期备份配置文件
4. **测试连接**：配置前先验证数据库连接
5. **使用环境变量**：生产环境建议使用环境变量
6. **权限管理**：配置文件权限设置为 644

## 更多资源

- [管理后台配置指南](./admin-settings-guide.md)
- [Docker 部署指南](./deploy-docker.md)
- [数据库部署指南](./database-deployment.md)

---

**最后更新**: 2025-04-01
