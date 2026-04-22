'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { categoryConfig, getCategoryConfig, getCategoriesConfig } from '../config'
import { MarkdownViewer } from '@/components/ui/markdown-editor'
import { Edit } from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

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

interface RelatedTool {
  id: number
  name: string
  slug: string | null
  name_en: string | null
  description: string | null
  logo: string | null
  website: string | null
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
  relatedTools?: RelatedTool[]
}

export function NewsDetail({ news, relatedNews, prevNews, nextNews, relatedTools = [] }: Props) {
  const { user } = useAuth()
  const categories = getCategoriesConfig(news.category)
  const firstCategory = categories[0]
  const categoryList = news.category

  // 检查是否是管理员或发布者本人
  const canEdit = user?.role === 'admin' || user?.id === news.author_id?.toString()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    // 使用固定格式避免 hydration 错误
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
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
                {categories.length > 0 && (
                  categories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={`/news?category=${cat.label === '行业动态' ? 'industry' : cat.label === '学术研究' ? 'research' : cat.label === '产品发布' ? 'product' : cat.label === '政策法规' ? 'policy' : cat.label === '教程指南' ? 'tutorial' : 'blog'}`}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </Link>
                  ))
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
                <MarkdownViewer content={news.content} />
              )}

              {/* Source Link */}
              {news.source_url && (
                <div className="mt-6 pt-6 border-t flex justify-end">
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
              {categories.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">分类</span>
                  <div className="flex flex-wrap gap-1.5 items-center justify-end">
                    {categories.map((cat) => (
                      <span key={cat.label} className="flex items-center gap-1 text-sm">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {news.source && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">来源</span>
                  {news.source_url ? (
                    <a
                      href={news.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[150px] truncate text-primary hover:underline"
                    >
                      {news.source}
                    </a>
                  ) : (
                    <span className="max-w-[150px] truncate">{news.source}</span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">浏览量</span>
                <span>{news.view_count}</span>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔧</span>
                <span>相关工具</span>
              </h3>
              <div className="space-y-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ToolLogoNext
                      logo={tool.logo}
                      name={tool.name}
                      website={tool.website}
                      size={40}
                      className="h-10 w-10 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </p>
                      {tool.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
