'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { X, Plus, Loader2 } from 'lucide-react'
import { categoryConfig } from '@/app/hall-of-fame/config'

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
            <Label htmlFor="photo">头像URL</Label>
            <div className="flex gap-2">
              <Input
                id="photo"
                value={formData.photo}
                onChange={e => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                placeholder="留空将使用默认头像"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={generateAvatar}>
                自动生成
              </Button>
            </div>
            {formData.photo && (
              <div className="mt-2">
                <img
                  src={formData.photo}
                  alt="预览"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
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
            <Label htmlFor="summary">摘要</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="简短介绍（建议50-100字）"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bio">详细简介</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="详细介绍（可选）"
              rows={6}
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
