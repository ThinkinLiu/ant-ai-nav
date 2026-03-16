# 自动数据库同步配置指南

## 功能说明

Coze 部署时支持自动检查和同步数据库，无需手动执行 SQL 脚本。

## 配置步骤

### 1. 获取 Service Role Key

自动数据库同步需要 Supabase 的 Service Role Key（管理员密钥）：

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 在 **Project API keys** 部分找到 `service_role` key
5. 点击复制（⚠️ 此密钥具有管理员权限，请妥善保管！）

### 2. 在 Coze 平台配置环境变量

在 Coze 部署设置中添加以下环境变量：

#### 必需变量

```bash
# Supabase 基础配置（已有）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 数据库自动同步（新增）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 可选变量

```bash
# 是否启用自动同步（默认启用）
AUTO_SYNC_DATABASE=true

# 是否跳过数据库同步（用于调试）
# SKIP_DB_SYNC=false
```

### 3. 部署应用

配置完成后，每次部署时系统会自动：

1. ✅ 检查数据库连接
2. ✅ 检查必要的表是否存在
3. ✅ 检查初始数据是否已导入
4. ⚠️ 输出缺失的表和数据提示

### 4. 首次部署后的操作

首次部署时，如果数据库表不存在，系统会在日志中输出提示。请按以下步骤完成初始化：

1. **打开 Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/<your-project>/sql/new
   ```

2. **执行表结构创建脚本**
   - 复制 `database/00_schema.sql` 的内容
   - 粘贴到 SQL Editor 并执行

3. **导入初始数据**（按顺序执行）
   - `database/01_categories.sql` - 分类数据 ✅ 必需
   - `database/02_tags.sql` - 标签数据 ✅ 必需
   - `database/04_users.sql` - 默认用户 ✅ 必需
   - `database/05_ai_tools.sql` - AI 工具数据（可选）

## 自动同步功能

### 数据库状态检查 API

部署后可以通过 API 检查数据库状态：

```bash
# 检查数据库状态
curl https://your-app.vercel.app/api/admin/init-database

# 响应示例
{
  "success": true,
  "status": {
    "categories": { "exists": true, "count": 8 },
    "users": { "exists": true, "count": 2 },
    "ai_tools": { "exists": false, "count": 0 }
  },
  "summary": {
    "total": 15,
    "existing": 10,
    "missing": 5,
    "missingTables": ["ai_tools", "comments", "favorites"]
  }
}
```

### 启动时自动检查

每次应用启动时，会自动执行数据库检查：

```
🚀 Starting production server on port 3000...

🔍 检查数据库状态...

==========================================
蚂蚁AI导航 - 自动数据库同步
==========================================

📋 环境检查:
  Supabase URL: ✅ 已配置
  Service Role Key: ✅ 已配置

🔌 测试数据库连接...
  ✅ 数据库连接成功

📋 同步表结构...
  ✅ 核心表已存在，跳过表结构同步

📦 检查初始数据...
  ✅ 分类数据: 8 条
  ✅ 用户数据: 2 条
  ✅ AI工具数据: 100 条

==========================================
✅ 数据库同步检查完成
==========================================
```

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥（客户端使用） |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Service Role Key（用于数据库管理操作） |
| `AUTO_SYNC_DATABASE` | ❌ | 是否启用自动同步检查（默认 true） |
| `SKIP_DB_SYNC` | ❌ | 是否跳过数据库同步（默认 false） |

## 安全注意事项

1. **Service Role Key 保密**
   - 绝对不要在前端代码中使用
   - 不要提交到 Git 仓库
   - 只在服务端环境变量中使用

2. **API 访问控制**
   - `/api/admin/init-database` 需要授权才能执行写操作
   - 只有配置了 Service Role Key 才能使用管理功能

3. **生产环境建议**
   - 定期备份数据库
   - 使用 Supabase 的数据库版本控制功能
   - 考虑使用 Supabase CLI 管理数据库迁移

## 故障排查

### 问题：数据库连接失败

**可能原因：**
- 环境变量配置错误
- 网络连接问题
- Supabase 项目暂停

**解决方案：**
1. 检查环境变量是否正确
2. 确认 Supabase 项目状态正常
3. 查看应用日志获取详细错误信息

### 问题：表不存在

**解决方案：**
1. 登录 Supabase SQL Editor
2. 执行 `database/00_schema.sql` 创建表结构
3. 执行其他 SQL 文件导入数据

### 问题：数据未同步

**可能原因：**
- `SUPABASE_SERVICE_ROLE_KEY` 未配置
- 表已存在但数据为空

**解决方案：**
1. 确认已配置 Service Role Key
2. 使用 SQL Editor 手动导入数据
3. 或使用 `/api/admin/init-database` API 检查状态

## 高级配置

### 自定义同步行为

通过环境变量控制同步行为：

```bash
# 禁用自动同步检查
AUTO_SYNC_DATABASE=false

# 或完全跳过数据库检查
SKIP_DB_SYNC=true
```

### 使用 Supabase CLI

如果你更习惯使用 CLI 工具：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref <your-project-ref>

# 推送数据库变更
supabase db push
```

## 相关文档

- [数据库部署指南](./database-deployment.md)
- [环境变量配置](./environment-variables.md)
- [Supabase 官方文档](https://supabase.com/docs)
