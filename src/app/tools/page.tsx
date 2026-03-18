'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Flame, Clock, Heart, Star, ChevronLeft, ChevronRight,
  PenTool, Palette, MessageCircle, Code, Music, Video, Briefcase, GraduationCap,
  Eye, TrendingUp, Filter, Pin
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

const iconMap: Record<string, any> = {
  PenTool,
  Palette,
  MessageCircle,
  Code,
  Music,
  Video,
  Briefcase,
  GraduationCap,
}

interface Category {
  id: number
  name: string
  slug: string
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

interface ToolsResponse {
  data: Tool[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function ToolsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 从URL获取初始参数
  const initialSortBy = searchParams.get('sortBy') || 'view_count'
  const initialCategory = searchParams.get('category') || 'all'
  const initialPage = parseInt(searchParams.get('page') || '1')
  const filter = searchParams.get('filter') // domestic 或 foreign
  
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 24
  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTools()
    // 更新URL参数
    const params = new URLSearchParams()
    params.set('sortBy', sortBy)
    if (activeCategory !== 'all') params.set('category', activeCategory)
    if (page > 1) params.set('page', page.toString())
    if (filter) params.set('filter', filter)
    router.replace(`/tools?${params.toString()}`, { scroll: false })
  }, [sortBy, activeCategory, page, filter])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTools = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('page', page.toString())
      
      // 排序
      const sortOrder = sortBy === 'created_at' ? 'desc' : 'desc'
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      
      // 分类筛选 - 直接使用 slug
      if (activeCategory !== 'all') {
        params.append('categorySlug', activeCategory)
      }
      
      // 国内/国外火爆筛选
      if (filter) {
        params.append('filter', filter)
      }

      const response = await fetch(`/api/tools?${params}`)
      const result = await response.json()
      if (result.success && result.data) {
        setTools(result.data.data || [])
        setTotal(result.data.total || 0)
        setTotalPages(result.data.totalPages || 1)
      }
    } catch (error) {
      console.error('获取工具失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPage(1) // 重置页码
  }

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value)
    setPage(1) // 重置页码
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5
    
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    
    return pages
  }

  // 获取排序标题
  const getSortTitle = () => {
    if (filter === 'domestic') {
      return '国内火爆'
    } else if (filter === 'foreign') {
      return '国外火爆'
    }
    
    switch (sortBy) {
      case 'view_count':
        return '热门工具'
      case 'favorite_count':
        return '最受欢迎'
      case 'created_at':
        return '最新上架'
      default:
        return '全部工具'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <section className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          {/* 标题和排序 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {filter === 'domestic' && <span className="text-2xl">🇨🇳</span>}
                {filter === 'foreign' && <span className="text-2xl">🌍</span>}
                {sortBy === 'view_count' && !filter && <Flame className="h-6 w-6 text-orange-500" />}
                {sortBy === 'favorite_count' && !filter && <Heart className="h-6 w-6 text-pink-500" />}
                {sortBy === 'created_at' && !filter && <Clock className="h-6 w-6 text-blue-500" />}
                <h1 className="text-2xl font-bold">{getSortTitle()}</h1>
              </div>
              <Badge variant="secondary" className="text-sm">
                共 {total} 个工具
              </Badge>
            </div>
            
            {/* 排序选择器 */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view_count">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>按热度排序</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="favorite_count">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>按收藏排序</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created_at">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>按时间排序</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 分类筛选 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className="shrink-0"
            >
              全部
            </Button>
            {categories.map((category) => {
              const Icon = category.icon ? iconMap[category.icon] : Star
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.slug)}
                  className="shrink-0 gap-1"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool, index) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-6">
                      {/* 热度排名标识 */}
                      {sortBy === 'view_count' && (page - 1) * limit + index < 10 && (
                        <div className="absolute top-3 right-3">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                            (page - 1) * limit + index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            (page - 1) * limit + index === 1 ? 'bg-gray-300 text-gray-700' :
                            (page - 1) * limit + index === 2 ? 'bg-amber-600 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {(page - 1) * limit + index + 1}
                          </div>
                        </div>
                      )}
                      
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            {tool.is_pinned && (
                              <Badge className="shrink-0 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                <Pin className="h-3 w-3 mr-0.5" />
                                置顶
                              </Badge>
                            )}
                            {tool.is_featured && (
                              <Badge variant="default" className="shrink-0 text-xs">精选</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {tool.category?.name || '未分类'}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" title="浏览量">
                            <Eye className="h-3 w-3" />
                            {(tool.view_count || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1" title="收藏数">
                            <Heart className="h-3 w-3" />
                            {(tool.favorite_count || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {tool.is_free ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            免费
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            付费
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatRelativeTime(tool.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, i) => (
                    typeof p === 'number' ? (
                      <Button
                        key={i}
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className="w-9"
                      >
                        {p}
                      </Button>
                    ) : (
                      <span key={i} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">暂无相关工具</h3>
            <p className="text-muted-foreground mb-4">尝试其他筛选条件</p>
            <Button onClick={() => { setActiveCategory('all'); setSortBy('view_count'); }}>
              查看全部工具
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  )
}
