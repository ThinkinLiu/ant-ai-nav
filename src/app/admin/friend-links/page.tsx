'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Check, 
  X, 
  ExternalLink, 
  Trash2, 
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Pencil
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

const statusConfig = {
  pending: { label: '待审核', color: 'bg-yellow-500' },
  approved: { label: '已通过', color: 'bg-green-500' },
  rejected: { label: '已拒绝', color: 'bg-red-500' },
}

interface FriendLink {
  id: number
  name: string
  url: string
  description: string
  logo: string
  contact_email: string
  contact_name: string
  status: string
  reject_reason: string
  sort_order: number
  created_at: string
}

export default function FriendLinksManagementPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [links, setLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  // 拒绝原因对话框
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // 详情对话框
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<FriendLink | null>(null)

  // 编辑对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    url: '',
    description: '',
    logo: '',
    contact_name: '',
    contact_email: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [page, statusFilter])

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/friend-links?${params}`)
      const result = await response.json()

      if (result.success) {
        setLinks(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取友情链接列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 审核通过
  const handleApprove = async (id: number) => {
    const confirmed = await confirm({
      title: '审核确认',
      description: '确定通过该友情链接的审核吗？',
      confirmText: '通过',
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/friend-links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('审核通过')
        fetchLinks()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('操作失败')
    }
  }

  // 打开拒绝对话框
  const openRejectDialog = (id: number) => {
    setRejectingId(id)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  // 确认拒绝
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('请填写拒绝原因')
      return
    }

    try {
      const response = await fetch(`/api/admin/friend-links/${rejectingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectReason: rejectReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('已拒绝')
        setRejectDialogOpen(false)
        fetchLinks()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 删除
  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除确认',
      description: '确定要删除这条友情链接吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/friend-links/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchLinks()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (link: FriendLink) => {
    setEditingLink(link)
    setEditForm({
      name: link.name,
      url: link.url,
      description: link.description || '',
      logo: link.logo || '',
      contact_name: link.contact_name || '',
      contact_email: link.contact_email || '',
    })
    setEditDialogOpen(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingLink) return
    
    if (!editForm.name.trim()) {
      toast.error('网站名称不能为空')
      return
    }
    
    if (!editForm.url.trim()) {
      toast.error('网站地址不能为空')
      return
    }

    // 验证 URL 格式
    try {
      new URL(editForm.url)
    } catch {
      toast.error('网站地址格式不正确')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/friend-links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('保存成功')
        setEditDialogOpen(false)
        fetchLinks()
      } else {
        toast.error(result.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 调整排序
  const handleSort = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex(l => l.id === id)
    if (currentIndex === -1) return

    const newOrder = direction === 'up' 
      ? links[currentIndex].sort_order - 1 
      : links[currentIndex].sort_order + 1

    try {
      const response = await fetch(`/api/admin/friend-links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: newOrder }),
      })

      const result = await response.json()

      if (result.success) {
        fetchLinks()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 查看详情
  const viewDetail = (link: FriendLink) => {
    setSelectedLink(link)
    setDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>友情链接管理</CardTitle>
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex gap-4 mb-6">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>网站名称</TableHead>
                <TableHead>网址</TableHead>
                <TableHead>联系人</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {link.logo && (
                          <img
                            src={link.logo}
                            alt={link.name}
                            className="w-6 h-6 rounded object-contain"
                          />
                        )}
                        <span className="font-medium">{link.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {link.contact_name && <div>{link.contact_name}</div>}
                        {link.contact_email && (
                          <div className="text-muted-foreground text-xs">{link.contact_email}</div>
                        )}
                        {!link.contact_name && !link.contact_email && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[link.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[link.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(link.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewDetail(link)}
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(link)}
                          title="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {link.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(link.id)}
                              title="通过"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openRejectDialog(link.id)}
                              title="拒绝"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {link.status === 'approved' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSort(link.id, 'up')}
                              title="上移"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSort(link.id, 'down')}
                              title="下移"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(link.id)}
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="py-2 px-4">
                第 {page} / {Math.ceil(total / 20)} 页
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 拒绝原因对话框 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝原因</DialogTitle>
            <DialogDescription>
              请填写拒绝该友情链接的原因，将通知申请人
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">拒绝原因</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="例如：网站内容与AI领域无关"
              rows={4}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              确认拒绝
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>友情链接详情</DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                {selectedLink.logo && (
                  <img
                    src={selectedLink.logo}
                    alt={selectedLink.name}
                    className="w-12 h-12 rounded object-contain border"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{selectedLink.name}</h3>
                  <a
                    href={selectedLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedLink.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              {selectedLink.description && (
                <div>
                  <Label className="text-muted-foreground">网站描述</Label>
                  <p className="text-sm mt-1">{selectedLink.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">联系人</Label>
                  <p className="text-sm mt-1">{selectedLink.contact_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">联系邮箱</Label>
                  <p className="text-sm mt-1">{selectedLink.contact_email || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedLink.status as keyof typeof statusConfig]?.color}>
                      {statusConfig[selectedLink.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">提交时间</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedLink.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedLink.reject_reason && (
                <div>
                  <Label className="text-muted-foreground">拒绝原因</Label>
                  <p className="text-sm mt-1 text-red-600">{selectedLink.reject_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑友情链接</DialogTitle>
            <DialogDescription>
              修改友情链接信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">网站名称 *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="网站名称"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-url">网站地址 *</Label>
              <Input
                id="edit-url"
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-logo">网站Logo</Label>
              <Input
                id="edit-logo"
                value={editForm.logo}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              {editForm.logo && (
                <div className="mt-2">
                  <img
                    src={editForm.logo}
                    alt="Logo预览"
                    className="w-10 h-10 rounded object-contain border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">网站描述</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="网站简介"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contact-name">联系人</Label>
                <Input
                  id="edit-contact-name"
                  value={editForm.contact_name}
                  onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                  placeholder="联系人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact-email">联系邮箱</Label>
                <Input
                  id="edit-contact-email"
                  type="email"
                  value={editForm.contact_email}
                  onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
