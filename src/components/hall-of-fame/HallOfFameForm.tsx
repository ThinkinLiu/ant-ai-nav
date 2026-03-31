'use client'

import { useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2, Sparkles, Link2, Upload } from 'lucide-react'
import { categoryConfig } from '@/app/hall-of-fame/config'
import ImageUploader from '@/components/ui/image-uploader'

export interface HallOfFameFormData {
  name: string
  nameEn: string
  photo: string
  title: string
  summary: string
  bio: string
  achievements: string[]
  organization: string
  organizationUrl: string
  country: string
  category: string
  tags: string[]
  isFeatured: boolean
  birthYear: number | null
  deathYear: number | null
}

interface HallOfFameFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<HallOfFameFormData>
  id?: number
}

const categoryOptions = Object.entries(categoryConfig).map(([key, value]) => ({
  value: key,
  label: value.label,
  icon: value.icon,
}))

const avatarColors: Record<string, string> = {
  team: '4F46E5',
  pioneer: '4F46E5',
  research: '14B8A6',
  researcher: '3B82F6',
  entrepreneur: 'D97706',
  engineering: '7C3AED',
  engineer: '6366F1',
  vision: 'EF4444',
  nlp: '6366F1',
  robotics: 'D97706',
  education: '10B981',
}

export default function HallOfFameForm({ mode, initialData, id }: HallOfFameFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const [formData, setFormData] = useState<HallOfFameFormData>({
    name: initialData?.name || '',
    nameEn: initialData?.nameEn || '',
    photo: initialData?.photo || '',
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    bio: initialData?.bio || '',
    achievements: initialData?.achievements || [],
    organization: initialData?.organization || '',
    organizationUrl: initialData?.organizationUrl || '',
    country: initialData?.country || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    isFeatured: initialData?.isFeatured || false,
    birthYear: initialData?.birthYear || null,
    deathYear: initialData?.deathYear || null,
  })

  // 自动生成头像
  const generateAvatar = () => {
    const name = formData.nameEn || formData.name
    if (!name) {
      toast.warning('请先填写姓名或英文名')
      return
    }
    const color = avatarColors[formData.category] || '6366F1'
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=256&bold=true`
    setFormData(prev => ({ ...prev, photo: avatarUrl }))
    toast.success('头像已生成')
  }

  // 一键自动生成所有内容
  const handleAutoGenerate = async () => {
    if (!formData.name.trim()) {
      toast.warning('请先输入人物姓名')
      return
    }

    setGenerating(true)
    toast.info('正在搜索并生成信息，请稍候...')

    try {
      const response = await fetch('/api/admin/hall-of-fame/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || undefined,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const data = result.data
        setFormData(prev => ({
          ...prev,
          nameEn: data.nameEn || prev.nameEn,
          photo: data.photo || prev.photo,
          title: data.title || prev.title,
          summary: data.summary || prev.summary,
          bio: data.bio || prev.bio,
          achievements: data.achievements?.length > 0 ? data.achievements : prev.achievements,
          organization: data.organization || prev.organization,
          organizationUrl: data.organizationUrl || prev.organizationUrl,
          country: data.country || prev.country,
          category: data.category || prev.category,
          tags: data.tags?.length > 0 ? data.tags : prev.tags,
          birthYear: data.birthYear || prev.birthYear,
        }))
        toast.success('信息已自动生成，请检查并确认')
      } else {
        toast.error(result.error || '生成失败，请手动填写')
      }
    } catch (error) {
      console.error('自动生成失败:', error)
      toast.error('生成失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

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

  // 添加成就
  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements.includes(newAchievement.trim())) {
      setFormData(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement.trim()] }))
      setNewAchievement('')
    }
  }

  // 移除成就
  const removeAchievement = (achievement: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement),
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category) {
      toast.error('请填写必填字段：姓名和分类')
      return
    }

    setLoading(true)

    try {
      const url = mode === 'create'
        ? '/api/admin/hall-of-fame'
        : `/api/admin/hall-of-fame/${id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nameEn: formData.nameEn,
          photo: formData.photo,
          title: formData.title,
          summary: formData.summary,
          bio: formData.bio,
          achievements: formData.achievements,
          organization: formData.organization,
          organizationUrl: formData.organizationUrl,
          country: formData.country,
          category: formData.category,
          tags: formData.tags,
          isFeatured: formData.isFeatured,
          birthYear: formData.birthYear,
          deathYear: formData.deathYear,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(mode === 'create' ? '创建成功' : '更新成功')
        router.push('/admin/hall-of-fame')
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
      {/* 自动生成提示 */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">智能生成</p>
                <p className="text-sm text-purple-700">输入人物姓名后，点击按钮自动搜索并生成详细信息</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAutoGenerate}
              disabled={generating || !formData.name.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  一键生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：张三"
                required
              />
            </div>
            <div>
              <Label htmlFor="nameEn">英文名</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="例如：Zhang San"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">
              分类 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">头衔/职位</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如：DeepMind CEO"
            />
          </div>

          <div>
            <Label>头像</Label>
            <div className="flex items-start gap-6">
              {/* 图片上传区域 */}
              <ImageUploader
                value={formData.photo}
                onChange={url => setFormData(prev => ({ ...prev, photo: url }))}
                folder="hall-of-fame"
                aspectRatio="circle"
                maxSize={2}
              />
              
              {/* 右侧操作区 */}
              <div className="flex-1 space-y-3">
                {/* 手动输入 URL */}
                <div>
                  <Label htmlFor="photo" className="text-sm text-muted-foreground mb-1.5 block">
                    或输入图片链接
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="photo"
                      value={formData.photo}
                      onChange={e => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                      placeholder="输入图片 URL"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateAvatar} title="自动生成头像">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* 提示信息 */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 点击左侧圆形区域上传图片</p>
                  <p>• 支持 JPG、PNG 格式，最大 2MB</p>
                  <p>• 或输入图片链接，点击 ✨ 自动生成默认头像</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthYear">出生年份</Label>
              <Input
                id="birthYear"
                type="number"
                value={formData.birthYear || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  birthYear: e.target.value ? parseInt(e.target.value) : null,
                }))}
                placeholder="例如：1976"
              />
            </div>
            <div>
              <Label htmlFor="deathYear">逝世年份</Label>
              <Input
                id="deathYear"
                type="number"
                value={formData.deathYear || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  deathYear: e.target.value ? parseInt(e.target.value) : null,
                }))}
                placeholder="已故人士填写"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">国家</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="例如：美国"
            />
          </div>
        </CardContent>
      </Card>

      {/* 详细介绍 */}
      <Card>
        <CardHeader>
          <CardTitle>详细介绍</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <MarkdownEditorSimple
              value={formData.summary}
              onChange={(value) => setFormData(prev => ({ ...prev, summary: value || '' }))}
              placeholder="简短介绍（建议50-100字），支持Markdown格式"
              minHeight={100}
              label="摘要"
            />
          </div>

          <div>
            <MarkdownEditorSimple
              value={formData.bio}
              onChange={(value) => setFormData(prev => ({ ...prev, bio: value || '' }))}
              placeholder="详细介绍（可选），支持Markdown格式"
              minHeight={200}
              label="详细简介"
            />
          </div>

          <div>
            <Label>主要成就</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newAchievement}
                onChange={e => setNewAchievement(e.target.value)}
                placeholder="添加成就"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAchievement()
                  }
                }}
              />
              <Button type="button" onClick={addAchievement} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {achievement}
                  <button
                    type="button"
                    onClick={() => removeAchievement(achievement)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 组织信息 */}
      <Card>
        <CardHeader>
          <CardTitle>组织信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="organization">组织/机构</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="例如：DeepMind"
            />
          </div>

          <div>
            <Label htmlFor="organizationUrl">组织网址</Label>
            <Input
              id="organizationUrl"
              type="url"
              value={formData.organizationUrl}
              onChange={e => setFormData(prev => ({ ...prev, organizationUrl: e.target.value }))}
              placeholder="例如：https://deepmind.com/"
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

      {/* 其他设置 */}
      <Card>
        <CardHeader>
          <CardTitle>其他设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isFeatured">置顶显示</Label>
              <p className="text-sm text-muted-foreground">
                启用后，该人物将在名人堂页面顶部优先展示
              </p>
            </div>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
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
