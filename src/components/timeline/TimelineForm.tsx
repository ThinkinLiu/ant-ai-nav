'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownEditorSimple } from '@/components/ui/markdown-editor'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2 } from 'lucide-react'
import { categoryConfig, importanceConfig } from '@/app/timeline/config'

export interface TimelineFormData {
  year: number | null
  month: number | null
  day: number | null
  title: string
  titleEn: string
  description: string
  category: string
  importance: string
  icon: string
  image: string
  relatedPersonId: number | null
  relatedUrl: string
  tags: string[]
}

interface TimelineFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<TimelineFormData>
  id?: number
}

export default function TimelineForm({ mode, initialData, id }: TimelineFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [people, setPeople] = useState<Array<{ id: number; name: string; name_en: string }>>([])

  const [formData, setFormData] = useState<TimelineFormData>({
    year: initialData?.year || null,
    month: initialData?.month || null,
    day: initialData?.day || null,
    title: initialData?.title || '',
    titleEn: initialData?.titleEn || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    importance: initialData?.importance || '',
    icon: initialData?.icon || '',
    image: initialData?.image || '',
    relatedPersonId: initialData?.relatedPersonId || null,
    relatedUrl: initialData?.relatedUrl || '',
    tags: initialData?.tags || [],
  })

  // 加载名人列表（用于关联人物）
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('/api/hall-of-fame?limit=200')
        const result = await response.json()
        if (result.success) {
          setPeople(result.data.data || [])
        }
      } catch (error) {
        console.error('加载名人列表失败:', error)
      }
    }
    fetchPeople()
  }, [])

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.year || !formData.title || !formData.description) {
      toast.error('请填写必填字段：年份、标题和描述')
      return
    }

    // 验证年份不能是未来
    const currentYear = new Date().getFullYear()
    if (formData.year > currentYear) {
      toast.error('年份不能是未来年份')
      return
    }

    setLoading(true)

    try {
      const url = mode === 'create'
        ? '/api/admin/timeline'
        : `/api/admin/timeline/${id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: formData.year,
          month: formData.month,
          day: formData.day,
          title: formData.title,
          titleEn: formData.titleEn,
          description: formData.description,
          category: formData.category,
          importance: formData.importance,
          icon: formData.icon,
          image: formData.image,
          relatedPersonId: formData.relatedPersonId,
          relatedUrl: formData.relatedUrl,
          tags: formData.tags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(mode === 'create' ? '创建成功' : '更新成功')
        router.push('/admin/timeline')
        router.refresh()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      toast.error('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">
                年份 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                value={formData.year || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  year: e.target.value ? parseInt(e.target.value) : null,
                }))}
                placeholder="例如：2023"
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label htmlFor="month">月份</Label>
              <Input
                id="month"
                type="number"
                value={formData.month || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  month: e.target.value ? parseInt(e.target.value) : null,
                }))}
                placeholder="1-12"
                min="1"
                max="12"
              />
            </div>
            <div>
              <Label htmlFor="day">日期</Label>
              <Input
                id="day"
                type="number"
                value={formData.day || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  day: e.target.value ? parseInt(e.target.value) : null,
                }))}
                placeholder="1-31"
                min="1"
                max="31"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">
                标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="事件标题"
                required
              />
            </div>
            <div>
              <Label htmlFor="titleEn">英文标题</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={e => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder="Event Title"
              />
            </div>
          </div>

          <div>
            <MarkdownEditorSimple
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value || '' }))}
              placeholder="详细描述这个事件...支持Markdown格式"
              minHeight={150}
              label={`描述 <span class="text-red-500">*</span>`}
            />
          </div>

          <div>
            <Label htmlFor="icon">图标</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="icon"
                value={formData.icon}
                onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="emoji图标，如 🚀"
                className="flex-1"
              />
              <div className="text-2xl w-10 h-10 flex items-center justify-center border rounded">
                {formData.icon || '📌'}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              常用图标：🧠 💡 🚀 🔬 📚 🎨 💻 🏢 💬 👁️ 🔑 🔮
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 分类和重要性 */}
      <Card>
        <CardHeader>
          <CardTitle>分类和重要性</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">分类</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.icon} {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="importance">重要性</Label>
              <Select
                value={formData.importance}
                onValueChange={value => setFormData(prev => ({ ...prev, importance: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择重要性" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无</SelectItem>
                  {Object.entries(importanceConfig).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关联信息 */}
      <Card>
        <CardHeader>
          <CardTitle>关联信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="relatedPersonId">关联人物</Label>
            <Select
              value={formData.relatedPersonId?.toString() || 'none'}
              onValueChange={value => setFormData(prev => ({
                ...prev,
                relatedPersonId: value === 'none' ? null : parseInt(value),
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择相关人物" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.name} {person.name_en && `(${person.name_en})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="relatedUrl">相关链接</Label>
            <Input
              id="relatedUrl"
              type="url"
              value={formData.relatedUrl}
              onChange={e => setFormData(prev => ({ ...prev, relatedUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="image">图片URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="事件相关图片（可选）"
            />
          </div>
        </CardContent>
      </Card>

      {/* 标签 */}
      <Card>
        <CardHeader>
          <CardTitle>标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="添加标签"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? '创建' : '保存'}
        </Button>
      </div>
    </form>
  )
}
