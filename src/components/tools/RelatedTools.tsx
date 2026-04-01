'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink, Star, Eye, Heart, Pin, Sparkles,
  ArrowRight, Shuffle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface RelatedTool {
  id: number
  name: string
  slug: string
  description: string
  logo: string | null
  website: string
  is_featured: boolean
  is_pinned: boolean
  is_free: boolean
  view_count: number
  category: {
    id: number
    name: string
    slug: string
    color: string
  } | null
}

interface RelatedToolsProps {
  toolId: number
  variant?: 'default' | 'compact'  // default: 宽松布局, compact: 侧边栏紧凑布局
}

export default function RelatedTools({ toolId, variant = 'default' }: RelatedToolsProps) {
  const [tools, setTools] = useState<RelatedTool[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRelatedTools = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tools/${toolId}/related`)
      const data = await response.json()
      if (data.success) {
        setTools(data.data)
      }
    } catch (error) {
      console.error('获取相关工具失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (toolId) {
      fetchRelatedTools()
    }
  }, [toolId])

  if (loading) {
    return (
      <Card className={variant === 'compact' ? '' : ''}>
        <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${variant === 'compact' ? 'text-base' : ''}`}>
            <Sparkles className="h-5 w-5 text-primary" />
            相关推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={variant === 'compact' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
            {(variant === 'compact' ? [1, 2, 3] : [1, 2, 3, 4, 5, 6]).map((i) => (
              <div key={i} className="animate-pulse">
                <div className={variant === 'compact' ? 'h-16 bg-muted rounded-lg' : 'h-24 bg-muted rounded-lg'}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tools.length === 0) {
    return null
  }

  // 侧边栏紧凑布局
  if (variant === 'compact') {
    // 只显示前4个
    const displayTools = tools.slice(0, 4)
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              相关推荐
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchRelatedTools}
              className="text-muted-foreground hover:text-foreground h-7"
            >
              <Shuffle className="h-3 w-3 mr-1" />
              换一批
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug || tool.id}`}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ToolLogoNext 
                logo={tool.logo}
                name={tool.name}
                website={tool.website}
                size={40}
                className="h-10 w-10 rounded-lg shrink-0"
                fallbackBgColor={tool.category?.color || '#6366F1'}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0 h-4"
                    style={{ 
                      borderColor: tool.category?.color || '#6366F1',
                      color: tool.category?.color || '#6366F1'
                    }}
                  >
                    {tool.category?.name || '未分类'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    )
  }

  // 默认宽松布局

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            相关推荐
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRelatedTools}
            className="text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="h-4 w-4 mr-1" />
            换一批
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50"
            >
              <div className="p-4">
                {/* 置顶/精选标签 */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {tool.is_pinned && (
                    <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                      <Pin className="h-3 w-3 mr-0.5" />
                      置顶
                    </Badge>
                  )}
                  {tool.is_featured && !tool.is_pinned && (
                    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                      <Sparkles className="h-3 w-3 mr-0.5" />
                      精选
                    </Badge>
                  )}
                </div>

                {/* Logo 和名称 */}
                <div className="flex items-center gap-3 mb-2">
                  <ToolLogoNext 
                    logo={tool.logo}
                    name={tool.name}
                    website={tool.website}
                    size={40}
                    className="h-10 w-10 rounded-lg shrink-0"
                    fallbackBgColor={tool.category?.color || '#6366F1'}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-4"
                        style={{ 
                          borderColor: tool.category?.color || '#6366F1',
                          color: tool.category?.color || '#6366F1'
                        }}
                      >
                        {tool.category?.name || '未分类'}
                      </Badge>
                      {tool.is_free ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] px-1.5 py-0 h-4">
                          免费
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          付费
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {tool.description}
                </p>

                {/* 统计数据 */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {tool.view_count}
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
            href={`/tools?category=${tools[0]?.category?.slug || ''}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            查看更多同类工具
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
