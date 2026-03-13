'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { ArrowLeft, Save } from 'lucide-react'

const categoryOptions = [
  { value: 'industry', label: '行业动态' },
  { value: 'research', label: '学术研究' },
  { value: 'product', label: '产品发布' },
  { value: 'tutorial', label: '教程指南' },
  { value: 'other', label: '其他' },
]

export default function NewNewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!user) return

    if (!formData.title || !formData.summary || !formData.content) {
      alert('请填写标题、摘要和正文内容')
      return
    }

    setLoading(true)
    try {
      const slug = formData.slug || generateSlug(formData.title)
      const tags = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          tags,
          authorId: user.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 如果不是草稿，提交审核
        if (!isDraft && result.data.id) {
          await fetch(`/api/news/${result.data.id}/review`, {
            method: 'PUT',
          })
        }
        router.push('/admin/news')
      } else {
        alert(result.error || '创建失败')
      }
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'publisher')) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新建AI资讯</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setFormData({
                      ...formData,
                      title,
                      slug: formData.slug || generateSlug(title),
                    })
                  }}
                  placeholder="请输入资讯标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL路径)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="自动生成或手动输入"
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">摘要 *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="请输入资讯摘要（200字以内）"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">正文内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入正文内容（支持Markdown）"
                rows={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图片</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="封面图片URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">来源</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="资讯来源"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">来源链接</Label>
              <Input
                id="sourceUrl"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="原文链接"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                保存草稿
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                提交审核
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
