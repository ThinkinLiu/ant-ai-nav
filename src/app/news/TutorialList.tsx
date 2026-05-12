'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getBannerById } from '@/lib/banners'

// 格式化时间，精确到分钟
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  // 使用固定格式避免 hydration 错误
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化日期（用于分组）
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  // 使用固定格式避免 hydration 错误
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

// 教程分类配置
const TUTORIAL_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  'ai-tool': { label: 'AI工具', icon: '🛠️', color: '#3B82F6' },
  'ai-tutorial': { label: 'AI教程', icon: '📚', color: '#10B981' },
  'ai-news': { label: 'AI资讯', icon: '📰', color: '#F59E0B' },
  'ai-research': { label: 'AI研究', icon: '🔬', color: '#8B5CF6' },
  'prompt': { label: 'Prompt', icon: '✨', color: '#EC4899' },
  'midjourney': { label: 'Midjourney', icon: '🎨', color: '#06B6D4' },
  'chatgpt': { label: 'ChatGPT', icon: '💬', color: '#22C55E' },
  'stable-diffusion': { label: 'SD', icon: '🖼️', color: '#EF4444' },
}

interface NewsItem {
  id: number
  title: string
  title_en: string | null
  summary: string
  source: string | null
  source_url: string | null
  category: string | null
  tags: string[] | null
  cover_image: string | null
  is_featured: boolean
  is_hot: boolean
  view_count: number
  like_count: number
  published_at: string
}

interface Props {
  hotTutorials: NewsItem[]
  category?: 'tutorial' | 'blog'
}

export function TutorialList({ hotTutorials, category = 'tutorial' }: Props) {
  const searchParams = useSearchParams()
  const [tutorials, setTutorials] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHotOnly, setShowHotOnly] = useState(false)
  const pageSize = 15
  const observerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化时读取 URL 参数
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const hotParam = searchParams.get('hot') === 'true'

    // 设置初始状态
    setSelectedCategory(categoryParam || null)
    setSearchQuery(searchParam || '')
    setShowHotOnly(hotParam)
    setIsInitialized(true)
  }, []) // 只在组件挂载时执行一次

  const fetchTutorials = useCallback(async (pageNum: number, cat: string | null, search: string, hotOnly: boolean) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        category: category,
        status: 'approved',
      })
      
      if (cat) {
        params.append('category_slug', cat)
      }
      if (search) {
        params.append('search', search)
      }
      if (hotOnly) {
        params.append('hot', 'true')
      }

      const res = await fetch(`/api/news?${params}`)
      const data = await res.json()

      if (data.success) {
        if (pageNum === 1) {
          setTutorials(data.data.data)
        } else {
          setTutorials(prev => [...prev, ...data.data.data])
        }
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [pageSize, category])

  // 当状态变化时获取数据
  useEffect(() => {
    if (isInitialized) {
      fetchTutorials(1, selectedCategory, searchQuery, showHotOnly)
      setPage(1)
    }
  }, [selectedCategory, searchQuery, showHotOnly, fetchTutorials, isInitialized])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const totalPages = Math.ceil(total / pageSize)
          if (page < totalPages) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchTutorials(nextPage, selectedCategory, searchQuery, showHotOnly)
          }
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, page, total, selectedCategory, searchQuery, showHotOnly, fetchTutorials])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
    fetchTutorials(1, selectedCategory, searchQuery, showHotOnly)
  }

  // 按日期分组
  const groupedTutorials = tutorials.reduce((acc, item) => {
    const date = formatDate(item.published_at)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, NewsItem[]>)

  // 解析分类
  const parseCategory = (categoryStr: string | null): { label: string; icon: string; color: string }[] => {
    if (!categoryStr) return []
    try {
      const parsed = JSON.parse(categoryStr)
      const categories = Array.isArray(parsed) ? parsed : [parsed]
      return categories
        .map(cat => TUTORIAL_CATEGORIES[cat] || { label: cat, icon: '📄', color: '#9CA3AF' })
        .filter(Boolean)
    } catch {
      const config = TUTORIAL_CATEGORIES[categoryStr]
      return config ? [config] : [{ label: categoryStr, icon: '📄', color: '#9CA3AF' }]
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6 sticky top-16 bg-background/95 backdrop-blur py-4 z-10 -mt-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            全部
          </button>
          {Object.entries(TUTORIAL_CATEGORIES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex justify-end gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder={category === 'blog' ? '搜索博客...' : '搜索教程...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-1.5 border rounded-lg bg-background w-48 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              搜索
            </button>
          </form>

          <button
            onClick={() => setShowHotOnly(!showHotOnly)}
            className={`px-3 py-1.5 border rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              showHotOnly
                ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                : 'bg-background hover:bg-muted'
            }`}
          >
            <span>🔥</span>
            <span className="hidden sm:inline">热门</span>
          </button>
        </div>
      </div>

      {/* Tutorial List by Date */}
      <div className="space-y-8">
        {Object.entries(groupedTutorials).map(([date, items]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {date}
              </div>
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">{items.length} 条</span>
            </div>

            {/* Tutorial Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const categories = parseCategory(item.category)
                const firstCategory = categories[0]

                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="group flex gap-4 bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Cover Image */}
                    {item.cover_image ? (
                      <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={getBannerById(item.id)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {categories.length > 0 && (
                          categories.map((cat) => (
                            <span key={cat.label} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {cat.icon} {cat.label}
                            </span>
                          ))
                        )}
                        {item.is_hot && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded">
                            🔥 热门
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          🕐 {formatDateTime(item.published_at)}
                        </span>
                        {item.source && (
                          <span className="text-xs text-muted-foreground">
                            · {item.source}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span>👁️</span>
                          {item.view_count || 0}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="bg-muted px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tutorials.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>没有找到匹配的{category === 'blog' ? '博客' : '教程'}</p>
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={observerRef} className="h-10" />

      {/* Total Count */}
      {!loading && tutorials.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          共 {total} 条{category === 'blog' ? '博客' : '教程'}
        </div>
      )}
    </div>
  )
}
