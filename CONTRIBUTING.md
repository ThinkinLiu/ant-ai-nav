# 贡献指南

感谢你考虑为蚂蚁AI导航做出贡献！

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发指南](#开发指南)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

---

## 行为准则

本项目采用贡献者公约作为行为准则。参与此项目即表示你同意遵守其条款。

---

## 如何贡献

### 报告 Bug

如果你发现了 bug，请通过 [GitHub Issues](../../issues) 提交报告，包括：

- 清晰的标题和描述
- 复现步骤
- 预期行为和实际行为
- 截图（如果适用）
- 你的环境信息（浏览器、操作系统等）

### 提出新功能

欢迎提出新功能建议！请在 Issues 中详细描述：

- 功能描述
- 使用场景
- 可能的实现方式

### 提交代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 开发指南

### 环境准备

```bash
# 克隆你的 fork
git clone https://github.com/ThinkinLiu/ant-ai-nav.git
cd ant-ai-nav

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填写实际值

# 启动开发服务器
pnpm dev
```

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS

### 目录结构

```
src/
├── app/           # 页面和 API 路由
├── components/    # React 组件
│   └── ui/        # shadcn/ui 基础组件
├── contexts/      # React Context
├── hooks/         # 自定义 Hooks
├── lib/           # 工具函数
└── storage/       # 数据库相关
```

### 组件开发

使用 shadcn/ui 组件库：

```bash
# 添加新组件
npx shadcn@latest add component-name
```

---

## 提交规范

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 代码重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |
| ci | CI/CD 相关 |

### 示例

```
feat(tools): 添加工具置顶功能

- 添加 is_pinned 字段到数据库
- 管理后台支持置顶操作
- 前端显示置顶标识

Closes #123
```

---

## Pull Request 流程

1. **确保测试通过**
   ```bash
   pnpm ts-check
   pnpm lint
   ```

2. **更新文档**
   - 更新 README.md（如果需要）
   - 更新 CHANGELOG.md

3. **提交 PR**
   - 清晰描述更改内容
   - 关联相关 Issue
   - 等待审核

4. **审核通过后**
   - 会被合并到主分支
   - 你的贡献会被记录

---

## 🙏 感谢

感谢所有贡献者的付出！
