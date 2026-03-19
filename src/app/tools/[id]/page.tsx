'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'
import { 
  ExternalLink, Star, Heart, Share2, MessageCircle, 
  Eye, Clock, ArrowLeft, Send, ThumbsUp, Award, Edit
} from 'lucide-react'
import RelatedTools from '@/components/tools/RelatedTools'
import { ToolLogoNext } from '@/components/tools/ToolLogo'

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  long_description: string | null
  website: string
  logo: string | null
  screenshots: string[] | null
  is_featured: boolean
  is_free: boolean
  pricing_info: string | null
  view_count: number
  favorite_count: number
  created_at: string
  category: { id: number; name: string; color: string } | null
  publisher: { id: string; name: string; avatar: string | null } | null
  tags: { id: number; name: string; slug: string }[]
  avgRating: number
  reviewCount: number
}

interface Comment {
  id: number
  content: string
  rating: number | null
  created_at: string
  is_featured: boolean
  user: { id: string; name: string; avatar: string | null } | null
  replies: Comment[]
}

export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [tool, setTool] = useState<Tool | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [commentRating, setCommentRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchTool()
    if (user && token) {
      checkFavorite()
    }
  }, [resolvedParams.id, user, token])

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${resolvedParams.id}`)
      const data = await response.json()
      if (data.success) {
        setTool(data.data)
        // 获取到工具详情后，使用工具ID获取评论
        fetchComments(data.data.id)
        // 检查收藏状态
        if (user && token) {
          checkFavoriteById(data.data.id)
        }
      }
    } catch (error) {
      console.error('获取工具详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (toolId: number) => {
    try {
      const response = await fetch(`/api/comments?toolId=${toolId}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.data.data)
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  const checkFavoriteById = async (toolId: number) => {
    try {
      const response = await fetch(`/api/favorites?toolId=${toolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setIsFavorited(data.data.isFavorited)
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  const checkFavorite = async () => {
    // 此方法已废弃，使用 checkFavoriteById
  }

  const handleFavorite = async () => {
    if (!user || !token) {
      router.push('/login?redirect=/tools/' + resolvedParams.id)
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toolId: tool?.id,
          action: isFavorited ? 'remove' : 'add',
        }),
      })
      const data = await response.json()
      if (data.success) {
        setIsFavorited(!isFavorited)
        if (tool) {
          setTool({
            ...tool,
            favorite_count: isFavorited ? tool.favorite_count - 1 : tool.favorite_count + 1,
          })
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) {
      router.push('/login?redirect=/tools/' + resolvedParams.id)
      return
    }

    if (!commentContent.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toolId: tool?.id,
          content: commentContent,
          rating: commentRating || null,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setCommentContent('')
        setCommentRating(0)
        if (tool) {
          fetchComments(tool.id)
        }
      }
    } catch (error) {
      console.error('发表评论失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool?.name,
          text: tool?.description,
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">工具不存在</h2>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tool Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <ToolLogoNext 
                    logo={tool.logo} 
                    name={tool.name} 
                    website={tool.website}
                    size={64}
                    className="h-16 w-16 rounded-xl shrink-0"
                    fallbackBgColor={tool.category?.color || '#6366F1'}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{tool.name}</h1>
                      {tool.is_featured && (
                        <Badge>精选</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{tool.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge variant="outline" style={{ borderColor: tool.category?.color, color: tool.category?.color }}>
                        {tool.category?.name || '未分类'}
                      </Badge>
                      {tool.is_free ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">免费</Badge>
                      ) : (
                        <Badge variant="secondary">付费</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - 显示在标题下方，靠右展示 */}
                <div className="mt-6 flex flex-wrap gap-2 justify-end">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                    <a href={tool.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      访问官网
                    </a>
                  </Button>
                  <Button
                    variant={isFavorited ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={handleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? '已收藏' : '收藏'}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    分享
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {/* 编辑入口 - 仅管理员或发布者本人可见 */}
                  {user && (user.role === 'admin' || user.id === tool.publisher?.id) && (
                    <Link 
                      href={`/publisher/tools/${tool.id}/edit`}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      编辑
                    </Link>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {tool.view_count} 浏览
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {tool.favorite_count} 收藏
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {tool.reviewCount} 评论
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {tool.avgRating || '暂无评分'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(tool.created_at)}
                  </span>
                </div>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tool.tags.map((tag) => (
                      <Link key={tag.id} href={`/tags/${tag.slug || encodeURIComponent(tag.name)}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Long Description */}
            {tool.long_description && (
              <Card>
                <CardHeader>
                  <CardTitle>详细介绍</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none long-description-content" dangerouslySetInnerHTML={{ __html: tool.long_description }} />
                </CardContent>
              </Card>
            )}

            {/* Mobile: 发布者和定价信息 - 移动端显示在用户评价上方 */}
            <div className="lg:hidden space-y-4">
              {/* Pricing Info */}
              {tool.pricing_info && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">💰 定价信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tool.pricing_info}</p>
                  </CardContent>
                </Card>
              )}

              {/* Publisher Info */}
              {tool.publisher && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">发布者</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={tool.publisher.avatar || undefined} />
                        <AvatarFallback>{tool.publisher.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{tool.publisher.name}</p>
                        <p className="text-xs text-muted-foreground">发布者</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>用户评价 ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">评分：</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommentRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= commentRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="分享你的使用体验..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting || !commentContent.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      发表评论
                    </Button>
                  </div>
                </form>

                <Separator />

                {/* Comment List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar || undefined} />
                          <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user?.name || '匿名用户'}</span>
                            {comment.is_featured && (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                <Award className="h-3 w-3 mr-0.5" />
                                精选
                              </Badge>
                            )}
                            {comment.rating && (
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= (comment.rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      暂无评论，快来发表第一条评论吧！
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Tools - 移动端显示在主内容区域 */}
            <div className="lg:hidden">
              <RelatedTools toolId={tool.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Tools - PC端显示在右侧栏 */}
            <div className="hidden lg:block">
              <RelatedTools toolId={tool.id} variant="compact" />
            </div>

            {/* Publisher Info - 桌面端显示 */}
            {tool.publisher && (
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-base">发布者</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={tool.publisher.avatar || undefined} />
                      <AvatarFallback>{tool.publisher.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{tool.publisher.name}</p>
                      <p className="text-xs text-muted-foreground">发布者</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Info - 桌面端显示 */}
            {tool.pricing_info && (
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-base">定价信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.pricing_info}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
