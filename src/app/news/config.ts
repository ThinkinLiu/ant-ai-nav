// 分类配置
export type CategoryKey = 'industry' | 'research' | 'product' | 'policy' | 'tutorial' | 'blog'
export type CategoryConfig = { label: string; icon: string; color: string }

export const categoryConfig: Record<CategoryKey, CategoryConfig> = {
  industry: { label: '行业动态', icon: '📰', color: 'from-blue-500/20 to-cyan-500/20' },
  research: { label: '学术研究', icon: '🔬', color: 'from-purple-500/20 to-pink-500/20' },
  product: { label: '产品发布', icon: '🚀', color: 'from-green-500/20 to-emerald-500/20' },
  policy: { label: '政策法规', icon: '📜', color: 'from-orange-500/20 to-yellow-500/20' },
  tutorial: { label: '教程指南', icon: '📚', color: 'from-amber-500/20 to-orange-500/20' },
  blog: { label: '博客日志', icon: '📝', color: 'from-pink-500/20 to-rose-500/20' },
}

// 解析分类字段（支持 JSON 数组和单个字符串）
export function parseCategory(category: string | null | undefined): string[] {
  if (!category) return []

  try {
    const parsed = JSON.parse(category)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return [parsed]
  } catch {
    return [category]
  }
}

// 获取单个分类配置
export function getCategoryConfig(category: string | null | undefined): CategoryConfig | undefined {
  if (!category) return undefined
  return categoryConfig[category as CategoryKey]
}

// 获取多个分类配置
export function getCategoriesConfig(category: string | null | undefined): CategoryConfig[] {
  const categoryList = parseCategory(category)
  return categoryList
    .map(cat => getCategoryConfig(cat))
    .filter((cat): cat is CategoryConfig => cat !== undefined && cat.label !== '博客日志')
}
