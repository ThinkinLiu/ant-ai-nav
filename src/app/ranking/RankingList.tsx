'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowUp, ArrowDown, Minus, Trophy, TrendingUp, 
  Eye, ExternalLink, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  website: string
  logo: string
  is_free: boolean
  is_featured: boolean
  is_top: boolean
  category: {
    id: string
    name: string
    slug: string
  } | null
}

interface RankingItem {
  id: string
  rank: number
  previous_rank: number | null
  monthly_visits: number
  monthly_visits_change: number
  tool: Tool
}

interface RankingData {
  data: RankingItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  lastUpdated: string
}

interface Category {
  id: string
  name: string
  slug: string
}

// 格式化流量数字
function formatVisits(visits: number): string {
  if (visits >= 10000000) {
    return (visits / 1000000).toFixed(1) + 'M'
  } else if (visits >= 10000) {
    return (visits / 1000).toFixed(1) + 'K'
  }
  return visits.toLocaleString()
}

// 获取排名变化
function getRankChange(current: number, previous: number | null): {
  type: 'up' | 'down' | 'same' | 'new'
  value: number
} {
  if (previous === null) {
    return { type: 'new', value: 0 }
  }
  if (previous === current) {
    return { type: 'same', value: 0 }
  }
  if (previous > current) {
    return { type: 'up', value: previous - current }
  }
  return { type: 'down', value: current - previous }
}

// 获取排名样式
function getRankStyle(rank: number) {
  if (rank === 1) {
    return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
  }
  if (rank === 2) {
    return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
  }
  if (rank === 3) {
    return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
  }
  if (rank <= 10) {
    return 'bg-primary/10 text-primary'
  }
  return 'bg-muted text-muted-foreground'
}

export function RankingList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<RankingData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  )

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = await response.json()
        if (response.ok && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    }
    fetchCategories()
  }, [])

  const fetchData = useCallback(async (page: number, category: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      if (category && category !== 'all') {
        params.set('category', category)
      }
      
      const response = await fetch(`/api/ranking?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('获取排行榜数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(currentPage, selectedCategory)
  }, [currentPage, selectedCategory, fetchData])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
    
    const params = new URLSearchParams()
    if (value !== 'all') {
      params.set('category', value)
    }
    if (currentPage !== 1) {
      params.set('page', '1')
    }
    
    const queryString = params.toString()
    router.push(`/ranking${queryString ? `?${queryString}` : ''}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    const params = new URLSearchParams()
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }
    params.set('page', page.toString())
    
    router.push(`/ranking?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {data?.lastUpdated && (
          <div className="text-sm text-muted-foreground">
            最后更新：{new Date(data.lastUpdated).toLocaleString('zh-CN')}
          </div>
        )}
      </div>

      {/* Ranking Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-4 font-medium text-sm w-16">排名</th>
                  <th className="text-left py-4 px-4 font-medium text-sm">工具名称</th>
                  <th className="text-left py-4 px-4 font-medium text-sm hidden md:table-cell">分类</th>
                  <th className="text-right py-4 px-4 font-medium text-sm hidden sm:table-cell">月访问量</th>
                  <th className="text-center py-4 px-4 font-medium text-sm w-20">变化</th>
                  <th className="text-center py-4 px-4 font-medium text-sm w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((item) => {
                  const change = getRankChange(item.rank, item.previous_rank)
                  
                  return (
                    <tr 
                      key={item.id} 
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getRankStyle(item.rank)}`}>
                          {item.rank <= 3 ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            item.rank
                          )}
                        </div>
                      </td>
                      
                      {/* Tool Info */}
                      <td className="py-4 px-4">
                        <Link href={`/tools/${item.tool.slug}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                          <ToolLogoNext 
                            logo={item.tool.logo}
                            name={item.tool.name}
                            website={item.tool.website}
                            size={40}
                            className="w-10 h-10 rounded-lg shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-2">
                              {item.tool.name}
                              {item.tool.is_top && (
                                <Badge variant="default" className="text-xs px-1.5 py-0">置顶</Badge>
                              )}
                              {item.tool.is_featured && !item.tool.is_top && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">精选</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {item.tool.description}
                            </p>
                          </div>
                        </Link>
                      </td>
                      
                      {/* Category */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        {item.tool.category && (
                          <Link 
                            href={`/categories/${item.tool.category.slug}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {item.tool.category.name}
                          </Link>
                        )}
                      </td>
                      
                      {/* Monthly Visits */}
                      <td className="py-4 px-4 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatVisits(item.monthly_visits)}</span>
                        </div>
                        {item.monthly_visits_change && (
                          <div className={`text-xs ${item.monthly_visits_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.monthly_visits_change >= 0 ? '+' : ''}{item.monthly_visits_change}%
                          </div>
                        )}
                      </td>
                      
                      {/* Rank Change */}
                      <td className="py-4 px-4 text-center">
                        {change.type === 'up' && (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <ArrowUp className="h-4 w-4" />
                            <span className="text-sm font-medium">{change.value}</span>
                          </div>
                        )}
                        {change.type === 'down' && (
                          <div className="flex items-center justify-center gap-1 text-red-600">
                            <ArrowDown className="h-4 w-4" />
                            <span className="text-sm font-medium">{change.value}</span>
                          </div>
                        )}
                        {change.type === 'same' && (
                          <div className="flex items-center justify-center text-muted-foreground">
                            <Minus className="h-4 w-4" />
                          </div>
                        )}
                        {change.type === 'new' && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            新上榜
                          </Badge>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <Link href={`/tools/${item.tool.slug}`}>
                              详情
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <a 
                              href={item.tool.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              let pageNum: number
              if (data.pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= data.pagination.totalPages - 2) {
                pageNum = data.pagination.totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === data.pagination.totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Stats */}
      {data && (
        <div className="text-center text-sm text-muted-foreground">
          共 {data.pagination.total} 个工具 · 第 {data.pagination.page}/{data.pagination.totalPages} 页
        </div>
      )}
    </div>
  )
}
