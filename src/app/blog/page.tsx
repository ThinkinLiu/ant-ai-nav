import { getSupabaseClient } from '@/storage/database/supabase-client'

interface NewsItem {
  id: number
  title: string
  summary: string
  cover_image: string | null
  category: string | null
  published_at: string
  view_count: number
  tags: string[] | null
}

// 获取教程指南数据
async function getTutorials() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('ai_news')
      .select('*')
      .like('category', '%tutorial%')
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('获取教程数据失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取教程数据失败:', error)
    return []
  }
}

// 获取热门教程（按浏览量排序）
async function getHotTutorials() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('ai_news')
      .select('*')
      .like('category', '%tutorial%')
      .eq('status', 'approved')
      .order('view_count', { ascending: false })
      .limit(6)

    if (error) {
      console.error('获取热门教程失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取热门教程失败:', error)
    return []
  }
}

// 格式化相对时间
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}周前`
  } else {
    const months = Math.floor(diffDays / 30)
    return `${months}个月前`
  }
}

export default async function BlogPage() {
  const tutorials = await getTutorials()
  const hotTutorials = await getHotTutorials()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              蚂蚁AI之家
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              探索AI技术的无限可能，掌握前沿AI工具的使用技巧
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold text-white">{tutorials.length}</div>
                <div className="text-sm text-white/80">精选教程</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold text-white">{hotTutorials.reduce((sum, t) => sum + (t.view_count || 0), 0)}</div>
                <div className="text-sm text-white/80">总浏览量</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-2xl">📚</span>
                最新教程
              </h2>
            </div>
            
            {tutorials.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">暂无教程内容</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tutorials.map((tutorial) => (
                  <article
                    key={tutorial.id}
                    className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="md:flex">
                      {tutorial.cover_image && (
                        <div className="md:w-1/3">
                          <img
                            src={tutorial.cover_image}
                            alt={tutorial.title}
                            className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className={`p-6 ${tutorial.cover_image ? 'md:w-2/3' : ''}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            教程指南
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(tutorial.published_at)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          <a href={`/news/${tutorial.id}`}>
                            {tutorial.title}
                          </a>
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {tutorial.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              👁️ {tutorial.view_count || 0}
                            </span>
                          </div>
                          <a
                            href={`/news/${tutorial.id}`}
                            className="text-primary hover:text-primary/80 font-medium text-sm"
                          >
                            阅读更多 →
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-8">
            {/* 热门教程 */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔥</span>
                热门教程
              </h3>
              {hotTutorials.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无热门教程</p>
              ) : (
                <div className="space-y-4">
                  {hotTutorials.map((tutorial, index) => (
                    <a
                      key={tutorial.id}
                      href={`/news/${tutorial.id}`}
                      className="flex gap-3 group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          👁️ {tutorial.view_count || 0} 阅读
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* 分类标签 */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏷️</span>
                热门标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {['ChatGPT', 'Midjourney', 'AI绘画', 'AI写作', 'AI工具', 'Prompt', 'AI教程'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 关于 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>ℹ️</span>
                关于蚂蚁AI之家
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                蚂蚁AI之家专注于分享实用AI工具教程和最佳实践，帮助你快速掌握AI技术，提升工作效率。我们提供详细的操作指南、实用技巧和案例分析，让每个人都能轻松使用AI工具。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
