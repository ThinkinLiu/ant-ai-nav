'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Eye, Heart, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

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
  category: { id: number; name: string; color: string } | null
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

export default function HotGlobalPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTools()
  }, [page])

  const fetchTools = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hot-global?page=${page}&limit=24`)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/10 dark:to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4 gap-1" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">国外火爆AI工具</h1>
            <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">GLOBAL</Badge>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            汇集全球顶尖的AI工具，涵盖对话、绘画、视频、音频等多个领域的国际知名产品。
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              共找到 <span className="font-medium text-foreground">{total}</span> 个火爆工具
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tools.map((tool, index) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Rank */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          (page - 1) * 24 + index < 3 
                            ? index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-amber-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {(page - 1) * 24 + index + 1}
                        </div>

                        {/* Logo */}
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                          <ToolLogoNext 
                            logo={tool.logo} 
                            name={tool.name} 
                            className="h-full w-full rounded-lg"
                            size={48}
                            fallbackBgColor={tool.category?.color || '#3B82F6'}
                          />
                        </div>

                        {/* Info */}
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
                              {tool.view_count.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {tool.favorite_count.toLocaleString()}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
