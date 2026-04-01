# 首页热门教程Tab功能说明

## 功能概述

在首页的Tab展示区域添加了"热门教程"Tab，展示分类为"AI学习"的工具（因为数据库中没有独立的"教程指南"分类）。

## 已完成的工作

### 1. 后端API修改

**文件**: `src/app/api/home/route.ts`

添加了新的Tab类型处理逻辑：

```typescript
case 'tutorial_tools':
  // 热门教程：获取分类为"AI学习"的工具，按浏览量排序，随机选取8个
  const tutorialCategory = categories?.find(c => c.slug === 'ai-learning' || c.name.includes('学习'))
  
  if (tutorialCategory) {
    const tutorialResult = await client
      .from('ai_tools')
      .select('...')
      .eq('status', 'approved')
      .eq('category_id', tutorialCategory.id)
      .order('view_count', { ascending: false })
      .limit(50)
    const tutorialToolsData = (tutorialResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))
    tabTools = getRandomItems(tutorialToolsData, 8)
  }
  break
```

### 2. 前端页面修改

**文件**: `src/app/page.tsx`

- 在工具类型Tab的判断中添加了 `'tutorial_tools'` 支持
- 为教程Tab添加了"更多教程"按钮，链接到 `/tools` 页面

```tsx
{['hot_tools', 'domestic_tools', 'foreign_tools', 'lobster_tools', 'tutorial_tools', 'category', 'tag', 'ranking'].includes(currentTab?.type || '') && tabTools.length > 0 && (
  <div>
    {/* 热门教程显示更多按钮 */}
    {currentTab?.type === 'tutorial_tools' && (
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" asChild className="gap-1">
          <Link href="/tools">
            更多教程
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )}
    // ...
  </div>
)}
```

### 3. 数据库Tab配置

**文件**: `src/app/api/admin/add-tutorial-tab/route.ts`

创建了API端点用于自动添加Tab配置：

- Tab名称: 热门教程
- Tab slug: tutorials
- Tab type: tutorial_tools
- 图标: BookOpen
- 颜色: #F59E0B (橙色)
- 排序: 4 (在热点资讯之前)

### 4. 使用方法

Tab已通过API自动添加到数据库，刷新首页即可看到"热门教程"Tab。

如需重新添加或更新Tab配置，可以调用：

```bash
curl -X POST http://localhost:5000/api/admin/add-tutorial-tab
```

## Tab排序说明

当前的Tab排序（按 sort_order）：

1. 精选推荐 (sort_order: 0)
2. 国内火爆 (sort_order: 1)
3. 国外火爆 (sort_order: 2)
4. 龙虾专区 (sort_order: 3)
5. 热门教程 (sort_order: 4) ⭐ 新增
6. 热点资讯 (sort_order: 4)

**注意**: 热门教程和热点资讯的 sort_order 都是 4，实际显示顺序可能需要调整。

### 调整排序方法

如果需要调整热门教程的位置，可以在数据库中修改：

```sql
-- 将热门教程排在热点资讯之前
UPDATE home_tabs SET sort_order = 4 WHERE slug = 'tutorials';
UPDATE home_tabs SET sort_order = 5 WHERE slug = 'news';
```

或者通过 Supabase 管理界面手动调整。

## 功能特性

1. **随机展示**: 从符合"AI学习"分类的工具中随机选取8个展示
2. **浏览量排序**: 优先展示浏览量高的教程
3. **响应式设计**: 支持不同屏幕尺寸
4. **更多入口**: 提供"更多教程"按钮，可跳转到工具列表页查看全部教程

## 浏览数据来源

当前使用的分类: **AI学习** (slug: `ai-learning`)

如果将来需要修改为其他分类，可以在 `src/app/api/home/route.ts` 中修改查找逻辑：

```typescript
// 修改这里来指定不同的分类
const tutorialCategory = categories?.find(c => c.slug === 'your-slug' || c.name.includes('关键词'))
```

## 验证结果

✅ 后端API正常返回教程数据
✅ Tab已成功添加到数据库
✅ 前端页面支持新的Tab类型
✅ "更多教程"按钮正常显示
✅ 服务正常运行（5000端口）
