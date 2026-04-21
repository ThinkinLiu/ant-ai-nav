'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink, Eye, Clock, Newspaper,
  ArrowRight, Shuffle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

interface RelatedNews {
  id: number
  title: string
  slug: string
  summary: string
  cover_image: string | null
  view_count: number
  published_at: string
  category: string[]
  is_hot: boolean
  is_featured: boolean
}

interface RelatedNewsProps {
  toolId: number
  toolName: string
  toolTags: { id: number; name: string; slug: string }[]
  variant?: 'default' | 'compact'
  maxItems?: number
}

export default function RelatedNews({ 
  toolId, 
  toolName, 
  toolTags,
  variant = 'default',
  maxItems = 3 
}: RelatedNewsProps) {
  const [news, setNews] = useState<RelatedNews[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRelatedNews = async () => {
    setLoading(true)
    try {
      // 构建搜索关键词：使用工具名称和标签
      const keywords = [toolName, ...toolTags.map(t => t.name)].filter(Boolean)
      const searchTerm = keywords.slice(0, 3).join(' ')
      
      const response = await fetch(`/api/news?search=${encodeURIComponent(searchTerm)}&limit=${maxItems}`)
      const data = await response.json()
      
      if (data.success) {
        // 过滤掉当前工具关联的资讯，并限制数量
        const filteredNews = data.data.data
          .filter((item: RelatedNews) => item.id !== toolId)
          .slice(0, maxItems)
        setNews(filteredNews)
      }
    } catch (error) {
      console.error('获取相关资讯失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (toolId) {
      fetchRelatedNews()
    }
  }, [toolId, toolName, toolTags])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={`flex items-center gap-2 ${variant === 'compact' ? 'text-base' : ''}`}>
            <Newspaper className="h-5 w-5 text-primary" />
            相关资讯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (news.length === 0) {
    return null
  }

  // 紧凑布局 - 用于侧边栏
  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-4 w-4 text-primary" />
              相关资讯
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchRelatedNews}
              className="text-muted-foreground hover:text-foreground h-7"
            >
              <Shuffle className="h-3 w-3 mr-1" />
              换一批
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="group block p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* 封面图 */}
              {item.cover_image && (
                <div className="relative w-full h-20 mb-2 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={item.cover_image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* 标签 */}
                  <div className="absolute top-1 left-1 flex gap-1">
                    {item.is_hot && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 h-4">
                        热门
                      </Badge>
                    )}
                    {item.is_featured && !item.is_hot && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 h-4">
                        推荐
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {item.view_count}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(item.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    )
  }

  // 默认宽松布局 - 用于主内容区
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            相关资讯
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRelatedNews}
            className="text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="h-4 w-4 mr-1" />
            换一批
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50"
            >
              {/* 封面图 */}
              <div className="relative aspect-video w-full bg-muted">
                {item.cover_image ? (
                  <Image
                    src={item.cover_image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {/* 标签 */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.is_hot && (
                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 h-4">
                      热门
                    </Badge>
                  )}
                  {item.is_featured && !item.is_hot && (
                    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 h-4">
                      推荐
                    </Badge>
                  )}
                </div>
              </div>

              {/* 内容 */}
              <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {item.summary || '暂无摘要'}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {item.view_count}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.published_at)}
                  </span>
                </div>
              </div>

              {/* Hover 效果 */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* 查看更多 */}
        <div className="mt-4 pt-4 border-t text-center">
          <Link 
            href="/news"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            查看更多资讯
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
