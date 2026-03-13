'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart, Loader2 } from 'lucide-react'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface Category {
  id: number
  name: string
  color: string | null
}

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  logo: string | null
  is_featured: boolean
  is_free: boolean
  view_count: number
  favorite_count: number
  category: Category | null
}

interface HotToolsListProps {
  type: 'domestic' | 'foreign'
}

export function HotToolsList({ type }: HotToolsListProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTools(1)
  }, [type])

  const fetchTools = async (pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/hot-tools?type=${type}&page=${pageNum}&limit=16`)
      const result = await response.json()
      if (result.success) {
        setTools(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
        setPage(pageNum)
      } else {
        setError(result.error || '获取数据失败')
      }
    } catch (err) {
      console.error('获取火爆工具失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchTools(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchTools(1)}>重试</Button>
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">暂无工具数据</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          共找到 <span className="font-medium text-foreground">{total}</span> 个火爆工具
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <Link key={tool.id} href={`/tools/${tool.id}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* 排名标识 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    (page - 1) * 16 + index < 3 
                      ? (index === 0 ? 'bg-yellow-400 text-yellow-900' :
                         index === 1 ? 'bg-gray-300 text-gray-700' :
                         'bg-amber-600 text-white')
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {(page - 1) * 16 + index + 1}
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

      {/* 分页 */}
      {totalPages > 1 && (
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
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </>
  )
}
