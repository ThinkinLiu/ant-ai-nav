'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { categoryConfig, getCategoryConfig } from '../config'
import { Edit } from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  title_en: string | null
  summary: string
  content: string | null
  source: string | null
  source_url: string | null
  author: string | null
  author_id: number | null
  category: string | null
  tags: string[] | null
  cover_image: string | null
  is_featured: boolean
  is_hot: boolean
  view_count: number
  like_count: number
  published_at: string
}

interface RelatedNews {
  id: number
  title: string
  summary: string
  cover_image: string | null
  category: string | null
  published_at: string
  view_count: number
}

interface NavNews {
  id: number
  title: string
}

interface Props {
  news: NewsItem
  relatedNews: RelatedNews[]
  prevNews: NavNews | null
  nextNews: NavNews | null
}

export function NewsDetail({ news, relatedNews, prevNews, nextNews }: Props) {
  const { user } = useAuth()
  const categoryInfo = getCategoryConfig(news.category)
  
  // 检查是否是管理员或发布者本人
  const canEdit = user?.role === 'admin' || user?.id === news.author_id?.toString()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link href="/news" className="hover:text-foreground transition-colors">
          AI资讯
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{news.title.slice(0, 30)}...</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-card border rounded-xl overflow-hidden">
            {/* Cover Image */}
            {news.cover_image && (
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={news.cover_image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 md:p-8">
              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {categoryInfo && news.category && (
                  <Link
                    href={`/news?category=${news.category}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <span>{categoryInfo?.icon}</span>
                    <span>{categoryInfo?.label}</span>
                  </Link>
                )}
                {news.is_hot && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    🔥 热门
                  </span>
                )}
                {news.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium">
                    ⭐ 精选
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{news.title}</h1>
              {news.title_en && (
                <p className="text-lg text-muted-foreground mb-4">{news.title_en}</p>
              )}

              {/* Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
                <span className="flex items-center gap-1.5">
                  <span>📅</span>
                  {formatDate(news.published_at)}
                </span>
                {news.source && (
                  <span className="flex items-center gap-1.5">
                    <span>📰</span>
                    {news.source}
                  </span>
                )}
                {news.author && (
                  <span className="flex items-center gap-1.5">
                    <span>✍️</span>
                    {news.author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span>👁️</span>
                  {news.view_count} 阅读
                </span>
                {/* 修改入口 - 仅管理员或发布者本人可见 */}
                {canEdit && (
                  <Button variant="ghost" size="sm" asChild className="gap-1 h-auto px-2 py-1 text-xs">
                    <Link href={`/publisher/news/${news.id}/edit`}>
                      <Edit className="h-3 w-3" />
                      修改
                    </Link>
                  </Button>
                )}
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-muted-foreground leading-relaxed">{news.summary}</p>
              </div>

              {/* Content */}
              {news.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-foreground leading-relaxed whitespace-pre-line">
                    {news.content}
                  </div>
                </div>
              )}

              {/* Source Link */}
              {news.source_url && (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1.5"
                  >
                    <span>🔗</span>
                    <span>查看原文</span>
                  </a>
                </div>
              )}

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <span>🏷️</span>
                    <span>相关标签</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/tags/${encodeURIComponent(tag)}?tab=news`}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-card border rounded-xl p-4">
            {prevNews ? (
              <Link
                href={`/news/${prevNews.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors max-w-[45%]"
              >
                <span>←</span>
                <span className="text-sm line-clamp-2">{prevNews.title}</span>
              </Link>
            ) : (
              <div />
            )}
            
            {nextNews ? (
              <Link
                href={`/news/${nextNews.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-right max-w-[45%]"
              >
                <span className="text-sm line-clamp-2">{nextNews.title}</span>
                <span>→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">资讯信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">发布时间</span>
                <span>{formatDate(news.published_at)}</span>
              </div>
              {categoryInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">分类</span>
                  <span className="flex items-center gap-1.5">
                    <span>{categoryInfo.icon}</span>
                    <span>{categoryInfo.label}</span>
                  </span>
                </div>
              )}
              {news.source && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">来源</span>
                  <span className="max-w-[150px] truncate">{news.source}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">浏览量</span>
                <span>{news.view_count}</span>
              </div>
            </div>
          </div>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">相关资讯</h3>
              <div className="space-y-4">
                {relatedNews.map((item) => {
                  const itemCategory = getCategoryConfig(item.category)
                  return (
                    <Link
                      key={item.id}
                      href={`/news/${item.id}`}
                      className="group flex gap-3"
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span>{itemCategory?.icon || '📰'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(item.published_at)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back Link */}
          <Link
            href="/news"
            className="block text-center py-3 px-4 border rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            ← 返回AI资讯
          </Link>
        </div>
      </div>
    </div>
  )
}
