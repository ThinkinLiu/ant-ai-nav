# 数据库脚本说明

## 文件结构

```
database/
├── 00_schema.sql      # 数据库结构定义（DDL）
├── 01_categories.sql  # 分类数据
├── 02_tags.sql        # 标签数据
├── 03_auth_users.sql  # 认证用户（auth.users）
├── 04_users.sql       # 业务用户（public.users）
├── 05_ai_tools.sql    # AI工具数据
├── 06_tool_tags.sql   # 工具标签关联
└── init.sql           # 统一初始化入口
```

## 执行顺序

```
┌─────────────────────────────────────────────────────────────┐
│  00_schema.sql                                              │
│  ↓ 创建所有表结构、索引、触发器                              │
├─────────────────────────────────────────────────────────────┤
│  01_categories.sql  →  02_tags.sql                          │
│  ↓ 分类数据           ↓ 标签数据                             │
├─────────────────────────────────────────────────────────────┤
│  03_auth_users.sql  →  04_users.sql                         │
│  ↓ 认证用户(密码)     ↓ 业务用户信息                          │
├─────────────────────────────────────────────────────────────┤
│  05_ai_tools.sql                                            │
│  ↓ AI工具数据（依赖分类和用户）                              │
├─────────────────────────────────────────────────────────────┤
│  06_tool_tags.sql                                           │
│  ↓ 工具标签关联                                              │
└─────────────────────────────────────────────────────────────┘
```

## 使用方法

### 方式1: Supabase SQL Editor
在 Supabase Dashboard 的 SQL Editor 中，按顺序逐个执行脚本。

### 方式2: psql 命令行
```bash
psql -h <host> -U <user> -d <database> -f init.sql
```

### 方式3: 单独执行
```bash
# 按顺序执行
psql -f 00_schema.sql
psql -f 01_categories.sql
psql -f 02_tags.sql
psql -f 03_auth_users.sql
psql -f 04_users.sql
psql -f 05_ai_tools.sql
psql -f 06_tool_tags.sql
```

## 表结构说明

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 业务用户表 | id, email, name, role |
| `auth.users` | Supabase认证表 | encrypted_password |
| `categories` | 分类表 | id, name, slug |
| `tags` | 标签表 | id, name, slug |
| `ai_tools` | AI工具表 | id, name, slug, category_id, publisher_id |
| `tool_tags` | 工具标签关联 | tool_id, tag_id |
| `comments` | 评论表 | tool_id, user_id, content |
| `favorites` | 收藏表 | tool_id, user_id |

## 默认账户

| 邮箱 | 角色 | 密码 |
|------|------|------|
| admin@antai.com | admin | Admin@123 |
| thinkin.liu@gmail.com | publisher | Admin@123 |

**⚠️ 请在生产环境中修改默认密码！**

## 注意事项

1. **执行顺序很重要**：必须按照编号顺序执行，否则会因为依赖关系报错
2. **TRUNCATE 警告**：数据脚本包含 `TRUNCATE` 语句，会清空现有数据
3. **auth.users**：Supabase Auth 内置表，由 Supabase 管理
4. **密码存储**：使用 bcrypt 加密，存储在 `auth.users.encrypted_password`
