import { Metadata } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { NewsList } from './NewsList'
import { TutorialList } from './TutorialList'
import { getCategoriesConfig } from './config'
import React from 'react'

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

interface PageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const isTutorialPage = params.category === 'tutorial'
  const isBlogPage = params.category === 'blog'
  const supabase = getSupabaseClient()

  // 教程页面逻辑
  if (isTutorialPage) {
    // 获取教程总数（使用 LIKE 查询匹配 JSON 数组中的分类）
    const { count: tutorialCount } = await supabase
      .from('ai_news')
      .select('*', { count: 'exact', head: true })
      .like('category', '%tutorial%')
      .eq('status', 'approved')

    // 获取热门教程（浏览量最高的5个）
    const { data: hotTutorials } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count, tags')
      .eq('status', 'approved')
      .like('category', '%tutorial%')
      .order('view_count', { ascending: false })
      .limit(5)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📚</span>
                AI教程
              </h1>
              <p className="text-muted-foreground">
                AI学习教程和使用指南，帮助你快速上手各种AI工具
              </p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              共 <span className="text-primary font-medium">{tutorialCount || 0}</span> 个教程
            </div>
          </div>
        </div>

        {/* Hot Tutorials Sidebar + Main List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main List */}
          <div className="lg:col-span-3">
            <TutorialList hotTutorials={hotTutorials || []} />
          </div>

          {/* Hot Tutorials Sidebar */}
          {hotTutorials && hotTutorials.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>🔥</span>
                  <span>热门教程</span>
                </h3>
                <div className="space-y-4">
                  {hotTutorials.map((tutorial, index) => (
                    <a
                      key={tutorial.id}
                      href={`/news/${tutorial.id}`}
                      className="group flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-500 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatDateTime(tutorial.published_at)}</span>
                          <span>·</span>
                          <span>{tutorial.view_count || 0} 阅读</span>
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

  // 博客日志页面逻辑（使用与教程相同的样式）
  if (isBlogPage) {
    // 获取博客总数
    const { count: blogCount } = await supabase
      .from('ai_news')
      .select('*', { count: 'exact', head: true })
      .like('category', '%blog%')
      .eq('status', 'approved')

    // 获取热门博客（浏览量最高的5个）
    const { data: hotBlogs } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count, tags')
      .eq('status', 'approved')
      .like('category', '%blog%')
      .order('view_count', { ascending: false })
      .limit(5)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📝</span>
                蚂蚁AI之家
              </h1>
              <p className="text-muted-foreground">
                探索AI技术的无限可能，掌握前沿AI工具的使用技巧
              </p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              共 <span className="text-primary font-medium">{blogCount || 0}</span> 篇博客
            </div>
          </div>
        </div>

        {/* Hot Blogs Sidebar + Main List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main List */}
          <div className="lg:col-span-3">
            <TutorialList hotTutorials={hotBlogs || []} category="blog" />
          </div>

          {/* Hot Blogs Sidebar */}
          {hotBlogs && hotBlogs.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>🔥</span>
                  <span>热门博客</span>
                </h3>
                <div className="space-y-4">
                  {hotBlogs.map((blog, index) => (
                    <a
                      key={blog.id}
                      href={`/news/${blog.id}`}
                      className="group flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-500 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatDateTime(blog.published_at)}</span>
                          <span>·</span>
                          <span>{blog.view_count || 0} 阅读</span>
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

  // 普通资讯页面逻辑
  
  // 获取统计信息
  const { count: totalCount } = await supabase
    .from('ai_news')
    .select('*', { count: 'exact', head: true })
  
  // 获取默认分类（is_default=true）
  const { data: defaultCategories } = await supabase
    .from('news_categories')
    .select('*')
    .eq('is_default', true)
    .order('sort_order', { ascending: true })
  
  // 转换为配置格式
  const categoryConfigFromDB: Record<string, { label: string; icon: string; color: string }> = {}
  defaultCategories?.forEach(cat => {
    categoryConfigFromDB[cat.slug] = {
      label: cat.name,
      icon: cat.icon || '📰',
      color: cat.color ? `from-${cat.color.replace('#', '')}500/20 to-${cat.color.replace('#', '')}500/20` : 'from-blue-500/20 to-cyan-500/20'
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
    .limit(8)

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

      {/* Featured News */}
      {featuredNews && featuredNews.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>精选资讯</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredNews.map((news, index) => {
              const categories = getCategoriesConfig(news.category)
              return (
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
                        {categories[0]?.icon || '📰'}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground mb-2">
                      {categories.length > 0 && (
                        categories.map((cat) => (
                          <span key={cat.label} className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {cat.icon} {cat.label}
                          </span>
                        ))
                      )}
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
              )
            })}
          </div>
        </div>
      )}

      {/* Hot News Sidebar + Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main List */}
        <div className="lg:col-span-3">
          <NewsList totalCount={totalCount || 0} categoryConfig={categoryConfigFromDB} />
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
