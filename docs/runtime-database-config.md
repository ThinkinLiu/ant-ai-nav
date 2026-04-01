# 运行时数据库配置指南

## 概述

蚂蚁AI导航支持在首次部署后通过网页界面配置数据库连接信息，无需在构建时预配置环境变量。

## 功能特点

- ✅ 构建时不需要预配置数据库信息
- ✅ 通过网页界面 `/settings` 配置数据库
- ✅ 配置文件保存在服务器端（`/app/config/database.json`）
- ✅ 支持验证数据库连接
- ✅ 配置完成后自动跳转到首页

## 使用流程

### 1. 构建镜像

构建镜像时不需要提供数据库配置：

```bash
# 使用 GitHub Actions 构建（推荐）
# 或者本地构建
docker-compose build --no-cache
```

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 访问配置页面

首次访问网站时，如果数据库未配置，会自动跳转到 `/settings` 页面：

```
http://your-domain.com/settings
```

### 4. 配置数据库

在配置页面填写以下信息：

#### 必填项

- **Supabase URL**: 例如 `https://your-project.supabase.co`
- **Supabase Anonymous Key**: 在 Supabase 控制台获取

#### 可选项

- **Supabase Service Role Key**: 用于管理权限
- **站点 URL**: 例如 `https://your-domain.com`
- **站点名称**: 例如 `蚂蚁AI导航`

### 5. 验证连接

点击"验证连接"按钮，测试数据库连接是否正常。

### 6. 保存配置

验证通过后，点击"保存配置"按钮，配置会保存到服务器。

### 7. 完成配置

配置保存成功后，会自动跳转到首页，网站即可正常使用。

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

## 配置优先级

系统按以下优先级读取配置：

1. 环境变量（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
2. 运行时配置文件（`/app/config/database.json`）

**注意**：如果设置了环境变量，运行时配置文件会被忽略。

## 修改配置

### 方法 1：通过网页界面（推荐）

1. 访问 `/settings` 页面
2. 修改配置信息
3. 验证连接
4. 保存配置

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

## API 端点

### GET /api/config/database

检查数据库是否已配置。

**响应**：
```json
{
  "configured": true,
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
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
2. **备份配置**：定期备份配置文件
3. **测试连接**：配置前先验证数据库连接
4. **使用环境变量**：生产环境建议使用环境变量
5. **权限管理**：配置文件权限设置为 644

## 更新日志

- 2025-04-01: 新增运行时配置功能
