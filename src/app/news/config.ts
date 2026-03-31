// 分类配置
export type CategoryKey = 'industry' | 'research' | 'product' | 'policy' | 'tutorial'
export type CategoryConfig = { label: string; icon: string; color: string }

export const categoryConfig: Record<CategoryKey, CategoryConfig> = {
  industry: { label: '行业动态', icon: '📰', color: 'from-blue-500/20 to-cyan-500/20' },
  research: { label: '学术研究', icon: '🔬', color: 'from-purple-500/20 to-pink-500/20' },
  product: { label: '产品发布', icon: '🚀', color: 'from-green-500/20 to-emerald-500/20' },
  policy: { label: '政策法规', icon: '📜', color: 'from-orange-500/20 to-yellow-500/20' },
  tutorial: { label: '教程指南', icon: '📚', color: 'from-amber-500/20 to-orange-500/20' },
}

// 获取分类配置，带类型安全
export function getCategoryConfig(category: string | null | undefined): CategoryConfig | undefined {
  if (!category) return undefined
  return categoryConfig[category as CategoryKey]
}
