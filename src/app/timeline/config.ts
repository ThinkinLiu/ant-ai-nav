// 分类配置
export const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  breakthrough: { label: '技术突破', icon: '💡', color: 'from-yellow-500/20 to-orange-500/20' },
  product: { label: '产品发布', icon: '🚀', color: 'from-blue-500/20 to-cyan-500/20' },
  research: { label: '学术研究', icon: '🔬', color: 'from-green-500/20 to-emerald-500/20' },
  organization: { label: '组织事件', icon: '🏢', color: 'from-purple-500/20 to-pink-500/20' },
  other: { label: '其他', icon: '📌', color: 'from-gray-500/20 to-slate-500/20' },
}

// 重要性配置
export const importanceConfig: Record<string, { label: string; color: string; border: string }> = {
  landmark: { label: '里程碑', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', border: 'border-yellow-500' },
  important: { label: '重要事件', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', border: 'border-blue-500' },
  normal: { label: '普通事件', color: 'bg-gray-400', border: 'border-gray-400' },
}
