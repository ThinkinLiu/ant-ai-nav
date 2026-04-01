# 运行时配置快速开始

## 新功能 🎉

现在支持在首次部署后通过网页界面配置数据库，无需在构建时预配置环境变量！

## 快速开始

### 1. 构建镜像（无需配置数据库）

```bash
# 使用 GitHub Actions 构建（推荐）
# 或者本地构建
docker-compose up -d --build
```

### 2. 访问配置页面

首次访问网站会自动跳转到 `/settings` 页面：

```
http://your-domain.com
```

或直接访问：

```
http://your-domain.com/settings
```

### 3. 配置数据库

填写 Supabase 信息：

- **Supabase URL**: 例如 `https://your-project.supabase.co`
- **Supabase Anonymous Key**: 在 Supabase 控制台获取

点击"验证连接" → 点击"保存配置" → 完成！

## 管理后台

配置完成后，可以在管理后台修改配置：

```
http://your-domain.com/admin/settings
```

## 主要特性

- ✅ 构建时不需要预配置数据库
- ✅ 通过网页界面配置
- ✅ 支持验证数据库连接
- ✅ 配置文件保存在服务器端
- ✅ 向后兼容环境变量配置

## 配置优先级

1. 环境变量（如果有设置）
2. 运行时配置文件（`/app/config/database.json`）

## 详细文档

查看完整文档：[运行时数据库配置指南](./runtime-database-config.md)

---

**最后更新**: 2025-04-01
