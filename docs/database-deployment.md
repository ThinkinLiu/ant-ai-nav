# 数据库部署指南

## 问题说明

Coze 部署时没有自动同步数据库到 Supabase，需要手动执行数据库初始化。

## 解决方案

### 方案一：使用 Supabase SQL Editor（推荐）

这是最简单的方法，适合首次部署：

1. **打开 Supabase 控制台**
   - 登录 [Supabase Dashboard](https://supabase.com/dashboard)
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单点击 "SQL Editor"
   - 点击 "New query" 创建新查询

3. **执行表结构创建脚本**
   - 复制 `database/00_schema.sql` 文件的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行
   - 确认所有表创建成功

4. **导入初始数据**（可选）
   - 按顺序执行以下文件：
     - `01_categories.sql` - 分类数据
     - `02_tags.sql` - 标签数据
     - `04_users.sql` - 默认用户
     - 其他数据文件根据需要导入

### 方案二：使用命令行工具

如果你有数据库的直连权限：

1. **获取数据库连接字符串**
   - Supabase 控制台 -> Settings -> Database
   - 找到 "Connection string" -> URI 格式
   - 复制连接字符串

2. **执行初始化脚本**

   ```bash
   # 设置环境变量
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   # 执行初始化
   cd database
   ./init.sh "$DATABASE_URL"
   ```

3. **或逐个执行 SQL 文件**

   ```bash
   # 创建表结构
   psql "$DATABASE_URL" -f database/00_schema.sql
   
   # 导入基础数据
   psql "$DATABASE_URL" -f database/01_categories.sql
   psql "$DATABASE_URL" -f database/02_tags.sql
   psql "$DATABASE_URL" -f database/04_users.sql
   
   # 导入其他数据（可选）
   psql "$DATABASE_URL" -f database/03_ai_hall_of_fame.sql
   psql "$DATABASE_URL" -f database/05_ai_tools.sql
   psql "$DATABASE_URL" -f database/06_ai_timeline.sql
   ```

### 方案三：使用 Supabase CLI

如果你本地安装了 Supabase CLI：

1. **链接项目**

   ```bash
   # 登录 Supabase
   supabase login
   
   # 链接到你的项目
   supabase link --project-ref [PROJECT-REF]
   ```

2. **推送数据库变更**

   ```bash
   # 推送本地迁移
   supabase db push
   ```

### 方案四：使用自动化脚本

项目提供了自动化检查脚本：

```bash
# 检查数据库状态
pnpm tsx scripts/sync-database.ts

# 或使用 shell 脚本
bash scripts/sync-database.sh
```

## 环境变量配置

确保在 Coze 平台设置以下环境变量：

### 必需变量

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
```

### 数据库同步变量（可选）

如果需要自动同步数据库，还需要：

```bash
# Service Role Key（用于数据库管理）
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY]

# 数据库连接字符串（用于 psql 命令）
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**注意**：Service Role Key 具有 admin 权限，请妥善保管！

## 获取 Supabase 密钥

1. 打开 Supabase 控制台 -> Settings -> API
2. 在 "Project API keys" 部分找到：
   - `anon` key：公开密钥，用于客户端
   - `service_role` key：管理密钥，用于服务端

## 验证数据库

部署后，访问以下路径验证数据库是否正常：

- `/api/health` - 健康检查
- `/` - 首页是否显示数据

或使用 Supabase 控制台的 Table Editor 查看表数据。

## 常见问题

### 1. 表已存在错误

如果看到 "relation already exists" 错误，说明表已经创建过，可以忽略此错误或使用 `IF NOT EXISTS` 语句。

### 2. 外键约束错误

如果导入数据时出现外键约束错误，请确保按照正确的顺序导入：
1. 先导入 `categories` 和 `tags`
2. 再导入 `users`
3. 最后导入依赖这些表的数据（如 `ai_tools`, `comments`）

### 3. 权限错误

如果使用 Service Role Key 仍然遇到权限问题，请在 Supabase SQL Editor 执行：

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## 数据库表结构

项目包含以下主要表：

| 表名 | 说明 | 必需 |
|------|------|------|
| users | 用户信息 | ✅ |
| categories | 工具分类 | ✅ |
| tags | 工具标签 | ✅ |
| ai_tools | AI 工具列表 | ✅ |
| ai_hall_of_fame | AI 名人堂 | ❌ |
| ai_timeline | AI 大事纪 | ❌ |
| comments | 用户评论 | ❌ |
| favorites | 用户收藏 | ❌ |
| tool_tags | 工具标签关联 | ❌ |

**必需的表**必须创建，否则应用无法正常运行。
