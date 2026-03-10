'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  User, Heart, MessageCircle, Settings, LogOut, Clock, 
  Eye, Star, ChevronRight, Trash2, Loader2, Save
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'

interface Favorite {
  id: number
  created_at: string
  ai_tools: {
    id: number
    name: string
    slug: string
    description: string
    logo: string | null
    website: string
    is_free: boolean
    view_count: number
    favorite_count: number
    category_id: number
  } | null
}

interface Comment {
  id: number
  content: string
  rating: number | null
  created_at: string
  tool_id: number
  ai_tools: {
    id: number
    name: string
    slug: string
  } | null
}

interface UserStats {
  favoritesCount: number
  commentsCount: number
  joinedDays: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, token, logout, isLoading } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<UserStats>({ favoritesCount: 0, commentsCount: 0, joinedDays: 0 })
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 编辑模式
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile')
    } else if (user) {
      fetchFavorites()
      fetchComments()
      fetchStats()
      setEditName(user.name || '')
    }
  }, [user, isLoading, token])

  const fetchFavorites = async () => {
    if (!token) return
    setLoadingFavorites(true)
    try {
      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setFavorites(data.data || [])
        setStats(prev => ({ ...prev, favoritesCount: data.data?.length || 0 }))
      }
    } catch (error) {
      console.error('获取收藏失败:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const fetchComments = async () => {
    if (!token) return
    setLoadingComments(true)
    try {
      const response = await fetch('/api/user/comments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setComments(data.data?.data || [])
        setStats(prev => ({ ...prev, commentsCount: data.data?.total || 0 }))
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return
    // 计算加入天数
    const createdAt = new Date(user.id.split('-')[0]) // 简单估算
    const now = new Date()
    const joinedDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) || 1
    setStats(prev => ({ ...prev, joinedDays: Math.max(1, joinedDays) }))
  }

  const handleRemoveFavorite = async (toolId: number) => {
    if (!token) return
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toolId, action: 'remove' }),
      })
      if (response.ok) {
        setFavorites(favorites.filter(f => f.ai_tools?.id !== toolId))
        setStats(prev => ({ ...prev, favoritesCount: prev.favoritesCount - 1 }))
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !confirm('确定要删除这条评论吗？')) return
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId))
        setStats(prev => ({ ...prev, commentsCount: prev.commentsCount - 1 }))
      }
    } catch (error) {
      console.error('删除评论失败:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!token || !editName.trim()) return
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      })
      const data = await response.json()
      if (data.success) {
        setEditMode(false)
        // 刷新用户信息
        window.location.reload()
      }
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name || '用户'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'publisher' ? 'secondary' : 'outline'}>
                  {user.role === 'admin' ? '管理员' : user.role === 'publisher' ? '发布者' : '普通用户'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  已加入 {stats.joinedDays} 天
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-full">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.favoritesCount}</p>
                  <p className="text-sm text-muted-foreground">我的收藏</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.commentsCount}</p>
                  <p className="text-sm text-muted-foreground">我的评论</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.joinedDays}</p>
                  <p className="text-sm text-muted-foreground">加入天数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">我的收藏</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">我的评论</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">账号设置</span>
            </TabsTrigger>
          </TabsList>

          {/* My Favorites */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  我的收藏 ({stats.favoritesCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFavorites ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="space-y-4">
                    {favorites.map((favorite) => (
                      favorite.ai_tools && (
                        <div key={favorite.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                          <Link href={`/tools/${favorite.ai_tools.id}`} className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {favorite.ai_tools.logo ? (
                                  <img src={favorite.ai_tools.logo} alt="" className="h-full w-full rounded-lg object-cover" />
                                ) : (
                                  favorite.ai_tools.name[0]
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate group-hover:text-primary">
                                  {favorite.ai_tools.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {favorite.ai_tools.description}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {favorite.ai_tools.view_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {favorite.ai_tools.favorite_count}
                                  </span>
                                  {favorite.ai_tools.is_free && (
                                    <Badge variant="secondary" className="text-xs">免费</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveFavorite(favorite.ai_tools!.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">还没有收藏任何工具</p>
                    <Button asChild>
                      <Link href="/">去发现好用的AI工具</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Comments */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  我的评论 ({stats.commentsCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {comment.ai_tools && (
                                <Link href={`/tools/${comment.ai_tools.id}`} className="font-medium text-primary hover:underline">
                                  {comment.ai_tools.name}
                                </Link>
                              )}
                              {comment.rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < comment.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatRelativeTime(comment.created_at)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">还没有发表过评论</p>
                    <Button asChild>
                      <Link href="/">去浏览AI工具</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  账号设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="font-medium">基本信息</h3>
                  <Separator />
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">昵称</Label>
                      {editMode ? (
                        <div className="flex gap-2">
                          <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="请输入昵称"
                          />
                          <Button onClick={handleSaveProfile} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" onClick={() => setEditMode(false)}>取消</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{user.name || '未设置'}</span>
                          <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                            修改
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label>邮箱</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{user.email}</span>
                        <Badge variant="outline">已验证</Badge>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>用户角色</Label>
                      <div className="flex items-center justify-between">
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'publisher' ? 'secondary' : 'outline'}>
                          {user.role === 'admin' ? '管理员' : user.role === 'publisher' ? '发布者' : '普通用户'}
                        </Badge>
                        {user.role === 'user' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/publisher/apply">申请成为发布者</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 安全设置 */}
                <div className="space-y-4">
                  <h3 className="font-medium">安全设置</h3>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">登录密码</p>
                        <p className="text-sm text-muted-foreground">定期修改密码可以提高账号安全性</p>
                      </div>
                      <Button variant="outline" size="sm">
                        修改密码
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 账号操作 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">危险操作</h3>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">注销账号</p>
                      <p className="text-sm text-muted-foreground">注销后所有数据将被删除且无法恢复</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      注销账号
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
