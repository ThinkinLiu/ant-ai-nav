'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, Edit, Trash2, Megaphone, Calendar, ExternalLink,
  GripVertical, Save
} from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: number
  title: string
  content: string | null
  link_url: string | null
  is_active: boolean
  sort_order: number
  expire_at: string | null
  created_at: string
  updated_at: string
}

export default function AnnouncementsAdminPage() {
  const { token } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link_url: '',
    is_active: true,
    sort_order: 0,
    expire_at: '',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [token])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setAnnouncements(data.data)
      }
    } catch (error) {
      console.error('获取公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      link_url: announcement.link_url || '',
      is_active: announcement.is_active,
      sort_order: announcement.sort_order,
      expire_at: announcement.expire_at ? announcement.expire_at.slice(0, 16) : '',
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setCurrentAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      link_url: '',
      is_active: true,
      sort_order: announcements.length,
      expire_at: '',
    })
    setAddDialogOpen(true)
  }

  const handleViewDetail = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement)
    setDetailDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('请填写公告标题')
      return
    }

    setSaving(true)
    try {
      const url = currentAnnouncement 
        ? `/api/admin/announcements/${currentAnnouncement.id}`
        : '/api/admin/announcements'
      const method = currentAnnouncement ? 'PUT' : 'POST'

      const body: any = {
        title: formData.title,
        content: formData.content || null,
        link_url: formData.link_url || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        expire_at: formData.expire_at ? new Date(formData.expire_at).toISOString() : null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(currentAnnouncement ? '保存成功' : '创建成功')
        setEditDialogOpen(false)
        setAddDialogOpen(false)
        fetchAnnouncements()
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

  const handleDelete = async (announcement: Announcement) => {
    if (!confirm(`确定要删除公告"${announcement.title}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchAnnouncements()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !announcement.is_active }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(announcement.is_active ? '已下架' : '已上架')
        fetchAnnouncements()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  const formatExpireTime = (expireAt: string | null) => {
    if (!expireAt) return '永久有效'
    const date = new Date(expireAt)
    const now = new Date()
    if (date < now) return '已过期'
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (expireAt: string | null) => {
    if (!expireAt) return false
    return new Date(expireAt) < new Date()
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
          <h1 className="text-2xl font-bold">公告管理</h1>
          <p className="text-muted-foreground mt-1">
            管理首页公告滚动条，支持配置多条公告滚动显示
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加公告
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            公告列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{announcement.title}</span>
                    {announcement.is_active && !isExpired(announcement.expire_at) && (
                      <Badge variant="default">展示中</Badge>
                    )}
                    {!announcement.is_active && (
                      <Badge variant="secondary">已下架</Badge>
                    )}
                    {isExpired(announcement.expire_at) && (
                      <Badge variant="destructive">已过期</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>下架时间: {formatExpireTime(announcement.expire_at)}</span>
                    {announcement.link_url && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          有链接
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={announcement.is_active}
                    onCheckedChange={() => handleToggleActive(announcement)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(announcement)}
                  >
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无公告
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 查看详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>公告详情</DialogTitle>
          </DialogHeader>
          {currentAnnouncement && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">标题</Label>
                <p className="font-medium mt-1">{currentAnnouncement.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">内容</Label>
                <p className="mt-1 whitespace-pre-wrap">{currentAnnouncement.content || '无'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">链接</Label>
                <p className="mt-1">
                  {currentAnnouncement.link_url ? (
                    <a 
                      href={currentAnnouncement.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {currentAnnouncement.link_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : '无'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="mt-1">
                    {currentAnnouncement.is_active ? '已上架' : '已下架'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">下架时间</Label>
                  <p className="mt-1">{formatExpireTime(currentAnnouncement.expire_at)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <p className="mt-1">
                    {new Date(currentAnnouncement.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">更新时间</Label>
                  <p className="mt-1">
                    {new Date(currentAnnouncement.updated_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
            <Button onClick={() => {
              setDetailDialogOpen(false)
              handleEdit(currentAnnouncement!)
            }}>
              编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑公告</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="公告标题"
              />
            </div>

            <div className="space-y-2">
              <Label>内容</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="公告详细内容（可选）"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>链接地址</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="点击公告跳转的链接（可选）"
              />
            </div>

            <div className="space-y-2">
              <Label>下架时间</Label>
              <Input
                type="datetime-local"
                value={formData.expire_at}
                onChange={(e) => setFormData({ ...formData, expire_at: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">留空表示永久有效</p>
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
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">上架显示</Label>
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
            <DialogTitle>添加公告</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="公告标题"
              />
            </div>

            <div className="space-y-2">
              <Label>内容</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="公告详细内容（可选）"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>链接地址</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="点击公告跳转的链接（可选）"
              />
            </div>

            <div className="space-y-2">
              <Label>下架时间</Label>
              <Input
                type="datetime-local"
                value={formData.expire_at}
                onChange={(e) => setFormData({ ...formData, expire_at: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">留空表示永久有效</p>
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
              <Switch
                id="is_active_new"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active_new">上架显示</Label>
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
