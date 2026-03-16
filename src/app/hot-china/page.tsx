'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Flame, Eye, Heart, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
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
  is_free: boolean
  view_count: number
  favorite_count: number
  category: Category | null
}

interface ApiResponse {
  success: boolean
  data: {
    tools: Tool[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function HotChinaPage() {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const limit = 24

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTools()
  }, [page, selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTools = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('type', 'domestic')
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      const res = await fetch(`/api/hot-tools?${params}`)
      const data: ApiResponse = await res.json()
      if (data.success) {
        setTools(data.data.tools)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('获取工具失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setPage(1)
    // 更新URL
    const params = new URLSearchParams()
    if (value !== 'all') {
      params.set('category', value)
    }
    const newUrl = params.toString() ? `/hot-china?${params}` : '/hot-china'
    router.replace(newUrl, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-background dark:from-red-950/10 dark:to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4 gap-1" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">国内火爆AI工具</h1>
            <Badge variant="destructive" className="ml-2">HOT</Badge>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            精选国内最受欢迎的AI工具，包括大模型对话、AI绘画、AI写作、AI编程等多个领域的热门产品。
          </p>
        </div>
      </div>

      {/* Filter & Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            共找到 <span className="font-medium text-foreground">{total}</span> 个火爆工具
          </p>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tools.length > 0 ? (
          <>
            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tools.map((tool, index) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          (page - 1) * limit + index < 3 
                            ? index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-amber-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {(page - 1) * limit + index + 1}
                        </div>

                        {/* Logo */}
                        <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                          <ToolLogoNext 
                            logo={tool.logo} 
                            name={tool.name} 
                            website={tool.website}
                            className="h-full w-full rounded-lg"
                            size={40}
                            fallbackBgColor={tool.category?.color || '#EF4444'}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            {tool.is_featured && (
                              <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">精选</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-3 w-3" />
                              {tool.view_count.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3 w-3" />
                              {tool.favorite_count.toLocaleString()}
                            </span>
                            {tool.is_free && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-600 border-green-300">
                                免费
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
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
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                
                <span className="text-sm text-muted-foreground ml-2">
                  第 {page}/{totalPages} 页
                </span>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Flame className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无工具</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'all' ? '当前分类下暂无火爆工具，试试其他分类' : '暂无火爆工具数据'}
            </p>
            {selectedCategory !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                查看全部分类
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
