# 部署指南

本指南提供蚂蚁AI导航项目的完整部署说明。

## 部署方式概览

| 部署方式 | 难度 | 推荐度 | 说明 |
|---------|------|--------|------|
| Docker | ⭐⭐ | ⭐⭐⭐⭐⭐ | 最推荐，跨平台，易于维护 |
| Docker Compose | ⭐⭐ | ⭐⭐⭐⭐⭐ | 推荐，适合多容器部署 |
| 宝塔面板 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 适合中国用户，可视化操作 |
| GitHub Actions | ⭐⭐ | ⭐⭐⭐⭐ | 云端构建，适合低内存服务器 |

## 快速开始

### 1. 准备工作

- 服务器：推荐 1GB+ 内存
- 域名（可选）
- Supabase 账号（用于数据库）

### 2. 部署选择

根据你的需求选择合适的部署方式：

- **新手推荐**：Docker 或 Docker Compose
- **低内存服务器**：GitHub Actions + Docker
- **可视化操作**：宝塔面板
- **企业级部署**：Kubernetes（需要额外配置）

## 详细部署指南

### Docker 部署

完整的 Docker 部署指南，包括镜像构建、容器运行、Nginx 配置等。

[查看详细文档 →](./docs/deploy-docker.md)

### Docker Compose 部署

使用 Docker Compose 简化部署流程，支持多容器编排。

[查看详细文档 →](./docs/deploy-docker.md)

### 宝塔面板部署

适合中国用户的可视化部署方式。

[查看详细文档 →](./docs/deploy-baota.md)

### GitHub Actions 构建

使用 GitHub Actions 在云端构建镜像，适合低内存服务器。

[查看详细文档 →](./docs/github-actions-guide.md)

## 数据库配置

### Supabase 配置（推荐）

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 执行数据库初始化脚本
4. 获取连接信息

[查看数据库部署指南 →](./docs/database-deployment.md)

### 运行时配置

无需在构建时配置数据库，首次访问网站时通过 `/settings` 页面配置。

[查看运行时配置指南 →](./docs/runtime-database-config.md)

## 环境变量配置

### 必需配置

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 可选配置

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=蚂蚁AI导航
```

[查看完整环境变量文档 →](./docs/environment-variables.md)

## 常见问题

### 1. 构建失败

**症状**：Docker 构建时内存不足

**解决方案**：
- 使用 GitHub Actions 云端构建
- 增加 Docker 构建内存限制
- 使用 `.dockerignore` 减少构建上下文

### 2. 静态资源 404

**症状**：页面能访问但样式和脚本全部 404

**解决方案**：
[查看静态资源 404 修复指南 →](./docs/docker-static-404-fix.md)

### 3. 数据库连接失败

**症状**：无法连接到数据库

**解决方案**：
- 检查数据库配置是否正确
- 验证数据库是否启动
- 检查网络连接
- 确认 RLS 策略允许访问

### 4. 端口冲突

**症状**：5000 端口被占用

**解决方案**：
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "5001:5000"  # 改为其他端口
```

## 性能优化

### 1. Nginx 反向代理

配置 Nginx 反向代理，提高访问速度和安全性。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL 证书

使用 Let's Encrypt 免费证书，启用 HTTPS。

```bash
# 在宝塔面板中申请证书
# 或使用 certbot
certbot --nginx -d your-domain.com
```

### 3. 缓存配置

配置 Redis 缓存，提高响应速度。

```yaml
# docker-compose.yml 添加 Redis
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 4. 负载均衡

使用多实例部署，通过 Nginx 负载均衡。

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

## 监控和日志

### 1. 日志管理

```bash
# 查看容器日志
docker logs -f ant-ai-nav

# 日志轮转配置（docker-compose.yml）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 2. 健康检查

```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 3. 监控工具

- Docker Stats：`docker stats ant-ai-nav`
- Prometheus + Grafana：完整监控方案
- Uptime Robot：外部监控服务

## 备份和恢复

### 1. 数据库备份

```bash
# 备份 Supabase 数据库
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql

# 或使用 Supabase Dashboard 手动备份
```

### 2. 配置备份

```bash
# 备份配置文件
docker cp ant-ai-nav:/app/config/database.json ./database.json.backup
```

### 3. 镜像备份

```bash
# 导出镜像
docker save ant-ai-nav:latest | gzip > ant-ai-nav-backup.tar.gz

# 恢复镜像
docker load < ant-ai-nav-backup.tar.gz
```

## 安全建议

### 1. 网络安全

- 启用 HTTPS
- 配置防火墙
- 限制管理后台访问 IP

### 2. 数据安全

- 定期备份数据库
- 使用强密码
- 启用双因素认证

### 3. 应用安全

- 保持依赖更新
- 监控安全漏洞
- 使用环境变量管理密钥

## 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker logs ant-ai-nav

# 检查容器状态
docker inspect ant-ai-nav

# 手动启动排查
docker run -it --rm ant-ai-nav:latest sh
```

### 2. 性能问题

```bash
# 检查资源使用
docker stats ant-ai-nav

# 查看进程
docker exec ant-ai-nav top

# 检查日志
docker logs --tail 100 ant-ai-nav
```

### 3. 数据库问题

- 检查数据库连接配置
- 验证数据库状态
- 查看数据库日志
- 测试数据库连接

## 迁移指南

### 从旧版本迁移

1. 备份数据库
2. 更新代码
3. 重新构建镜像
4. 迁移数据（如有结构变更）
5. 验证功能

### 迁移到新服务器

1. 导出数据库和配置
2. 在新服务器部署
3. 导入数据库和配置
4. 更新 DNS 解析
5. 测试验证

## 更多资源

- [Docker 部署详细文档](./docs/deploy-docker.md)
- [宝塔部署指南](./docs/deploy-baota.md)
- [数据库配置指南](./docs/database-deployment.md)
- [运行时配置指南](./docs/runtime-database-config.md)
- [故障排查文档](./docs/docker-static-404-fix.md)

## 技术支持

如遇到问题，请查看以下资源：

- GitHub Issues：[提交问题](https://github.com/ThinkinLiu/ant-ai-nav/issues)
- 文档：[完整文档](./docs/)
- 社区：[Discord](https://discord.gg/antai)

---

**最后更新**: 2025-04-01
