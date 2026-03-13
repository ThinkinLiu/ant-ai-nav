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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Send } from 'lucide-react'

const categoryOptions = [
  { value: 'industry', label: '行业动态' },
  { value: 'research', label: '学术研究' },
  { value: 'product', label: '产品发布' },
  { value: 'tutorial', label: '教程指南' },
  { value: 'other', label: '其他' },
]

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
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    source: '',
    sourceUrl: '',
    isFeatured: false,
    isPinned: false,
  })

  // 编辑模式：加载现有数据
  useEffect(() => {
    if (mode === 'edit' && newsId) {
      fetchNews()
    }
  }, [mode, newsId])

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
          tags: Array.isArray(news.tags) ? news.tags.join(', ') : '',
          source: news.source || '',
          sourceUrl: news.source_url || '',
          isFeatured: news.is_featured || false,
          isPinned: news.is_pinned || false,
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
      const tags = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

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
        isPinned: user.role === 'admin' ? formData.isPinned : false,
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
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 摘要 */}
                <div className="space-y-2">
                  <Label htmlFor="summary">摘要 *</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="请输入资讯摘要（建议200字以内）"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.summary.length}/500 字符
                  </p>
                </div>

                {/* 正文内容 */}
                <div className="space-y-2">
                  <Label htmlFor="content">正文内容 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="请输入正文内容&#10;&#10;支持Markdown格式：&#10;- # 标题&#10;- **粗体**&#10;- *斜体*&#10;- [链接](url)&#10;- `代码`"
                    rows={20}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    支持Markdown格式
                  </p>
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
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="多个标签用逗号分隔，如: AI, GPT, 大模型"
                  />
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
                      <Label>置顶文章</Label>
                      <p className="text-xs text-muted-foreground">
                        置顶显示在列表最前面
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPinned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPinned: checked })
                      }
                    />
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-3 pt-4 border-t">
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
                <p>• 管理员可以设置推荐和置顶</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
