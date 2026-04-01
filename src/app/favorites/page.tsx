'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
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
import { Heart, Clock, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
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
  description: string
  website: string
  logo: string | null
  is_free: boolean
  category_id: number
  category: Category | null
}

interface Favorite {
  id: number
  created_at: string
  ai_tools: Tool | null
}

interface ApiResponse {
  success: boolean
  data: {
    favorites: Favorite[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function FavoritesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const limit = 24

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/favorites')
      return
    }
  }, [user, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (user && token) {
      fetchFavorites()
    }
  }, [user, token, page, selectedCategory])

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

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      const response = await fetch(`/api/favorites?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setFavorites(data.data.favorites)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      } else if (response.status === 401) {
        // Token 无效或过期，清除登录状态并重定向
        localStorage.removeItem('auth_token')
        router.push('/login?redirect=/favorites')
        return
      }
    } catch (error) {
      console.error('获取收藏失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (toolId: number) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toolId, action: 'remove' }),
      })
      const data = await response.json()
      if (data.success) {
        // 重新获取当前页数据
        fetchFavorites()
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
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
    const newUrl = params.toString() ? `/favorites?${params}` : '/favorites'
    router.replace(newUrl, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/10 dark:to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-red-950/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold">我的收藏</h1>
            <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
              {total} 个
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            你收藏的AI工具，方便随时查看和使用。
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            共收藏 <span className="font-medium text-foreground">{total}</span> 个工具
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
        ) : favorites.length > 0 ? (
          <>
            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((favorite) => {
                const tool = favorite.ai_tools
                if (!tool) return null

                return (
                  <Card key={favorite.id} className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-5">
                      <Link href={`/tools/${tool.id}`}>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                            <ToolLogoNext 
                              logo={tool.logo} 
                              name={tool.name} 
                              website={tool.website}
                              className="h-full w-full rounded-lg"
                              size={40}
                              fallbackBgColor={tool.category?.color || '#EC4899'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={tool.is_free ? 'default' : 'secondary'}>
                            {tool.is_free ? '免费' : '付费'}
                          </Badge>
                          {tool.category && (
                            <Badge variant="outline" className="text-xs">
                              {tool.category.name}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleRemoveFavorite(tool.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        收藏于 {formatRelativeTime(favorite.created_at)}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无收藏</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'all' ? '当前分类下暂无收藏，试试其他分类' : '浏览AI工具，收藏你感兴趣的内容'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {selectedCategory !== 'all' && (
                <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                  查看全部分类
                </Button>
              )}
              <Button asChild>
                <Link href="/">浏览工具</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
