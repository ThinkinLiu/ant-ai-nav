import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { HallOfFameList } from './HallOfFameList'
import { categoryConfig, categoryOrder } from './config'
import { FeaturedAvatar } from './components/Avatar'

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI名人堂 - 蚂蚁AI导航',
  description: '致敬为人工智能发展做出杰出贡献的先驱者、研究者、企业家和工程师。探索AI领域最具影响力的人物故事。',
}

export default async function HallOfFamePage() {
  const supabase = getSupabaseClient()
  
  // 获取统计信息
  const { count: totalCount } = await supabase
    .from('ai_hall_of_fame')
    .select('*', { count: 'exact', head: true })
  
  // 获取各分类数量
  const { data: categoryStats } = await supabase
    .from('ai_hall_of_fame')
    .select('category')
  
  const categoryCounts: Record<string, number> = {}
  categoryStats?.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }
  })
  
  // 获取精选人物（按收录时间正序，最早收录的在前）
  const { data: featuredPeople } = await supabase
    .from('ai_hall_of_fame')
    .select('id, name, name_en, photo, title, summary, category')
    .eq('is_featured', true)
    .order('created_at', { ascending: true })
    .limit(20)
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              AI名人堂
            </h1>
            <p className="text-muted-foreground">
              致敬为人工智能发展做出杰出贡献的先驱者、研究者、企业家和工程师
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {/* 团队 */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">👥</div>
          <div className="text-2xl font-bold">{categoryCounts['team'] || 0}</div>
          <div className="text-sm text-muted-foreground">团队</div>
        </div>
        {/* 先驱者 */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🌟</div>
          <div className="text-2xl font-bold">{categoryCounts['pioneer'] || 0}</div>
          <div className="text-sm text-muted-foreground">先驱者</div>
        </div>
        {/* 研究者 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🔬</div>
          <div className="text-2xl font-bold">{(categoryCounts['research'] || 0) + (categoryCounts['researcher'] || 0)}</div>
          <div className="text-sm text-muted-foreground">研究者</div>
        </div>
        {/* 企业家 */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">💼</div>
          <div className="text-2xl font-bold">{categoryCounts['entrepreneur'] || 0}</div>
          <div className="text-sm text-muted-foreground">企业家</div>
        </div>
        {/* 工程师 */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">⚙️</div>
          <div className="text-2xl font-bold">{(categoryCounts['engineering'] || 0) + (categoryCounts['engineer'] || 0)}</div>
          <div className="text-sm text-muted-foreground">工程师</div>
        </div>
      </div>

      {/* Featured Section - 横向滚动 */}
      {featuredPeople && featuredPeople.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>精选人物</span>
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {featuredPeople.map((person) => (
                <a
                  key={person.id}
                  href={`/hall-of-fame/${person.id}`}
                  className="flex-shrink-0 w-36 group bg-gradient-to-br from-primary/5 to-primary/10 border rounded-xl p-4 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <FeaturedAvatar 
                    src={person.photo} 
                    name={person.name_en || person.name} 
                  />
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                    {person.name}
                  </h3>
                  {person.name_en && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {person.name_en}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {person.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <HallOfFameList totalCount={totalCount || 0} />
    </div>
  )
}
