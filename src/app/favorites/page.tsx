'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Clock, Star } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Favorite {
  id: number
  created_at: string
  ai_tools: {
    id: number
    name: string
    description: string
    website: string
    logo: string | null
    is_free: boolean
    category_id: number
  } | null
}

export default function FavoritesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/favorites')
      return
    }
    fetchFavorites()
  }, [user, token])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setFavorites(data.data)
      } else if (response.status === 401) {
        // Token 无效或过期，清除登录状态并重定向
        localStorage.removeItem('auth_token')
        router.push('/login?redirect=/favorites')
        return
      } else {
        console.error('获取收藏失败:', data.error)
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
        setFavorites(favorites.filter((f) => f.ai_tools?.id !== toolId))
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
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
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => {
            const tool = favorite.ai_tools
            if (!tool) return null

            return (
              <Card key={favorite.id} className="overflow-hidden h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <Link href={`/tools/${tool.id}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {tool.logo ? (
                          <img src={tool.logo} alt={tool.name} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          tool.name[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between">
                    <Badge variant={tool.is_free ? 'default' : 'secondary'}>
                      {tool.is_free ? '免费' : '付费'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
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
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无收藏</h3>
          <p className="text-muted-foreground mb-4">
            浏览AI工具，收藏你感兴趣的内容
          </p>
          <Button asChild>
            <Link href="/">浏览工具</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
