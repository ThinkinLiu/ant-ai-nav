# 蚂蚁AI导航 - 完整部署和配置指南

## 🚀 快速开始

### 前提条件

- Docker 已安装
- docker-image.tar.gz 镜像文件
- Supabase 项目（数据库）

### 部署步骤

#### 1️⃣ 加载 Docker 镜像

```bash
# 加载镜像
docker load < docker-image.tar.gz

# 验证镜像
docker images | grep ant-ai-nav
```

#### 2️⃣ 启动容器

```bash
# 停止并删除旧容器（如果存在）
docker stop ant-ai-nav 2>/dev/null
docker rm ant-ai-nav 2>/dev/null

# 创建配置目录
mkdir -p ./config
chmod 777 ./config

# 启动容器
docker run -d \
    -p 5000:5000 \
    --name ant-ai-nav \
    -v $(pwd)/config:/app/config \
    --restart unless-stopped \
    ant-ai-nav:latest

# 查看启动日志
docker logs --tail 30 ant-ai-nav
```

#### 3️⃣ 验证服务

```bash
# 检查容器状态
docker ps | grep ant-ai-nav

# 测试服务
curl -I http://localhost:5000
```

---

## ⚙️ 数据库配置

### 方式 1: 通过 Web 界面配置（推荐）

1. 访问配置页面：`http://mayiai.itlao5.com/settings`
2. 填写以下信息：
   - **Supabase URL**: 你的 Supabase 项目 URL
   - **Supabase Anon Key**: 匿名访问密钥
   - **Supabase Service Role Key**: 服务端密钥（管理员权限）

### 方式 2: 通过 API 配置

```bash
curl -X POST http://localhost:5000/api/config/database/save \
    -H "Content-Type: application/json" \
    -d '{
        "supabaseUrl": "https://your-project.supabase.co",
        "supabaseAnonKey": "your-anon-key",
        "supabaseServiceRoleKey": "your-service-role-key"
    }'
```

### 获取 Supabase 凭证

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: 匿名访问密钥
   - **service_role key**: 服务端密钥

---

## 🔧 静态资源配置

### 检查 _next 软链接

```bash
# 检查软链接
docker exec ant-ai-nav sh -c "ls -la /app/_next"
# 应该显示: _next -> .next

# 如果不存在，创建
docker exec -it -u root ant-ai-nav sh -c "cd /app && ln -sf .next _next"

# 重启容器
docker restart ant-ai-nav
```

### 验证静态资源

```bash
# 测试静态资源
curl -I http://localhost:5000/_next/static/BUILD_ID
# 应该返回 HTTP 200
```

---

## 🗄️ 数据库初始化

如果数据库是新的，需要创建表结构。

### 方式 1: 通过管理后台

1. 访问：`http://mayiai.itlao5.com/admin/data-migration`
2. 执行数据迁移脚本

### 方式 2: 手动执行 SQL

在 Supabase Dashboard 的 SQL Editor 中执行初始化脚本。

---

## ✅ 部署验证

### 使用自动化检查脚本

```bash
# 给脚本添加执行权限
chmod +x scripts/deploy-checklist.sh

# 运行检查
./scripts/deploy-checklist.sh
```

### 手动验证

```bash
# 1. 检查容器状态
docker ps | grep ant-ai-nav

# 2. 检查日志（应该没有错误）
docker logs --tail 50 ant-ai-nav | grep -iE "error|exception|failed"

# 3. 测试首页
curl -I http://localhost:5000

# 4. 测试 API
curl http://localhost:5000/api/home

# 5. 测试静态资源
curl -I http://localhost:5000/_next/static/BUILD_ID
```

---

## 🛠️ 常见问题

### 问题 1: 静态资源 404

**症状**: 浏览器控制台显示静态资源 404 错误

**解决方案**:

```bash
# 检查软链接
docker exec ant-ai-nav sh -c "ls -la /app/_next"

# 如果不存在，创建
docker exec -it -u root ant-ai-nav sh -c "cd /app && ln -sf .next _next"

# 重启容器
docker restart ant-ai-nav
```

### 问题 2: 数据库配置失败

**症状**: 保存配置时提示权限错误

**解决方案**:

```bash
# 检查配置目录权限
ls -la ./config

# 修复权限
chmod 777 ./config

# 重启容器
docker restart ant-ai-nav
```

### 问题 3: API 返回 500

**症状**: 所有 API 接口返回 500 错误

**解决方案**:

1. 检查数据库配置是否正确
2. 检查 Supabase 连接是否正常
3. 查看日志：`docker logs --tail 100 ant-ai-nav`

### 问题 4: 容器无法启动

**症状**: 容器启动后立即退出

**解决方案**:

```bash
# 查看详细日志
docker logs ant-ai-nav

# 检查端口占用
netstat -tlnp | grep 5000

# 重新创建容器
docker stop ant-ai-nav
docker rm ant-ai-nav
docker run -d -p 5000:5000 --name ant-ai-nav \
    -v $(pwd)/config:/app/config \
    --restart unless-stopped \
    ant-ai-nav:latest
```

---

## 📋 部署检查清单

- [ ] Docker 镜像已加载
- [ ] 容器已启动并运行
- [ ] 配置目录已创建（`./config`）
- [ ] 配置目录权限正确（777）
- [ ] `_next` 软链接存在
- [ ] 静态资源可访问
- [ ] 数据库已配置
- [ ] 数据库表已初始化
- [ ] 首页可访问
- [ ] API 接口正常
- [ ] 无错误日志

---

## 🌐 访问地址

部署完成后，你可以通过以下地址访问：

- **网站首页**: `http://mayiai.itlao5.com/`
- **配置页面**: `http://mayiai.itlao5.com/settings`
- **管理后台**: `http://mayiai.itlao5.com/admin`
- **数据迁移**: `http://mayiai.itlao5.com/admin/data-migration`

---

## 📝 常用命令

### 容器管理

```bash
# 查看容器状态
docker ps | grep ant-ai-nav

# 查看日志
docker logs -f ant-ai-nav

# 重启容器
docker restart ant-ai-nav

# 停止容器
docker stop ant-ai-nav

# 进入容器
docker exec -it ant-ai-nav sh

# 删除容器
docker stop ant-ai-nav && docker rm ant-ai-nav
```

### 配置管理

```bash
# 查看配置目录
ls -la ./config

# 查看数据库配置
cat ./config/database.json

# 修复配置目录权限
chmod 777 ./config
```

### 调试

```bash
# 检查静态资源
docker exec ant-ai-nav ls -la /app/_next

# 测试静态资源
curl -I http://localhost:5000/_next/static/BUILD_ID

# 测试 API
curl http://localhost:5000/api/home

# 查看错误日志
docker logs --tail 100 ant-ai-nav | grep -iE "error|exception|failed"
```

---

## 🔄 更新部署

当有新版本时：

```bash
# 1. 下载新镜像
docker load < docker-image.tar.gz

# 2. 停止旧容器
docker stop ant-ai-nav

# 3. 删除旧容器
docker rm ant-ai-nav

# 4. 删除旧镜像（可选）
docker rmi ant-ai-nav:old-tag

# 5. 启动新容器
docker run -d \
    -p 5000:5000 \
    --name ant-ai-nav \
    -v $(pwd)/config:/app/config \
    --restart unless-stopped \
    ant-ai-nav:latest

# 6. 验证
docker logs --tail 20 ant-ai-nav
```

---

## 📚 相关文档

- [Docker 部署指南](./docker-deployment.md)
- [静态资源问题解决方案](./static-404-solution.md)
- [API 错误修复指南](./api-400-500-fix.md)
- [数据库配置指南](./database-configuration.md)

---

## 💡 提示

1. **首次部署后，必须先配置数据库**
2. **配置数据库后，可能需要初始化数据库表**
3. **静态资源问题通过创建 _next 软链接解决**
4. **遇到问题先查看日志：`docker logs ant-ai-nav`**
5. **使用 `./scripts/deploy-checklist.sh` 快速检查部署状态**

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`docker logs ant-ai-nav`
2. 运行检查脚本：`./scripts/deploy-checklist.sh`
3. 查看相关文档
4. 检查 GitHub Issues
