'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenTool, Palette, MessageCircle, Code, Music, Video, Briefcase, GraduationCap, Star } from 'lucide-react'

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [totalToolCount, setTotalToolCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
        setTotalToolCount(data.totalToolCount || 0)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">AI分类</h1>
        <Badge variant="secondary" className="text-base px-3 py-1">
          共 {totalToolCount} 个工具
        </Badge>
      </div>
      <p className="text-muted-foreground mb-8">
        按分类发现最适合你的AI工具
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          const Icon = category.icon ? iconMap[category.icon] : Star
          return (
            <Link key={category.id} href={`/?categoryId=${category.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <CardContent className="p-6">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color || '#6366F1' }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {category.description || '暂无描述'}
                  </p>
                  <Badge variant="secondary">
                    {category.toolCount} 个工具
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
