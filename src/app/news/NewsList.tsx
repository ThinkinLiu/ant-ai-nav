'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// 格式化时间，精确到分钟
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期（用于分组）
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

interface CategoryConfig {
  [slug: string]: {
    label: string
    icon: string
    color: string
  }
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
  totalCount: number
  categoryConfig: CategoryConfig
}

export function NewsList({ totalCount, categoryConfig }: Props) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(totalCount)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHotOnly, setShowHotOnly] = useState(false)
  const pageSize = 15
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchNews = useCallback(async (pageNum: number, category: string | null, search: string, hotOnly: boolean) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
      })
      
      if (category) {
        params.append('category', category)
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
          setNews(data.data.data)
        } else {
          setNews(prev => [...prev, ...data.data.data])
        }
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(1, selectedCategory, searchQuery, showHotOnly)
    setPage(1)
  }, [selectedCategory, searchQuery, showHotOnly, fetchNews])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const totalPages = Math.ceil(total / pageSize)
          if (page < totalPages) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchNews(nextPage, selectedCategory, searchQuery, showHotOnly)
          }
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, page, total, selectedCategory, searchQuery, showHotOnly, fetchNews])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
    fetchNews(1, selectedCategory, searchQuery, showHotOnly)
  }

  // 按日期分组
  const groupedNews = news.reduce((acc, item) => {
    const date = formatDate(item.published_at)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, NewsItem[]>)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 sticky top-16 bg-background/95 backdrop-blur py-4 z-10 -mt-4">
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
          {Object.entries(categoryConfig).map(([key, config]) => (
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
        <div className="flex-1 flex gap-2 lg:justify-end">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 lg:flex-initial">
            <input
              type="text"
              placeholder="搜索资讯..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-1.5 border rounded-lg bg-background flex-1 lg:w-48 text-sm"
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

      {/* News List by Date */}
      <div className="space-y-8">
        {Object.entries(groupedNews).map(([date, items]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {date}
              </div>
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">{items.length} 条</span>
            </div>

            {/* News Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const categoryInfo = item.category ? categoryConfig[item.category] : undefined
                
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
                      <div className="w-32 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <span className="text-3xl">
                          {categoryInfo?.icon || '📰'}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {categoryInfo && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {categoryInfo?.icon} {categoryInfo?.label}
                          </span>
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
      {!loading && news.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>没有找到匹配的资讯</p>
        </div>
      )}

      {/* Load More */}
      {!loading && news.length > 0 && page < Math.ceil(total / pageSize) && (
        <div ref={observerRef} className="h-4" />
      )}

      {/* End of List */}
      {!loading && news.length > 0 && page >= Math.ceil(total / pageSize) && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          已加载全部资讯
        </div>
      )}
    </div>
  )
}
