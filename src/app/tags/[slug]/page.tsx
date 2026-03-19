'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { 
  Eye, Heart, ArrowLeft,
  Calendar, Wrench, Newspaper, Loader2
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  website: string
  logo: string | null
  view_count: number
  favorite_count: number
  is_featured: boolean
  is_free: boolean
  category: { id: number; name: string; color: string } | null
}

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

export default function TagPage({ params }: Props) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tagName, setTagName] = useState('')
  const [tools, setTools] = useState<Tool[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [activeTab, setActiveTab] = useState<'tools' | 'news'>('tools')
  
  const decodedSlug = decodeURIComponent(slug)
  const tabParam = searchParams.get('tab')

  useEffect(() => {
    fetchData()
  }, [decodedSlug])

  const fetchData = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      // 获取标签信息 - 支持通过 slug 或 name 查询
      let { data: tag } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', decodedSlug)
        .single()

      // 如果通过 slug 找不到，尝试通过 name 查询
      if (!tag) {
        const { data: tagByName } = await supabase
          .from('tags')
          .select('*')
          .eq('name', decodedSlug)
          .single()
        tag = tagByName
      }

      const name = tag?.name || decodedSlug
      setTagName(name)
      const tagExists = !!tag

      // 获取该标签下的工具
      let toolsData: Tool[] = []
      if (tagExists && tag) {
        const { data: toolTags } = await supabase
          .from('tool_tags')
          .select('tool_id')
          .eq('tag_id', tag.id)
        
        if (toolTags && toolTags.length > 0) {
          const toolIds = toolTags.map(tt => tt.tool_id)
          const { data: toolsResult } = await supabase
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, view_count, favorite_count, is_featured, is_free, created_at, category_id')
            .eq('status', 'approved')
            .in('id', toolIds)
          
          if (toolsResult && toolsResult.length > 0) {
            const categoryIds = [...new Set(toolsResult.map(t => t.category_id).filter(Boolean))]
            const { data: categoriesData } = await supabase
              .from('categories')
              .select('id, name, color')
              .in('id', categoryIds)
            
            const categoryMap = new Map((categoriesData || []).map(c => [c.id, c]))
            
            toolsData = toolsResult.map(tool => ({
              ...tool,
              category: categoryMap.get(tool.category_id) || null
            }))
          }
        }
      }
      setTools(toolsData)

      // 获取该标签下的资讯 - 多种方式匹配
      let newsData: NewsItem[] = []
      
      // 方式1：精确匹配标签名
      const { data: newsExact } = await supabase
        .from('ai_news')
        .select('id, title, summary, cover_image, category, published_at, view_count, tags')
        .eq('status', 'approved')
        .contains('tags', [name])
        .order('published_at', { ascending: false })
        .limit(20)
      
      if (newsExact && newsExact.length > 0) {
        newsData = newsExact
      } else {
        // 方式2：尝试用 decodedSlug 匹配
        const { data: newsBySlug } = await supabase
          .from('ai_news')
          .select('id, title, summary, cover_image, category, published_at, view_count, tags')
          .eq('status', 'approved')
          .contains('tags', [decodedSlug])
          .order('published_at', { ascending: false })
          .limit(20)
        
        if (newsBySlug && newsBySlug.length > 0) {
          newsData = newsBySlug
        }
      }
      
      setNews(newsData)

      // 如果既没有标签记录，也没有相关资讯和工具，显示 404
      if (!tagExists && toolsData.length === 0 && newsData.length === 0) {
        notFound()
      }

      // 根据 URL 参数设置默认 tab（从资讯页进入时优先选中资讯 tab）
      if (tabParam === 'news') {
        setActiveTab('news')
      } else if (toolsData.length === 0 && newsData.length > 0) {
        setActiveTab('news')
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tag Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏷️</span>
            <h1 className="text-3xl font-bold">{tagName}</h1>
          </div>
          <p className="text-muted-foreground">
            探索与「{tagName}」相关的AI工具和资讯
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>{tools.length} 个工具</span>
            <span>{news.length} 篇资讯</span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('tools')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'tools'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Wrench className="h-4 w-4" />
            相关工具
            <Badge variant="secondary" className="ml-1">
              {tools.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'news'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Newspaper className="h-4 w-4" />
            相关资讯
            <Badge variant="secondary" className="ml-1">
              {news.length}
            </Badge>
          </button>
        </div>

        {/* Tools Section */}
        {activeTab === 'tools' && (
          tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group bg-card border rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <ToolLogoNext
                      logo={tool.logo}
                      name={tool.name}
                      website={tool.website}
                      size={48}
                      className="h-12 w-12 rounded-lg shrink-0"
                      fallbackBgColor={tool.category?.color || '#6366F1'}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {tool.category && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: tool.category.color, color: tool.category.color }}
                      >
                        {tool.category.name}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {tool.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {tool.favorite_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🛠️</span>
              <h2 className="text-xl font-semibold mb-2">暂无相关工具</h2>
              <p className="text-muted-foreground">
                该标签下暂无工具，切换查看相关资讯
              </p>
            </div>
          )
        )}

        {/* News Section */}
        {activeTab === 'news' && (
          news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {item.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeTime(item.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.view_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📰</span>
              <h2 className="text-xl font-semibold mb-2">暂无相关资讯</h2>
              <p className="text-muted-foreground">
                该标签下暂无资讯，切换查看相关工具
              </p>
            </div>
          )
        )}

      </div>
    </div>
  )
}
