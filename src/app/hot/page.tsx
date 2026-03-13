'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Flame, TrendingUp, Eye, Heart, 
  ArrowLeft, Loader2
} from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
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
}

interface HotToolsData {
  data: Tool[]
  total: number
  page: number
  limit: number
  totalPages: number
  type: string
  typeName: string
}

function HotToolsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') || 'domestic'
  const page = parseInt(searchParams.get('page') || '1')

  const [data, setData] = useState<HotToolsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotTools()
  }, [type, page])

  const fetchHotTools = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/hot-tools?type=${type}&page=${page}&limit=16`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('获取火爆工具失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (newType: string) => {
    router.push(`/hot?type=${newType}`)
  }

  const handlePageChange = (newPage: number) => {
    router.push(`/hot?type=${type}&page=${newPage}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className={`py-12 ${type === 'domestic' 
        ? 'bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20' 
        : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20'}`}>
        <div className="container mx-auto px-4">
          {/* 返回按钮 */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 gap-1"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            {type === 'domestic' ? (
              <Flame className="h-8 w-8 text-red-500" />
            ) : (
              <TrendingUp className="h-8 w-8 text-blue-500" />
            )}
            <h1 className="text-3xl font-bold">
              {type === 'domestic' ? '国内火爆AI工具' : '国外火爆AI工具'}
            </h1>
            <Badge 
              variant={type === 'domestic' ? 'destructive' : 'default'}
              className={`ml-2 text-sm ${type === 'foreign' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              {type === 'domestic' ? 'HOT' : 'GLOBAL'}
            </Badge>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            {type === 'domestic' 
              ? '精选国内最受欢迎的AI工具，包括大模型对话、AI绘画、AI写作、AI编程等多个领域的热门产品。'
              : '汇集全球顶尖的AI工具，涵盖对话、绘画、视频、音频等多个领域的国际知名产品。'
            }
          </p>

          {/* 类型切换 */}
          <Tabs value={type} onValueChange={handleTypeChange} className="mt-6">
            <TabsList className="bg-background/50">
              <TabsTrigger value="domestic" className="gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <Flame className="h-4 w-4" />
                国内火爆
              </TabsTrigger>
              <TabsTrigger value="foreign" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                国外火爆
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                共找到 <span className="font-medium text-foreground">{data.total}</span> 个火爆工具
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.data.map((tool, index) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* 排名标识 */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          (data.page - 1) * data.limit + index < 3 
                            ? (index === 0 ? 'bg-yellow-400 text-yellow-900' :
                               index === 1 ? 'bg-gray-300 text-gray-700' :
                               'bg-amber-600 text-white')
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {(data.page - 1) * data.limit + index + 1}
                        </div>

                        {/* Logo */}
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                          <ToolLogoNext 
                            logo={tool.logo} 
                            name={tool.name} 
                            className="h-full w-full rounded-lg"
                            size={48}
                            fallbackBgColor={tool.category?.color || (type === 'domestic' ? '#EF4444' : '#3B82F6')}
                          />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            {tool.is_featured && (
                              <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">精选</Badge>
                            )}
                            {tool.is_free && (
                              <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 text-green-600 border-green-300">免费</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(tool.view_count || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {(tool.favorite_count || 0).toLocaleString()}
                            </span>
                            {tool.category && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tool.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (data.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= data.totalPages - 2) {
                      pageNum = data.totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-9"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">暂无工具数据</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HotToolsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HotToolsContent />
    </Suspense>
  )
}
