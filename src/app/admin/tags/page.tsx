'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, Edit, Trash2, Save, Tag, Search, X
} from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  toolCount?: number
}

export default function TagsAdminPage() {
  const { token } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<Tag | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    fetchTags()
  }, [token])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(tags)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTags(tags.filter(tag => 
        tag.name.toLowerCase().includes(query) || 
        tag.slug.toLowerCase().includes(query)
      ))
    }
  }, [searchQuery, tags])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
        setFilteredTags(data.data)
      }
    } catch (error) {
      console.error('获取标签失败:', error)
      toast.error('获取标签失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tag: Tag) => {
    setCurrentTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setCurrentTag(null)
    setFormData({
      name: '',
      slug: '',
    })
    setAddDialogOpen(true)
  }

  // 自动生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name),
    })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('请填写必填项')
      return
    }

    setSaving(true)
    try {
      const url = currentTag 
        ? `/api/admin/tags/${currentTag.id}`
        : '/api/admin/tags'
      const method = currentTag ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(currentTag ? '保存成功' : '创建成功')
        setEditDialogOpen(false)
        setAddDialogOpen(false)
        fetchTags()
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

  const handleDelete = async (tag: Tag) => {
    // 检查是否有关联的工具
    if (tag.toolCount && tag.toolCount > 0) {
      if (!confirm(`标签"${tag.name}"关联了 ${tag.toolCount} 个工具，删除后关联将解除。确定要删除吗？`)) {
        return
      }
    } else {
      if (!confirm(`确定要删除标签"${tag.name}"吗？`)) {
        return
      }
    }

    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchTags()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
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
          <h1 className="text-2xl font-bold">标签管理</h1>
          <p className="text-muted-foreground mt-1">
            管理工具标签，支持添加、编辑、删除标签
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加标签
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索标签名称或标识..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            标签列表
            <Badge variant="secondary" className="ml-2">
              共 {tags.length} 个标签
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tag.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {tag.slug}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>关联工具: {tag.toolCount || 0} 个</span>
                    <span>•</span>
                    <span>ID: {tag.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredTags.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? '没有找到匹配的标签' : '暂无标签'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="标签名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
              <p className="text-xs text-muted-foreground">
                用于URL路径，建议使用英文或拼音
              </p>
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
            <DialogTitle>添加标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="标签名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
              <p className="text-xs text-muted-foreground">
                用于URL路径，建议使用英文或拼音
              </p>
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
