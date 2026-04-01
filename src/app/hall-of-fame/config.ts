// 分类配置
export type CategoryKey = 'pioneer' | 'research' | 'researcher' | 'entrepreneur' | 'engineering' | 'engineer' | 'vision' | 'nlp' | 'robotics' | 'education' | 'team'
export type CategoryConfig = { label: string; icon: string; color: string }

export const categoryConfig: Record<CategoryKey, CategoryConfig> = {
  team: { label: '团队', icon: '👥', color: 'from-indigo-500/20 to-violet-500/20' },
  pioneer: { label: '先驱者', icon: '🌟', color: 'from-yellow-500/20 to-orange-500/20' },
  research: { label: '研究者', icon: '🔬', color: 'from-blue-500/20 to-cyan-500/20' },
  researcher: { label: '学者', icon: '🎓', color: 'from-blue-400/20 to-sky-500/20' },
  entrepreneur: { label: '企业家', icon: '💼', color: 'from-green-500/20 to-emerald-500/20' },
  engineering: { label: '工程师', icon: '⚙️', color: 'from-purple-500/20 to-pink-500/20' },
  engineer: { label: '开发者', icon: '💻', color: 'from-purple-400/20 to-fuchsia-500/20' },
  vision: { label: '视觉专家', icon: '👁️', color: 'from-rose-500/20 to-red-500/20' },
  nlp: { label: 'NLP专家', icon: '💬', color: 'from-teal-500/20 to-cyan-500/20' },
  robotics: { label: '机器人', icon: '🤖', color: 'from-amber-500/20 to-yellow-500/20' },
  education: { label: '教育家', icon: '📚', color: 'from-lime-500/20 to-green-500/20' },
}

// 获取分类配置，带类型安全
export function getCategoryConfig(category: string | null | undefined): CategoryConfig | undefined {
  if (!category) return undefined
  return categoryConfig[category as CategoryKey]
}

// 分类排序顺序（用于显示）
export const categoryOrder: CategoryKey[] = [
  'team',
  'pioneer', 
  'research',
  'researcher',
  'entrepreneur',
  'engineering',
  'engineer',
  'vision',
  'nlp',
  'robotics',
  'education'
]
