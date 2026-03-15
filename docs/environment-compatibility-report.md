# 环境兼容性实现说明

## 概述

本次更新实现了 **Coze 环境** 和 **独立服务器环境** 的完整兼容部署方案，解决了在 Coze 环境部署时提示"缺少数据库配置"的问题。

## 主要变更

### 1. 环境配置工具 (`src/lib/env-config.ts`)

创建了统一的环境配置管理工具，提供：

- **环境自动检测**: 自动识别 Coze、独立服务器、开发环境
- **多命名方式支持**: 支持多种环境变量命名方式，按优先级读取
- **配置验证**: 验证必需和可选的环境变量
- **友好的错误提示**: 提供详细的配置指导和修复建议

#### 支持的环境变量命名方式

**Supabase URL（按优先级）:**
1. `NEXT_PUBLIC_SUPABASE_URL` - 标准 Next.js 命名
2. `COZE_SUPABASE_URL` - Coze 环境命名
3. `SUPABASE_URL` - 通用命名

**Supabase Anon Key（按优先级）:**
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 标准命名
2. `COZE_SUPABASE_ANON_KEY` - Coze 环境命名
3. `SUPABASE_ANON_KEY` - 通用命名
4. `SUPABASE_SERVICE_ROLE_KEY` - 服务端命名

### 2. Supabase 客户端更新

更新了三个核心文件，增强环境兼容性：

#### `src/lib/supabase/client.ts`
- 支持多种环境变量命名方式
- 添加详细的错误提示和配置指导
- 优化客户端初始化逻辑

#### `src/lib/supabase/server.ts`
- 使用统一的环境配置工具
- 增强错误处理和提示信息
- 支持动态创建客户端实例

#### `src/lib/supabase/middleware.ts`
- 支持多种环境变量命名方式
- 添加配置缺失的错误提示
- 保持原有的认证保护逻辑

### 3. 环境检查脚本

#### `scripts/check-env.ts`
- 提供命令行环境变量检查工具
- 支持多种输出格式（文本、JSON、详细配置）
- 提供修复建议和文档链接

#### 使用方式
```bash
# 基础检查
pnpm tsx scripts/check-env.ts

# 显示详细配置
pnpm tsx scripts/check-env.ts --config

# JSON 格式输出（适合 CI/CD）
pnpm tsx scripts/check-env.ts --json

# 显示帮助信息
pnpm tsx scripts/check-env.ts --help
```

#### `scripts/test-env-compatibility.ts`
- 测试环境兼容性
- 验证环境变量读取优先级
- 检查配置完整性

### 4. 构建脚本更新

#### `scripts/prepare.sh`
- 构建前自动检查环境配置
- 根据环境类型提供不同的提示
- 在 Coze 环境中自动验证环境变量

#### `scripts/build.sh`
- 支持多环境构建
- 自动设置 Next.js 公共环境变量
- 提供详细的构建日志和错误提示

### 5. 配置模板

创建了三个环境配置模板：

#### `.env.example` - 原有通用模板
- 包含所有配置选项
- 详细的注释说明

#### `.env.example.coze` - Coze 环境专用
- Coze 平台环境变量命名
- 简化的配置说明
- 针对性指导

#### `.env.example.standalone` - 独立服务器专用
- 标准 Next.js 环境变量命名
- 包含所有可选配置
- 生产环境优化建议

### 6. 文档更新

#### `docs/deployment-guide.md` - 完整部署指南
- 详细的部署步骤
- 两种环境的对比说明
- 常见问题解答
- 环境变量完整列表

#### `docs/coze-deployment.md` - Coze 环境专用指南
- Coze 环境特点说明
- 快速部署步骤
- 环境变量配置详解
- 最佳实践建议

#### `README.md` 更新
- 更新环境变量配置说明
- 添加部署环境选择指南
- 链接到详细文档

## 测试结果

### 环境检测测试
```
✅ 环境检测通过
当前环境: coze
```

### 环境变量读取测试
```
Supabase URL: ✅ 已配置
  来源: COZE_SUPABASE_URL
Supabase Key: ✅ 已配置
  来源: COZE_SUPABASE_ANON_KEY
Coze API Key: ✅ 已配置
  来源: COZE_WORKLOAD_IDENTITY_API_KEY
```

### 环境验证测试
```
配置状态: ✅ 有效
```

### 环境变量优先级测试
```
Supabase URL 优先级:
  1. NEXT_PUBLIC_SUPABASE_URL: ❌ 未设置
  2. COZE_SUPABASE_URL: ✅ 已设置
  3. SUPABASE_URL: ❌ 未设置
```

## 使用指南

### Coze 环境部署

1. 在 Coze 平台设置环境变量：
   ```bash
   COZE_SUPABASE_URL=https://your-project.supabase.co
   COZE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. 部署应用，系统会自动：
   - 检测 Coze 环境
   - 读取环境变量
   - 验证配置
   - 启动服务

### 独立服务器部署

1. 创建环境变量文件：
   ```bash
   cp .env.example.standalone .env.local
   ```

2. 编辑 `.env.local` 填写配置

3. 运行环境检查：
   ```bash
   pnpm tsx scripts/check-env.ts
   ```

4. 启动服务：
   ```bash
   pnpm dev  # 开发环境
   # 或
   pnpm build && pnpm start  # 生产环境
   ```

## 技术特点

1. **自动环境检测**: 无需手动指定环境类型
2. **多命名兼容**: 支持多种环境变量命名方式
3. **优先级机制**: 灵活的环境变量读取优先级
4. **友好错误提示**: 详细的配置指导和修复建议
5. **完整文档**: 覆盖两种部署环境的详细指南
6. **测试验证**: 提供环境兼容性测试脚本

## 依赖更新

新增依赖：
- `chalk` - 终端输出美化（开发依赖）
- `@supabase/ssr` - Supabase SSR 支持

## 向后兼容性

所有更改保持向后兼容：
- 原有的 `NEXT_PUBLIC_*` 环境变量继续有效
- 现有部署无需修改配置
- 新增的环境变量命名方式为可选方案

## 后续优化建议

1. 添加环境变量加密存储功能
2. 支持从密钥管理服务读取配置
3. 添加配置热更新功能
4. 提供可视化配置管理界面

---

**更新日期**: 2025-01-17
**版本**: v1.0.0
