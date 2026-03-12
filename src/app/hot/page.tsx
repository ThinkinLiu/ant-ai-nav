'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flame, TrendingUp, ChevronLeft, Eye, Heart, Loader2 } from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface Category {
  id: number
  name: string
  slug: string
  color: string | null
}

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  website: string
  logo: string | null
  is_featured: boolean
  is_pinned: boolean
  is_free: boolean
  view_count: number
  favorite_count: number
  created_at: string
  category: Category | null
  isDomestic?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

function HotToolsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') || 'domestic'
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  const [tools, setTools] = useState<Tool[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 0,
    hasMore: false,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // 获取火爆工具
  const fetchTools = async (newPage = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/tools/hot?type=${type}&page=${newPage}&limit=16`)
      const data = await response.json()
      
      if (data.success) {
        if (append) {
          setTools(prev => [...prev, ...data.data.tools])
        } else {
          setTools(data.data.tools)
        }
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('获取火爆工具失败:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 监听type变化
  useEffect(() => {
    setTools([])
    fetchTools(1, false)
  }, [type])

  // 加载更多
  const handleLoadMore = () => {
    const nextPage = pagination.page + 1
    fetchTools(nextPage, true)
    // 更新URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', nextPage.toString())
    router.push(`/hot?${params.toString()}`, { scroll: false })
  }

  // 切换类型
  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams()
    params.set('type', newType)
    router.push(`/hot?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  返回首页
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                {type === 'domestic' ? (
                  <Flame className="h-6 w-6 text-red-500" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                )}
                <h1 className="text-xl font-bold">
                  {type === 'domestic' ? '国内火爆AI工具' : '国外火爆AI工具'}
                </h1>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              共 {pagination.total} 个工具
            </Badge>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={type} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="domestic" className="gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              国内火爆
            </TabsTrigger>
            <TabsTrigger value="foreign" className="gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              国外火爆
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tools Grid */}
      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无{type === 'domestic' ? '国内' : '国外'}火爆工具数据
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${
              type === 'domestic' 
                ? 'bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 rounded-xl p-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
                : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-xl p-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
            }`}>
              {tools.map((tool, index) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      {/* 排名标识 */}
                      {index < 3 && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-amber-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                      <div className="h-12 w-12 mx-auto rounded-lg overflow-hidden mb-3">
                        <ToolLogoNext 
                          logo={tool.logo} 
                          name={tool.name} 
                          className="h-full w-full rounded-lg"
                          size={48}
                          fallbackBgColor={tool.category?.color || (type === 'domestic' ? '#EF4444' : '#3B82F6')}
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {tool.category?.name || 'AI工具'}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {(tool.view_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" />
                          {(tool.favorite_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>
                      查看更多 ({pagination.total - tools.length} 个)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function HotToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <HotToolsContent />
    </Suspense>
  )
}
