'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { 
  Eye, Heart, ArrowLeft,
  Calendar, Wrench, Newspaper, BookOpen, Loader2,
  ChevronLeft, ChevronRight
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

interface TutorialItem {
  id: number
  title: string
  summary: string
  cover_image: string | null
  category: string | null
  published_at: string
  view_count: number
  tags: string[] | null
}

const PAGE_SIZE = 12

export default function TagPage({ params }: Props) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [tagName, setTagName] = useState('')
  const [tools, setTools] = useState<Tool[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [tutorials, setTutorials] = useState<TutorialItem[]>([])
  const [toolsTotal, setToolsTotal] = useState(0)
  const [newsTotal, setNewsTotal] = useState(0)
  const [tutorialsTotal, setTutorialsTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'tools' | 'news' | 'tutorials'>('tools')
  const [tabLoading, setTabLoading] = useState(false)
  const [toolsPage, setToolsPage] = useState(1)
  const [newsPage, setNewsPage] = useState(1)
  
  const decodedSlug = decodeURIComponent(slug)
  const tabParam = searchParams.get('tab')
  const pageParam = searchParams.get('page')

  // 获取教程数据（"tutorial"分类的资讯）
  const fetchTutorials = useCallback(async (name: string, page: number) => {
    const supabase = getSupabaseClient()
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE - 1
    
    // 获取总数（tutorial分类）
    const { count } = await supabase
      .from('ai_news')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('category', 'tutorial')
      .filter('tags', 'cs', JSON.stringify([name]))
    
    setTutorialsTotal(count || 0)

    // 获取分页数据
    const { data: tutorialsData } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count, tags')
      .eq('status', 'approved')
      .eq('category', 'tutorial')
      .filter('tags', 'cs', JSON.stringify([name]))
      .order('published_at', { ascending: false })
      .range(start, end)
    
    setTutorials(tutorialsData || [])
  }, [])

  // 获取工具数据
  const fetchTools = useCallback(async (tagId: number | null, page: number) => {
    const supabase = getSupabaseClient()
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE - 1
    
    if (!tagId) {
      setTools([])
      setToolsTotal(0)
      return
    }

    // 获取工具ID列表
    const { data: toolTags } = await supabase
      .from('tool_tags')
      .select('tool_id')
      .eq('tag_id', tagId)
    
    if (!toolTags || toolTags.length === 0) {
      setTools([])
      setToolsTotal(0)
      return
    }

    const toolIds = toolTags.map(tt => tt.tool_id)
    
    // 获取总数
    const { count } = await supabase
      .from('ai_tools')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('id', toolIds)
    
    setToolsTotal(count || 0)

    // 获取分页数据
    const { data: toolsResult } = await supabase
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, view_count, favorite_count, is_featured, is_free, created_at, category_id')
      .eq('status', 'approved')
      .in('id', toolIds)
      .range(start, end)
    
    if (toolsResult && toolsResult.length > 0) {
      const categoryIds = [...new Set(toolsResult.map(t => t.category_id).filter(Boolean))]
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, color')
        .in('id', categoryIds)
      
      const categoryMap = new Map((categoriesData || []).map(c => [c.id, c]))
      
      const toolsData = toolsResult.map(tool => ({
        ...tool,
        category: categoryMap.get(tool.category_id) || null
      }))
      setTools(toolsData)
    } else {
      setTools([])
    }
  }, [])

  // 获取资讯数据（排除"tutorial"分类）
  const fetchNews = useCallback(async (name: string, page: number) => {
    const supabase = getSupabaseClient()
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE - 1
    
    // 获取总数（排除tutorial分类）
    const { count } = await supabase
      .from('ai_news')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .neq('category', 'tutorial')
      .filter('tags', 'cs', JSON.stringify([name]))
    
    setNewsTotal(count || 0)

    // 获取分页数据
    const { data: newsData } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count, tags')
      .eq('status', 'approved')
      .neq('category', 'tutorial')
      .filter('tags', 'cs', JSON.stringify([name]))
      .order('published_at', { ascending: false })
      .range(start, end)
    
    setNews(newsData || [])
  }, [])

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const supabase = getSupabaseClient()

        // 获取标签信息
        let { data: tag } = await supabase
          .from('tags')
          .select('*')
          .eq('slug', decodedSlug)
          .single()

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
        const tagId = tag?.id || null
        const tagExists = !!tag

        // 根据 URL 参数设置默认 tab 和页码
        const tabValue = tabParam || 'tools'
        const initialTab = tabValue === 'news' || tabValue === 'tutorials' ? tabValue : 'tools'
        const initialPage = parseInt(pageParam || '1') || 1
        setActiveTab(initialTab)
        
        if (initialTab === 'tools') {
          setToolsPage(initialPage)
        } else if (initialTab === 'news') {
          setNewsPage(initialPage)
        } else if (initialTab === 'tutorials') {
          // 教程页码使用toolsPage，因为教程和工具类似
          setToolsPage(initialPage)
        }

        // 同时获取工具、资讯和教程的统计数据
        await Promise.all([
          fetchTools(tagId, 1),
          fetchNews(name, 1),
          fetchTutorials(name, 1)
        ])

        // 如果既没有标签记录，也没有相关资讯和工具，显示 404
        const hasTools = tagId !== null
        // 检查是否有资讯（通过 count 判断）
        const { count: newsCount } = await supabase
          .from('ai_news')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .filter('tags', 'cs', JSON.stringify([name]))
        
        // 检查是否有教程（tutorial分类的资讯）
        const { count: tutorialCount } = await supabase
          .from('ai_news')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .eq('category', 'tutorial')
          .filter('tags', 'cs', JSON.stringify([name]))
        
        const hasTutorials = (tutorialCount || 0) > 0
        
        if (!tagExists && !hasTools && (!newsCount || newsCount === 0) && !hasTutorials) {
          notFound()
        }

        // 如果工具为空但有资讯，自动切换到资讯 tab
        if (initialTab === 'tools' && !hasTools && newsCount && newsCount > 0) {
          setActiveTab('news')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    init()
  }, [decodedSlug, tabParam, pageParam, fetchTools, fetchNews, fetchTutorials])

  // Tab 切换时加载数据（不更新URL，只刷新下方内容）
  const handleTabChange = async (tab: string) => {
    if (tab === activeTab || (tab !== 'tools' && tab !== 'news' && tab !== 'tutorials')) return

    setActiveTab(tab as 'tools' | 'news' | 'tutorials')

    setActiveTab(tab)
    setTabLoading(true)

    // 加载对应数据
    if (tab === 'tools') {
      // 重新获取工具数据
      const supabase = getSupabaseClient()
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', decodedSlug)
        .single()

      if (!tag) {
        const { data: tagByName } = await supabase
          .from('tags')
          .select('id')
          .eq('name', decodedSlug)
          .single()
        tag = tagByName
      }

      if (tag) {
        await fetchTools(tag.id, 1)
      }
    } else if (tab === 'news') {
      await fetchNews(tagName, 1)
    } else if (tab === 'tutorials') {
      await fetchTutorials(tagName || decodedSlug, 1)
    }

    setTabLoading(false)
  }

  // 分页处理（不更新URL）
  const handlePageChange = async (page: number) => {
    setTabLoading(true)

    const supabase = getSupabaseClient()

    if (activeTab === 'tools') {
      setToolsPage(page)
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', decodedSlug)
        .single()

      if (!tag) {
        const { data: tagByName } = await supabase
          .from('tags')
          .select('id')
          .eq('name', decodedSlug)
          .single()
        tag = tagByName
      }

      if (tag) {
        await fetchTools(tag.id, page)
      }
    } else if (activeTab === 'tutorials') {
      setToolsPage(page)
      await fetchTutorials(tagName || decodedSlug, page)
    } else {
      setNewsPage(page)
      await fetchNews(tagName || decodedSlug, page)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTabLoading(false)
  }

  // 分页组件
  const Pagination = ({ total, currentPage, onPageChange }: { total: number; currentPage: number; onPageChange: (page: number) => void }) => {
    const totalPages = Math.ceil(total / PAGE_SIZE)
    
    if (totalPages <= 1) return null
    
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pages.map((page, index) => (
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 text-muted-foreground">
              {page}
            </span>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
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
            探索与「{tagName}」相关的AI工具、资讯与教程
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>{toolsTotal} 个工具</span>
            <span>{newsTotal} 篇资讯</span>
            <span>{tutorialsTotal} 篇教程</span>
          </div>
        </div>

        {/* Tab Bar */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
            <TabsTrigger
              value="tools"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wrench className="h-4 w-4" />
              相关工具
              <Badge variant="secondary" className="ml-1">
                {toolsTotal}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Newspaper className="h-4 w-4" />
              相关资讯
              <Badge variant="secondary" className="ml-1">
                {newsTotal}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="tutorials"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" />
              相关教程
              <Badge variant="secondary" className="ml-1">
                {tutorialsTotal}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tools Section */}
        {activeTab === 'tools' && (
          tabLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-full" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
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
              <Pagination total={toolsTotal} currentPage={toolsPage} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🛠️</span>
              <h2 className="text-xl font-semibold mb-2">暂无相关工具</h2>
              <p className="text-muted-foreground">
                该标签下暂无工具，切换查看相关资讯或教程
              </p>
            </div>
          )
        )}

        {/* News Section */}
        {activeTab === 'news' && (
          tabLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-3 bg-muted animate-pulse rounded w-16" />
                      <div className="h-3 bg-muted animate-pulse rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <>
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
              <Pagination total={newsTotal} currentPage={newsPage} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📰</span>
              <h2 className="text-xl font-semibold mb-2">暂无相关资讯</h2>
              <p className="text-muted-foreground">
                该标签下暂无资讯，切换查看相关工具或教程
              </p>
            </div>
          )
        )}

        {/* Tutorials Section */}
        {activeTab === 'tutorials' && (
          tabLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 bg-muted animate-pulse rounded w-12" />
                      <div className="h-5 bg-muted animate-pulse rounded w-16" />
                    </div>
                    <div className="h-5 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-3 bg-muted animate-pulse rounded w-16" />
                      <div className="h-3 bg-muted animate-pulse rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tutorials.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorials.map((item) => (
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
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">
                          教程
                        </Badge>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
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
              <Pagination total={tutorialsTotal} currentPage={toolsPage} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <h2 className="text-xl font-semibold mb-2">暂无相关教程</h2>
              <p className="text-muted-foreground">
                该标签下暂无教程，切换查看相关工具或资讯
              </p>
            </div>
          )
        )}

      </div>
    </div>
  )
}
