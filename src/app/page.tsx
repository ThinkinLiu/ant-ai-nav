'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, TrendingUp, Clock, Star, ExternalLink, ChevronRight,
  PenTool, Palette, MessageCircle, Code, Music, Video, Briefcase, GraduationCap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'

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
  description: string | null
  icon: string | null
  color: string | null
  toolCount: number
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
  created_at: string
  category: Category
}

function HomePageContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')
  const categoryId = searchParams.get('categoryId')
  const isFeatured = searchParams.get('isFeatured')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTools()
  }, [searchQuery, categoryId, isFeatured, activeCategory])

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
      if (searchQuery) params.append('search', searchQuery)
      if (categoryId) params.append('categoryId', categoryId)
      if (isFeatured === 'true') params.append('isFeatured', 'true')
      if (activeCategory !== 'all') {
        const cat = categories.find(c => c.slug === activeCategory)
        if (cat) params.append('categoryId', cat.id.toString())
      }
      params.append('limit', '20')

      const response = await fetch(`/api/tools?${params}`)
      const data = await response.json()
      if (data.success) {
        setTools(data.data.data)
      }
    } catch (error) {
      console.error('获取工具失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                发现最好的AI工具
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              蚂蚁AI导航收录了最优秀的AI工具，帮助你提升工作效率，释放创造力
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/categories">
                  开始探索
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">免费注册</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                全部
              </TabsTrigger>
              {categories.map((category) => {
                const Icon = category.icon ? iconMap[category.icon] : Star
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.slug}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="mr-1 h-4 w-4" />
                    {category.name}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.toolCount}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Sort Options */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `搜索结果: ${searchQuery}` : 
               isFeatured === 'true' ? '精选推荐' : '最新上架'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>热门推荐</span>
            </div>
          </div>

          {/* Tools Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div 
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: tool.category?.color || '#6366F1' }}
                        >
                          {tool.logo ? (
                            <img src={tool.logo} alt={tool.name} className="h-full w-full rounded-lg object-cover" />
                          ) : (
                            tool.name[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
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
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {tool.favorite_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(tool.created_at)}
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">暂无相关工具</h3>
              <p className="text-muted-foreground">尝试其他搜索词或浏览其他分类</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            有好用的AI工具想要分享？
          </h2>
          <p className="text-blue-100 mb-8">
            成为发布者，分享你发现的AI工具，让更多人受益
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={user ? "/publisher" : "/register"}>
              {user ? "发布工具" : "立即注册"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
