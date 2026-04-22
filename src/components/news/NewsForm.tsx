'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { TagInput } from '@/components/ui/tag-input'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Send, Eye, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
import ImageUploader from '@/components/ui/image-uploader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import ToolSelector from './ToolSelector'

interface NewsCategory {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
}

interface NewsFormProps {
  mode: 'create' | 'edit'
  newsId?: number
  returnUrl: string
}

export default function NewsForm({ mode, newsId, returnUrl }: NewsFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    categories: [] as string[],
    tags: [] as string[],
    source: '',
    sourceUrl: '',
    isFeatured: false,
    isHot: false,
    publishedAt: '',
    relatedTools: [] as number[],
  })

  // 加载分类列表
  useEffect(() => {
    fetchCategories()
  }, [])

  // 编辑模式：加载现有数据
  useEffect(() => {
    if (mode === 'edit' && newsId) {
      fetchNews()
    }
  }, [mode, newsId])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await fetch('/api/admin/news-categories')
      const result = await response.json()

      if (result.success) {
        // 只显示启用的分类
        const activeCategories = result.data.filter((cat: NewsCategory) => cat.is_active)
        setCategories(activeCategories)
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      toast.error('获取分类列表失败')
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchNews = async () => {
    setFetchingData(true)
    try {
      const response = await fetch(`/api/news/${newsId}`)
      const result = await response.json()

      if (result.success) {
        const news = result.data
        // 将发布时间转换为 datetime-local 需要的格式 (YYYY-MM-DDTHH:mm)
        const formatDateTimeForInput = (dateStr: string | null) => {
          if (!dateStr) return ''
          // ISO 格式: "2024-01-01T12:00:00Z" -> "2024-01-01T12:00"
          return dateStr.slice(0, 16)
        }
        setFormData({
          title: news.title || '',
          slug: news.slug || '',
          summary: news.summary || '',
          content: news.content || '',
          coverImage: news.cover_image || '',
          categories: Array.isArray(news.category) ? news.category : (news.category ? [news.category] : []),
          tags: Array.isArray(news.tags) ? news.tags : [],
          source: news.source || '',
          sourceUrl: news.source_url || '',
          isFeatured: news.is_featured || false,
          isHot: news.is_hot || false,
          publishedAt: formatDateTimeForInput(news.published_at),
          relatedTools: Array.isArray(news.related_tools) ? news.related_tools : [],
        })
      } else {
        toast.error(result.error || '加载失败')
        router.push(returnUrl)
      }
    } catch (error) {
      console.error('加载失败:', error)
      toast.error('加载失败')
      router.push(returnUrl)
    } finally {
      setFetchingData(false)
    }
  }

  // 自动生成资讯信息
  const handleGenerateInfo = async () => {
    if (!formData.title.trim()) {
      toast.error('请先输入资讯标题')
      return
    }

    setGenerating(true)
    setGenerateError(null)
    try {
      const response = await fetch('/api/admin/generate-news-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          sourceUrl: formData.sourceUrl.trim() || undefined,
        }),
      })
      const data = await response.json()

      if (data.success && data.data) {
        const result = data.data
        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          slug: prev.slug || generateSlug(result.title || prev.title),
          summary: result.summary || prev.summary,
          content: result.content || prev.content,
          source: result.source || prev.source,
          sourceUrl: result.sourceUrl || prev.sourceUrl,
          tags: result.tags?.length > 0 ? result.tags : prev.tags,
        }))
        toast.success('资讯信息已自动生成')
        setGenerateError(null)
      } else {
        setGenerateError(data.error || '生成失败，请稍后重试')
      }
    } catch (error) {
      console.error('自动生成失败:', error)
      setGenerateError('网络错误，请检查网络连接后重试')
    } finally {
      setGenerating(false)
    }
  }

  const generateSlug = (title: string) => {
    // 将中文转为拼音首字母，英文保持不变
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)

    // 如果是纯中文，使用时间戳
    if (/^[\u4e00-\u9fa5-]+$/.test(slug) && !/[a-z0-9]/.test(slug)) {
      return `news-${Date.now()}`
    }
    return slug
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!user) return

    // 验证必填字段
    if (!formData.title.trim()) {
      toast.error('请填写标题')
      return
    }
    if (!formData.content.trim()) {
      toast.error('请填写正文内容')
      return
    }

    setLoading(true)
    try {
      const slug = formData.slug || generateSlug(formData.title)
      const tags = formData.tags.filter(Boolean)

      const submitData = {
        title: formData.title.trim(),
        slug,
        summary: formData.summary.trim().replace(/<[^>]*>/g, ''),
        content: formData.content.trim(),
        coverImage: formData.coverImage.trim(),
        categories: formData.categories,
        tags,
        source: formData.source.trim(),
        sourceUrl: formData.sourceUrl.trim(),
        isFeatured: user.role === 'admin' ? formData.isFeatured : false,
        isHot: user.role === 'admin' ? formData.isHot : false,
        publishedAt: user.role === 'admin' && formData.publishedAt ? formData.publishedAt : new Date().toISOString(),
        relatedTools: formData.relatedTools,
      }

      let response
      if (mode === 'create') {
        response = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...submitData,
            authorId: user.id,
          }),
        })
      } else {
        response = await fetch(`/api/news/${newsId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        })
      }

      const result = await response.json()

      if (result.success) {
        // 如果不是草稿，提交审核
        if (!isDraft && result.data.id) {
          await fetch(`/api/news/${result.data.id}/review`, {
            method: 'PUT',
          })
        }
        toast.success('保存成功')
        router.push(returnUrl)
      } else {
        toast.error(result.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'publisher')) {
    return null
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={returnUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Link>
          </Button>
          <span className="text-sm font-medium">{mode === 'create' ? '新建AI资讯' : '编辑AI资讯'}</span>
          <div className="w-[120px]" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* AI 采集提示 */}
        <div className="mb-6 bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-sm text-muted-foreground">
              输入标题和来源链接后，点击&quot;AI采集&quot;可自动从网络获取资讯内容（摘要、正文、来源、标签等）
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInfo}
              disabled={generating || !formData.title.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  采集中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI采集
                </>
              )}
            </Button>
          </div>
          {/* 错误提示 */}
          {generateError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">采集失败</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{generateError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 左右两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要编辑区域 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setFormData({
                        ...formData,
                        title,
                        slug: mode === 'create' && !formData.slug ? generateSlug(title) : formData.slug,
                      })
                      setGenerateError(null)
                    }}
                    placeholder="请输入资讯标题"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/200 字符
                  </p>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">URL路径 (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="自动生成或手动输入"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    用于URL中的唯一标识，如: /news/your-slug
                  </p>
                </div>

                {/* 分类 */}
                <div className="space-y-2">
                  <Label>分类（可多选）</Label>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const isSelected = formData.categories.includes(category.slug)
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter((c) => c !== category.slug),
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  categories: [...formData.categories, category.slug],
                                })
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-full text-sm font-medium transition-all
                              border cursor-pointer
                              ${isSelected 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                              }
                            `}
                            style={isSelected && category.color ? { backgroundColor: category.color, borderColor: category.color } : {}}
                          >
                            {category.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {formData.categories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      已选择 {formData.categories.length} 个分类
                    </p>
                  )}
                </div>

                {/* 摘要 - 普通文本输入 */}
                <div className="space-y-2">
                  <Label htmlFor="summary">摘要</Label>
                  <textarea
                    id="summary"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    value={formData.summary.replace(/<[^>]*>/g, '')}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="请输入资讯摘要（建议200字以内）"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.summary.replace(/<[^>]*>/g, '').length}/500 字符
                  </p>
                </div>

                {/* 正文内容 */}
                <div className="space-y-2">
                  <Label>正文内容 *</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value || '' })}
                    placeholder="详细介绍这个资讯的内容，支持图文粘贴..."
                    minHeight="400px"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：设置面板 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 封面图片 */}
                <div className="space-y-2">
                  <Label>封面图片</Label>
                  <ImageUploader
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    folder="news/covers"
                    aspectRatio="16/9"
                    placeholder="点击上传封面图片"
                    maxSize={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    建议尺寸 1200x630 像素
                  </p>
                </div>

                {/* 标签 */}
                <div className="space-y-2">
                  <Label htmlFor="tags">标签</Label>
                  <TagInput
                    value={formData.tags}
                    onChange={(tags: string[]) => setFormData({ ...formData, tags })}
                    placeholder="输入标签，按回车或逗号分隔"
                    maxTags={10}
                  />
                </div>

                {/* 来源信息 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">发布来源</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="如: 新浪科技、36氪"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceUrl">来源地址</Label>
                    <Input
                      id="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* 管理员选项 */}
                {user.role === 'admin' && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* 发布时间 */}
                    <div className="space-y-2">
                      <Label htmlFor="publishedAt">发布时间</Label>
                      <Input
                        id="publishedAt"
                        type="datetime-local"
                        value={formData.publishedAt}
                        onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                        max={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {mode === 'create' ? '留空则使用当前时间' : '修改发布时间将影响资讯排序'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>推荐文章</Label>
                        <p className="text-xs text-muted-foreground">
                          标记为推荐文章
                        </p>
                      </div>
                      <Switch
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isFeatured: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>热门文章</Label>
                        <p className="text-xs text-muted-foreground">
                          标记为热门文章
                        </p>
                      </div>
                      <Switch
                        checked={formData.isHot}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isHot: checked })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* 关联工具选择器 */}
                <div className="space-y-2">
                  <ToolSelector
                    selectedTools={formData.relatedTools}
                    onChange={(tools) => setFormData({ ...formData, relatedTools: tools })}
                  />
                </div>

                {/* 操作按钮 */}
                <div className="space-y-3 pt-4 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled={!formData.title && !formData.content}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        预览
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="text-xl">资讯预览</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {/* 标题 */}
                          {formData.title && (
                            <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
                          )}
                          
                          {/* 元信息 */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                            {formData.categories.length > 0 && (
                              <span>
                                分类: {formData.categories.map(c => categories.find(cat => cat.slug === c)?.name).filter(Boolean).join(', ')}
                              </span>
                            )}
                            {formData.publishedAt && (
                              <span>发布时间: {formData.publishedAt}</span>
                            )}
                            {formData.source && (
                              <span>来源: {formData.source}</span>
                            )}
                            {formData.tags.length > 0 && (
                              <span>标签: {formData.tags.join(', ')}</span>
                            )}
                          </div>

                          {/* 封面图 */}
                          {formData.coverImage && (
                            <div className="mb-6">
                              <img
                                src={formData.coverImage}
                                alt="封面预览"
                                className="w-full max-h-64 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )}

                          {/* 摘要 */}
                          {formData.summary && (
                            <div className="mb-6 p-4 bg-muted rounded-lg">
                              <h3 className="font-semibold mb-2">摘要</h3>
                              <p className="text-sm whitespace-pre-wrap">{formData.summary.replace(/<[^>]*>/g, '')}</p>
                            </div>
                          )}

                          {/* 正文 */}
                          {formData.content && (
                            <div className="mb-6">
                              <h3 className="font-semibold mb-2">正文</h3>
                              <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: formData.content }} />
                            </div>
                          )}

                          {/* 来源链接 */}
                          {formData.sourceUrl && (
                            <div className="pt-4 border-t">
                              <a 
                                href={formData.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                查看原文链接 →
                              </a>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>

                  <Button
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {mode === 'create' ? '发布资讯' : '保存并提交审核'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    保存草稿
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    asChild
                  >
                    <Link href={returnUrl}>取消</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 使用提示 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">使用提示</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• 标题和正文是必填项</p>
                <p>• 正文支持富文本编辑</p>
                <p>• 发布后需要管理员审核通过才能显示</p>
                <p>• 草稿可以随时保存和编辑</p>
                {user.role === 'admin' && (
                  <p>• 管理员可以设置推荐和热门</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
