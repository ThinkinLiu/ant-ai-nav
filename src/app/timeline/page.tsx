import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { TimelineList } from './TimelineList'
import { categoryConfig } from './config'

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI大事纪 - 蚂蚁AI导航',
  description: '探索人工智能发展历程中的重要里程碑事件，从图灵测试到ChatGPT，见证AI的演进与突破。',
}

export default async function TimelinePage() {
  const supabase = getSupabaseClient()
  
  // 获取统计信息
  const { count: totalCount } = await supabase
    .from('ai_timeline')
    .select('*', { count: 'exact', head: true })
  
  // 获取各分类数量
  const { data: categoryStats } = await supabase
    .from('ai_timeline')
    .select('category')
  
  const categoryCounts: Record<string, number> = {}
  categoryStats?.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }
  })
  
  // 获取年份范围
  const { data: yearRange } = await supabase
    .from('ai_timeline')
    .select('year')
    .order('year', { ascending: true })
    .limit(1)
  
  const { data: latestYear } = await supabase
    .from('ai_timeline')
    .select('year')
    .order('year', { ascending: false })
    .limit(1)

  // 获取里程碑事件
  const { data: landmarkEvents } = await supabase
    .from('ai_timeline')
    .select('id, year, month, day, title, title_en, description, icon, category')
    .eq('importance', 'landmark')
    .order('year', { ascending: false })
    .limit(8)
  
  // 获取年代分布
  const { data: allYears } = await supabase
    .from('ai_timeline')
    .select('year')
  
  const decades: Record<string, number> = {}
  allYears?.forEach(item => {
    const decade = Math.floor(item.year / 10) * 10
    const key = `${decade}s`
    decades[key] = (decades[key] || 0) + 1
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">📜</span>
              AI大事纪
            </h1>
            <p className="text-muted-foreground">
              从{yearRange?.[0]?.year || 1950}年至今，见证人工智能的发展历程
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            <span className="text-primary font-medium">{totalCount || 0}</span> 个重要事件
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <div 
            key={key}
            className={`bg-gradient-to-br ${config.color} border rounded-xl p-4 text-center`}
          >
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className="text-xl font-bold">{categoryCounts[key] || 0}</div>
            <div className="text-xs text-muted-foreground">{config.label}</div>
          </div>
        ))}
      </div>

      {/* Landmark Events */}
      {landmarkEvents && landmarkEvents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>里程碑事件</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {landmarkEvents.map((event) => (
              <a
                key={event.id}
                href={`/timeline/${event.id}`}
                className="group bg-gradient-to-br from-yellow-500/5 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 hover:shadow-lg hover:border-yellow-500/40 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{event.icon || '💡'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {event.year}{event.month ? `.${event.month}` : ''}
                    </div>
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mt-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Decades Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(decades)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([decade, count]) => (
              <a
                key={decade}
                href={`#${decade}`}
                className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {decade} ({count})
              </a>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <TimelineList totalCount={totalCount || 0} />
    </div>
  )
}
