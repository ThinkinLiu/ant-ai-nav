import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { NewsList } from './NewsList'
import { categoryConfig, getCategoryConfig } from './config'

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

// 格式化时间，精确到分钟
function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const metadata: Metadata = {
  title: 'AI资讯 - 蚂蚁AI导航',
  description: '最新AI行业资讯，涵盖产品发布、行业动态、学术研究、政策法规等领域，每日更新。',
}

export default async function NewsPage() {
  const supabase = getSupabaseClient()
  
  // 获取统计信息
  const { count: totalCount } = await supabase
    .from('ai_news')
    .select('*', { count: 'exact', head: true })
  
  // 获取各分类数量
  const { data: categoryStats } = await supabase
    .from('ai_news')
    .select('category')
  
  const categoryCounts: Record<string, number> = {}
  categoryStats?.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }
  })
  
  // 获取热门资讯
  const { data: hotNews } = await supabase
    .from('ai_news')
    .select('id, title, summary, cover_image, category, published_at, view_count')
    .eq('is_hot', true)
    .order('published_at', { ascending: false })
    .limit(5)
  
  // 获取精选资讯
  const { data: featuredNews } = await supabase
    .from('ai_news')
    .select('id, title, summary, cover_image, category, published_at, view_count')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(4)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">📰</span>
              AI资讯
            </h1>
            <p className="text-muted-foreground">
              最新AI行业动态，每日更新
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            共 <span className="text-primary font-medium">{totalCount || 0}</span> 条资讯
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

      {/* Featured News */}
      {featuredNews && featuredNews.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>精选资讯</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredNews.map((news, index) => (
              <a
                key={news.id}
                href={`/news/${news.id}`}
                className="group bg-gradient-to-br from-primary/5 to-primary/10 border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                {news.cover_image ? (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={news.cover_image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <span className="text-4xl">
                      {getCategoryConfig(news.category)?.icon || '📰'}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {getCategoryConfig(news.category)?.label || '资讯'}
                    </span>
                    <span>{formatDateTime(news.published_at)}</span>
                  </div>
                  <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {news.summary}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hot News Sidebar + Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main List */}
        <div className="lg:col-span-3">
          <NewsList totalCount={totalCount || 0} />
        </div>

        {/* Hot News Sidebar */}
        {hotNews && hotNews.length > 0 && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔥</span>
                <span>热门资讯</span>
              </h3>
              <div className="space-y-4">
                {hotNews.map((news, index) => (
                  <a
                    key={news.id}
                    href={`/news/${news.id}`}
                    className="group flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatDateTime(news.published_at)}</span>
                        <span>·</span>
                        <span>{news.view_count || 0} 阅读</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
