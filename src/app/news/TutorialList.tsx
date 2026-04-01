'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Calendar, Loader2, Search } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

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

interface Props {
  hotTutorials: NewsItem[]
}

export function TutorialList({ hotTutorials }: Props) {
  const [tutorials, setTutorials] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 15
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchTutorials = useCallback(async (pageNum: number, search: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        category: 'tutorial',
      })
      
      if (search) {
        params.append('search', search)
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
      console.error('获取教程数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTutorials(1, searchQuery)
    setPage(1)
  }, [searchQuery, fetchTutorials])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const totalPages = Math.ceil(total / pageSize)
          if (page < totalPages) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchTutorials(nextPage, searchQuery)
          }
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, page, total, searchQuery, fetchTutorials])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
    fetchTutorials(1, searchQuery)
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

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索教程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            搜索
          </button>
        </form>
      </div>

      {/* Tutorial List */}
      {loading && tutorials.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {Object.entries(groupedTutorials).map(([date, items]) => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">{date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((tutorial) => (
                  <Link
                    key={tutorial.id}
                    href={`/news/${tutorial.id}`}
                    className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {tutorial.cover_image && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={tutorial.cover_image}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">
                          教程
                        </Badge>
                        {tutorial.tags && tutorial.tags.length > 0 && (
                          tutorial.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        )}
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {tutorial.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatRelativeTime(tutorial.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {tutorial.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && tutorials.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* No more data indicator */}
          {!loading && tutorials.length >= total && total > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              已加载全部教程
            </div>
          )}

          {/* Empty state */}
          {!loading && tutorials.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">暂无教程</h3>
              <p className="text-muted-foreground">
                {searchQuery ? '没有找到相关教程，请尝试其他关键词' : '暂时还没有教程内容'}
              </p>
            </div>
          )}

          {/* Intersection Observer ref */}
          <div ref={observerRef} className="h-10" />
        </>
      )}
    </div>
  )
}
