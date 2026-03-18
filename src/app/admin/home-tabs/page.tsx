'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, Edit, Trash2, GripVertical, Save, LayoutGrid,
  Flame, Globe, Home, Star, Eye, EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface Tab {
  id: number
  name: string
  slug: string
  type: string
  source_id: number | null
  icon: string | null
  color: string | null
  sort_order: number
  is_default: boolean
  is_system: boolean
  is_visible: boolean
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

const TAB_TYPES = [
  { value: 'hot_tools', label: '火爆工具', description: '按浏览量排序的热门工具' },
  { value: 'domestic_tools', label: '国内火爆', description: '国内热门AI工具' },
  { value: 'foreign_tools', label: '国外火爆', description: '国外热门AI工具' },
  { value: 'lobster_tools', label: '龙虾专区', description: '名称包含"龙虾"或"OpenClaw"的工具' },
  { value: 'category', label: '分类工具', description: '指定分类下的工具' },
  { value: 'tag', label: '标签工具', description: '指定标签下的工具' },
  { value: 'news', label: 'AI资讯', description: 'AI资讯列表' },
  { value: 'fame', label: 'AI名人堂', description: 'AI名人堂列表' },
  { value: 'timeline', label: 'AI大事纪', description: 'AI大事纪列表' },
  { value: 'ranking', label: 'AI排行榜', description: 'AI排行榜列表' },
]

const ICON_OPTIONS = [
  { value: 'Flame', label: '火焰', icon: Flame },
  { value: 'Globe', label: '地球', icon: Globe },
  { value: 'Home', label: '首页', icon: Home },
  { value: 'Star', label: '星星', icon: Star },
]

export default function HomeTabsAdminPage() {
  const { token } = useAuth()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'category',
    source_id: '',
    icon: 'Star',
    color: '#6366F1',
    sort_order: 0,
    is_default: false,
    is_visible: true,
  })

  useEffect(() => {
    fetchTabs()
    fetchCategories()
    fetchTags()
  }, [token])

  const fetchTabs = async () => {
    try {
      const response = await fetch('/api/admin/home-tabs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTabs(data.data)
      }
    } catch (error) {
      console.error('获取Tab配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const handleEdit = (tab: Tab) => {
    setCurrentTab(tab)
    setFormData({
      name: tab.name,
      slug: tab.slug,
      type: tab.type,
      source_id: tab.source_id?.toString() || '',
      icon: tab.icon || 'Star',
      color: tab.color || '#6366F1',
      sort_order: tab.sort_order,
      is_default: tab.is_default,
      is_visible: tab.is_visible,
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setCurrentTab(null)
    setFormData({
      name: '',
      slug: '',
      type: 'category',
      source_id: '',
      icon: 'Star',
      color: '#6366F1',
      sort_order: tabs.length,
      is_default: false,
      is_visible: true,
    })
    setAddDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('请填写必填项')
      return
    }

    // 类型为分类或标签时，必须选择数据源
    if ((formData.type === 'category' || formData.type === 'tag') && !formData.source_id) {
      toast.error('请选择数据源')
      return
    }

    setSaving(true)
    try {
      const url = currentTab 
        ? `/api/admin/home-tabs/${currentTab.id}`
        : '/api/admin/home-tabs'
      const method = currentTab ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          source_id: formData.source_id ? parseInt(formData.source_id) : null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(currentTab ? '保存成功' : '创建成功')
        setEditDialogOpen(false)
        setAddDialogOpen(false)
        fetchTabs()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tab: Tab) => {
    if (tab.is_system) {
      toast.error('系统默认Tab不能删除')
      return
    }

    if (!confirm(`确定要删除"${tab.name}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/home-tabs/${tab.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchTabs()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const toggleVisibility = async (tab: Tab) => {
    try {
      const response = await fetch(`/api/admin/home-tabs/${tab.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tab,
          is_visible: !tab.is_visible,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(tab.is_visible ? '已隐藏' : '已显示')
        fetchTabs()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('切换显示状态失败:', error)
      toast.error('操作失败')
    }
  }

  const getTypeLabel = (type: string) => {
    return TAB_TYPES.find(t => t.value === type)?.label || type
  }

  const getSourceName = (tab: Tab) => {
    if (tab.type === 'category' && tab.source_id) {
      return categories.find(c => c.id === tab.source_id)?.name || ''
    }
    if (tab.type === 'tag' && tab.source_id) {
      return tags.find(t => t.id === tab.source_id)?.name || ''
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">首页Tab管理</h1>
          <p className="text-muted-foreground mt-1">
            管理首页展示的Tab配置，可添加、编辑、删除Tab
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加Tab
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Tab列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${!tab.is_visible ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tab.name}</span>
                    {tab.is_default && (
                      <Badge variant="default">默认</Badge>
                    )}
                    {tab.is_system && (
                      <Badge variant="secondary">系统</Badge>
                    )}
                    {!tab.is_visible && (
                      <Badge variant="outline" className="text-muted-foreground">已隐藏</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>类型: {getTypeLabel(tab.type)}</span>
                    {getSourceName(tab) && (
                      <>
                        <span>•</span>
                        <span>数据源: {getSourceName(tab)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>排序: {tab.sort_order}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(tab)}
                    title={tab.is_visible ? '点击隐藏' : '点击显示'}
                  >
                    {tab.is_visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tab)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!tab.is_system && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tab)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {tabs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无Tab配置
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tab名称"
              />
            </div>

            {currentTab && !currentTab.is_system && (
              <>
                <div className="space-y-2">
                  <Label>类型 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value, source_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAB_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'category' || formData.type === 'tag') && (
                  <div className="space-y-2">
                    <Label>数据源 *</Label>
                    <Select
                      value={formData.source_id}
                      onValueChange={(value) => setFormData({ ...formData, source_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择数据源" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.type === 'category' ? (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          tags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              {tag.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>图标</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <icon.icon className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_default">设为默认Tab</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_visible">在首页显示</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tab名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
            </div>

            <div className="space-y-2">
              <Label>类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, source_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.type === 'category' || formData.type === 'tag') && (
              <div className="space-y-2">
                <Label>数据源 *</Label>
                <Select
                  value={formData.source_id}
                  onValueChange={(value) => setFormData({ ...formData, source_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据源" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === 'category' ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          {tag.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>图标</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <icon.icon className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default_new"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_default_new">设为默认Tab</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible_new"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_visible_new">在首页显示</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
