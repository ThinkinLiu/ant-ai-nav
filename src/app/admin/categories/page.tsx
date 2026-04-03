'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  AlertCircle,
  Layers,
  ExternalLink
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
  toolCount: number
  is_default: boolean
  created_at: string
}

const defaultCategories = [
  { name: '文本写作', color: '3B82F6', icon: '✍️' },
  { name: '图像生成', color: 'EC4899', icon: '🎨' },
  { name: '对话聊天', color: '10B981', icon: '💬' },
  { name: '编程开发', color: 'F59E0B', icon: '👨‍💻' },
  { name: '音频处理', color: '8B5CF6', icon: '🎵' },
  { name: '视频处理', color: 'EF4444', icon: '🎬' },
  { name: '办公效率', color: '06B6D4', icon: '📊' },
  { name: '学习研究', color: '6366F1', icon: '📚' },
]

export default function CategoriesManagementPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // 编辑/新增对话框
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '6366F1',
    sort_order: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        toast.error(result.error || '获取分类失败')
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      toast.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '6366F1',
      sort_order: categories.length + 1,
      is_active: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '6366F1',
      sort_order: category.sort_order || 0,
      is_active: category.is_active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }

    if (!formData.slug.trim()) {
      toast.error('请输入分类标识')
      return
    }

    // 验证 slug 格式（只允许字母、数字、连字符）
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(formData.slug)) {
      toast.error('分类标识只能包含小写字母、数字和连字符')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        // 更新
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            ...formData,
          }),
        })
        const result = await response.json()

        if (result.success) {
          toast.success('更新成功')
          setDialogOpen(false)
          fetchCategories()
        } else {
          toast.error(result.error || '更新失败')
        }
      } else {
        // 新增
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const result = await response.json()

        if (result.success) {
          toast.success('创建成功')
          setDialogOpen(false)
          fetchCategories()
        } else {
          toast.error(result.error || '创建失败')
        }
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (category.is_default) {
      toast.error('默认分类不能删除')
      return
    }

    if (category.toolCount > 0) {
      toast.error('该分类下还有工具，无法删除')
      return
    }

    const confirmed = await confirm({
      title: '确认删除',
      description: `确定要删除分类「${category.name}」吗？此操作不可撤销。`,
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchCategories()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除失败')
    }
  }

  // 自动生成 slug
  const generateSlug = (name: string) => {
    const slugMap: Record<string, string> = {
      '文本写作': 'text-writing',
      '图像生成': 'image-generation',
      '对话聊天': 'chatbot',
      '编程开发': 'code',
      '音频处理': 'audio',
      '视频处理': 'video',
      '办公效率': 'productivity',
      '学习研究': 'education',
      '营销推广': 'marketing',
      '数据分析': 'data-analysis',
    }
    
    if (slugMap[name]) return slugMap[name]
    
    // 简单的拼音转换
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            分类管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理工具分类，支持新增、编辑和删除
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          新增分类
        </Button>
      </div>

      {/* 提示信息 */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">注意事项</p>
              <ul className="mt-1 list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                <li>前 8 个分类为系统默认分类，不支持删除</li>
                <li>如果分类下还有工具，无法删除</li>
                <li>分类标识（slug）只能包含小写字母、数字和连字符</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分类列表 */}
      <Card>
        <CardHeader>
          <CardTitle>分类列表</CardTitle>
          <CardDescription>
            共 {categories.length} 个分类
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>图标</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-center">工具数</TableHead>
                  <TableHead className="text-center">排序</TableHead>
                  <TableHead className="text-center">状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.is_default && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `#${category.color || '6366F1'}` }}
                          title="默认分类"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `#${category.color || '6366F1'}20` }}
                      >
                        {category.icon || '📁'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.is_default && (
                          <Badge variant="outline" className="text-xs">默认</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.toolCount > 0 ? (
                        <Link href={`/?categoryId=${category.id}`}>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            title="点击查看该分类的工具"
                          >
                            {category.toolCount}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Badge>
                        </Link>
                      ) : (
                        <Badge variant="secondary">
                          0
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.sort_order}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.is_active ? (
                        <Badge className="bg-green-100 text-green-700">启用</Badge>
                      ) : (
                        <Badge variant="secondary">禁用</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={category.is_default || category.toolCount > 0}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑/新增对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑分类' : '新增分类'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? '修改分类信息' 
                : '创建新的工具分类'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name),
                    }))
                  }}
                  placeholder="例如：文本写作"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">标识 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="例如：text-writing"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="分类的简短描述"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="例如：✍️"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">颜色</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="6366F1"
                    className="flex-1"
                  />
                  <div 
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: `#${formData.color}` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">启用状态</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : (editingCategory ? '保存' : '创建')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {ConfirmDialog}
    </div>
  )
}
