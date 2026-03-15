# 构建错误修复记录 - 预渲染失败

## 🐛 问题描述

### 错误信息
```
Error occurred prerendering page "/hall-of-fame"
Error: Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.

ENOENT: no such file or directory, open '/opt/bytefaas/.next/prerender-manifest.json'
```

### 问题原因
1. **静态生成尝试访问数据库**: 多个页面在服务端组件中直接访问 Supabase 数据库
2. **构建环境无数据库连接**: 构建时环境变量不存在，导致数据库连接失败
3. **预渲染失败**: 构建中断，未生成完整的 `.next` 目录

## ✅ 解决方案

### 添加动态渲染配置

为所有需要数据库访问的页面添加 `export const dynamic = 'force-dynamic'`，强制使用动态渲染而非静态生成。

### 修复的文件列表

#### 1. 列表页面
- `src/app/hall-of-fame/page.tsx` - AI名人堂列表页
- `src/app/timeline/page.tsx` - AI大事纪列表页
- `src/app/news/page.tsx` - AI资讯列表页
- `src/app/ranking/page.tsx` - 排行榜页面

#### 2. 详情页面
- `src/app/hall-of-fame/[id]/page.tsx` - 名人详情页
- `src/app/timeline/[id]/page.tsx` - 事件详情页
- `src/app/news/[id]/page.tsx` - 新闻详情页

### 修改示例

```typescript
// 修改前
import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export const metadata: Metadata = {
  // ...
}

export default async function Page() {
  const supabase = getSupabaseClient()
  // ...
}

// 修改后
import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  // ...
}

export default async function Page() {
  const supabase = getSupabaseClient()
  // ...
}
```

## 📊 修复效果

### 构建结果
- ✅ TypeScript 编译成功
- ✅ 构建完成，生成 `.next` 目录
- ✅ `prerender-manifest.json` 文件已生成
- ✅ 所有动态路由配置正确

### 构建产物
```bash
.next/
├── BUILD_ID                      # ✅ 已生成
├── prerender-manifest.json       # ✅ 已生成（之前缺失）
├── routes-manifest.json          # ✅ 已生成
├── server/                       # ✅ 服务端代码
├── static/                       # ✅ 静态资源
└── standalone/                   # ✅ 独立部署包
```

## 🎯 Next.js 渲染模式说明

### 静态生成 (Static Generation)
- **默认模式**: Next.js 尝试在构建时预渲染所有页面
- **问题**: 需要数据库访问的页面在构建时失败
- **适用场景**: 内容固定、不需要实时数据的页面

### 动态渲染 (Dynamic Rendering)
- **配置**: `export const dynamic = 'force-dynamic'`
- **优点**: 每次请求时渲染，可以访问数据库
- **适用场景**: 需要实时数据、用户特定内容的页面

### 客户端渲染 (Client-side Rendering)
- **配置**: 组件顶部添加 `'use client'`
- **优点**: 完全在浏览器中渲染
- **适用场景**: 高度交互、需要用户状态的页面

## 🔧 最佳实践

### 1. 环境变量检查
对于详情页的 `generateStaticParams` 函数：
```typescript
export async function generateStaticParams() {
  const supabase = tryGetSupabaseClient()
  if (!supabase) {
    // 构建时环境变量不存在，返回空数组
    return []
  }
  // ...
}
```

### 2. 渲染模式选择
- **静态页面**: 首页、关于页、联系页等固定内容
- **动态页面**: 需要数据库查询的列表和详情页
- **客户端页面**: 需要用户交互的页面

### 3. 性能优化
使用动态渲染时，考虑：
- 添加适当的缓存策略
- 使用 ISR (Incremental Static Regeneration) 在可能的情况下
- 实现数据库查询优化

## 📝 部署检查清单

部署前请确认：

1. ✅ 所有需要数据库的页面已添加 `dynamic = 'force-dynamic'`
2. ✅ 构建成功生成完整的 `.next` 目录
3. ✅ `prerender-manifest.json` 文件存在
4. ✅ 环境变量已在部署平台配置
5. ✅ 数据库连接测试通过

## 🚀 部署后的验证

访问以下页面验证部署成功：
- `/hall-of-fame` - AI名人堂
- `/timeline` - AI大事纪
- `/news` - AI资讯
- `/ranking` - 排行榜

---

**修复时间**: 2025-01-15
**修复状态**: ✅ 已完成
**构建结果**: ✅ 成功
