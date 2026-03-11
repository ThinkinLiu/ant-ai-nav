import { Metadata } from 'next'
import { RankingList } from './RankingList'

export const metadata: Metadata = {
  title: 'AI工具排行榜 - 蚂蚁AI导航',
  description: '查看最热门的AI工具排行榜，了解各类AI工具的流量和受欢迎程度。每日更新。',
}

export default function RankingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI工具排行榜</h1>
            <p className="text-muted-foreground">
              实时追踪全球热门AI工具流量数据，每日更新
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            <span className="text-primary font-medium">月度排行</span>
            {' · '}
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">总收录工具</div>
          <div className="text-2xl font-bold text-primary">2000+</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">本月更新</div>
          <div className="text-2xl font-bold text-green-600">500+</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">热门分类</div>
          <div className="text-2xl font-bold text-orange-600">8</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">数据更新</div>
          <div className="text-2xl font-bold text-purple-600">每日</div>
        </div>
      </div>

      {/* Main Content */}
      <RankingList />
    </div>
  )
}
