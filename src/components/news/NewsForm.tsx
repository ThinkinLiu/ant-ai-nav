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
import { MarkdownEditor, MarkdownEditorSimple } from '@/components/ui/markdown-editor'
import { TagInput } from '@/components/ui/tag-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Send, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    category: '',
    tags: [] as string[],
    source: '',
    sourceUrl: '',
    isFeatured: false,
    isHot: false,
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
        setFormData({
          title: news.title || '',
          slug: news.slug || '',
          summary: news.summary || '',
          content: news.content || '',
          coverImage: news.cover_image || '',
          category: news.category || '',
          tags: Array.isArray(news.tags) ? news.tags : [],
          source: news.source || '',
          sourceUrl: news.source_url || '',
          isFeatured: news.is_featured || false,
          isHot: news.is_hot || false,
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
    if (!formData.summary.trim()) {
      toast.error('请填写摘要')
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
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage.trim(),
        category: formData.category,
        tags,
        source: formData.source.trim(),
        sourceUrl: formData.sourceUrl.trim(),
        isFeatured: user.role === 'admin' ? formData.isFeatured : false,
        isHot: user.role === 'admin' ? formData.isHot : false,
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

  // 简单的Markdown渲染
  const renderMarkdown = (text: string) => {
    // 处理标题
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // 处理粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 处理斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 处理链接
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // 处理代码
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // 处理换行
      .replace(/\n/g, '<br />')
    
    return html
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
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={returnUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：主要编辑区域 */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{mode === 'create' ? '新建AI资讯' : '编辑AI资讯'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                  <Label htmlFor="category">分类</Label>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* 摘要 */}
                <div className="space-y-2">
                  <MarkdownEditorSimple
                    value={formData.summary}
                    onChange={(value) => setFormData({ ...formData, summary: value || '' })}
                    placeholder="请输入资讯摘要（建议200字以内），支持Markdown格式"
                    minHeight={120}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.summary.length}/500 字符
                  </p>
                </div>

                {/* 正文内容 */}
                <div className="space-y-2">
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value || '' })}
                    height={500}
                    label="正文内容 *"
                  />
                </div>

                {/* 封面图片 */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">封面图片URL</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.coverImage && (
                    <div className="mt-2">
                      <img
                        src={formData.coverImage}
                        alt="封面预览"
                        className="w-full max-w-md h-40 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
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
                  <p className="text-xs text-muted-foreground">
                    输入标签后按回车或输入逗号（中英文皆可）自动分隔，最多添加 10 个标签
                  </p>
                </div>
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
              {/* 来源信息 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source">来源</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="如: 新浪科技、36氪"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">来源链接</Label>
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

              {/* 操作按钮 */}
              <div className="space-y-3 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={!formData.title && !formData.summary && !formData.content}
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
                          {formData.category && (
                            <span>分类: {categories.find(c => c.slug === formData.category)?.name}</span>
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
                            <p className="text-sm">{formData.summary}</p>
                          </div>
                        )}

                        {/* 正文 */}
                        {formData.content && (
                          <div className="mb-6">
                            <h3 className="font-semibold mb-2">正文</h3>
                            <div 
                              className="prose prose-sm dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }}
                            />
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
              <CardTitle className="text-sm">💡 使用提示</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• 标题和摘要是必填项</p>
              <p>• 正文支持Markdown格式</p>
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
  )
}
