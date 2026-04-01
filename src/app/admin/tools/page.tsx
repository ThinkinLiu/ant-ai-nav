'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ImageUploader from '@/components/ui/image-uploader'
import { ToolLogo } from '@/components/tools/ToolLogo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import RichTextEditor from '@/components/ui/rich-text-editor'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatRelativeTime } from '@/lib/utils'
import { 
  Check, X, Eye, ExternalLink, Search, EyeOff, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, ArrowUpDown,
  Pin, PinOff, Edit, Loader2, Sparkles, Trash2, Upload, Link2
} from 'lucide-react'

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  long_description: string | null
  website: string
  logo: string | null
  status: string
  view_count: number
  created_at: string
  reject_reason: string | null
  is_pinned: boolean
  is_featured: boolean
  is_free: boolean
  pricing_info: string | null
  publisher: { id: string; name: string; email: string } | null
  category: { id: number; name: string } | null
  tags: { id: number; name: string }[]
  favorite_count: number
  comment_count: number
}

interface Category {
  id: number
  name: string
  color?: string
}

interface Publisher {
  id: string
  name: string | null
  email: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const SORT_OPTIONS = [
  { value: 'created_at', label: '创建时间' },
  { value: 'view_count', label: '浏览量' },
  { value: 'name', label: '名称' },
]

export default function AdminToolsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardContent className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    }>
      <AdminToolsContent />
    </Suspense>
  )
}

function AdminToolsContent() {
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  
  // 筛选状态 - 支持URL参数
  const [statusFilter, setStatusFilter] = useState(() => {
    const status = searchParams.get('status')
    return status === 'all' ? '' : (status || 'pending')
  })
  const [categoryId, setCategoryId] = useState('')
  const [publisherId, setPublisherId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  // 排序状态
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 分页状态
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  
  // 筛选选项
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  
  // 弹窗状态
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; toolId: number | null }>({
    open: false,
    toolId: null,
  })
  const [rejectReason, setRejectReason] = useState('')
  
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; tool: Tool | null }>({
    open: false,
    tool: null,
  })

  // 编辑弹窗状态
  const [editDialog, setEditDialog] = useState<{ open: boolean; tool: Tool | null }>({
    open: false,
    tool: null,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    long_description: '',
    website: '',
    logo: '',
    categoryId: '',
    is_free: true,
    is_featured: false,
    is_pinned: false,
    pricing_info: '',
    tags: '',
  })
  const [logoInputMode, setLogoInputMode] = useState<string>('upload')

  // 删除确认弹窗状态
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tool: Tool | null }>({
    open: false,
    tool: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTools = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy,
        sortOrder,
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (categoryId) params.append('categoryId', categoryId)
      if (publisherId) params.append('publisherId', publisherId)
      if (keyword) params.append('keyword', keyword)
      
      const response = await fetch(`/api/admin/tools?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTools(data.data.data)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
        // 设置筛选选项（仅首次加载）
        if (data.data.filters) {
          setCategories(data.data.filters.categories || [])
          setPublishers(data.data.filters.publishers || [])
        }
      }
    } catch (error) {
      console.error('获取工具列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [token, pagination.page, pagination.pageSize, statusFilter, categoryId, publisherId, keyword, sortBy, sortOrder])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const handleSearch = () => {
    setKeyword(searchInput)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value === 'all' ? '' : value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePublisherChange = (value: string) => {
    setPublisherId(value === 'all' ? '' : value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: string) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: parseInt(size) }))
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      })
      const data = await response.json()
      if (data.success) {
        fetchTools()
      }
    } catch (error) {
      console.error('审核失败:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog.toolId) return

    try {
      const response = await fetch(`/api/tools/${rejectDialog.toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected', rejectReason }),
      })
      const data = await response.json()
      if (data.success) {
        setRejectDialog({ open: false, toolId: null })
        setRejectReason('')
        fetchTools()
      }
    } catch (error) {
      console.error('拒绝失败:', error)
    }
  }

  const handleReReview = async (tool: Tool, newStatus: 'approved' | 'rejected', reason?: string) => {
    try {
      const response = await fetch(`/api/tools/${tool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus, 
          rejectReason: reason || null 
        }),
      })
      const data = await response.json()
      if (data.success) {
        setReviewDialog({ open: false, tool: null })
        fetchTools()
      }
    } catch (error) {
      console.error('重新审核失败:', error)
    }
  }

  const handleTogglePin = async (tool: Tool) => {
    try {
      const response = await fetch(`/api/tools/${tool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          isPinned: !tool.is_pinned
        }),
      })
      const data = await response.json()
      if (data.success) {
        fetchTools()
      }
    } catch (error) {
      console.error('置顶操作失败:', error)
    }
  }

  // 打开编辑弹窗
  const handleOpenEdit = (tool: Tool) => {
    setEditForm({
      name: tool.name || '',
      description: tool.description || '',
      long_description: tool.long_description || '',
      website: tool.website || '',
      logo: tool.logo || '',
      categoryId: tool.category?.id?.toString() || '',
      is_free: tool.is_free ?? true,
      is_featured: tool.is_featured ?? false,
      is_pinned: tool.is_pinned ?? false,
      pricing_info: tool.pricing_info || '',
      tags: tool.tags?.map(t => t.name).join(', ') || '',
    })
    setEditDialog({ open: true, tool })
  }

  // 自动生成工具信息
  const handleGenerateInfo = async () => {
    if (!editForm.name || !editForm.website) {
      return
    }

    setGenerateLoading(true)
    try {
      const response = await fetch('/api/admin/generate-tool-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          website: editForm.website,
        }),
      })
      const data = await response.json()
      
      if (data.success) {
        const result = data.data
        // 找到分类ID
        const categoryMap: Record<string, string> = {
          'AI写作': '1',
          'AI绘画': '2',
          'AI对话': '3',
          'AI编程': '4',
          'AI音频': '5',
          'AI视频': '6',
          'AI办公': '7',
          'AI学习': '8',
        }
        
        setEditForm(prev => ({
          ...prev,
          name: result.name || prev.name,
          description: result.description || prev.description,
          long_description: result.long_description || prev.long_description,
          categoryId: categoryMap[result.category] || prev.categoryId,
          tags: result.tags?.join(', ') || prev.tags,
          is_free: result.is_free ?? prev.is_free,
          pricing_info: result.pricing_info || prev.pricing_info,
        }))
      }
    } catch (error) {
      console.error('自动生成失败:', error)
    } finally {
      setGenerateLoading(false)
    }
  }

  // 提交编辑
  const handleEditSubmit = async () => {
    if (!editDialog.tool) return
    setEditLoading(true)
    try {
      const response = await fetch(`/api/tools/${editDialog.tool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          long_description: editForm.long_description || null,
          website: editForm.website,
          logo: editForm.logo || null,
          categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : null,
          is_free: editForm.is_free,
          is_featured: editForm.is_featured,
          isPinned: editForm.is_pinned,
          pricing_info: editForm.pricing_info || null,
          tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setEditDialog({ open: false, tool: null })
        fetchTools()
      }
    } catch (error) {
      console.error('编辑失败:', error)
    } finally {
      setEditLoading(false)
    }
  }

  // 删除工具
  const handleDelete = async () => {
    if (!deleteDialog.tool) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/tools/${deleteDialog.tool.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDeleteDialog({ open: false, tool: null })
        fetchTools()
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">已通过</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">待审核</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">已拒绝</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            工具审核
            <Badge variant="secondary">{pagination.total} 条</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 筛选栏 */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
            {/* 状态筛选 */}
            <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="all">全部</SelectItem>
              </SelectContent>
            </Select>

            {/* 分类筛选 */}
            <Select value={categoryId || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 发布者筛选 */}
            <Select value={publisherId || 'all'} onValueChange={handlePublisherChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="全部发布者" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部发布者</SelectItem>
                {publishers.map(pub => (
                  <SelectItem key={pub.id} value={pub.id}>{pub.name || pub.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 排序 */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </Button>

            {/* 搜索框 */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Input
                  placeholder="搜索工具名称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-48"
                />
              </div>
              <Button onClick={handleSearch} size="default">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 每页数量 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每页</span>
              <Select value={pagination.pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 工具列表 */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        {tool.is_pinned && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            <Pin className="h-3 w-3 mr-1" />
                            置顶
                          </Badge>
                        )}
                        {getStatusBadge(tool.status)}
                        {tool.category && (
                          <Badge variant="outline" className="text-xs">{tool.category.name}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {tool.description}
                      </p>
                      
                      {/* 统计数据 */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>👀 {tool.view_count || 0} 浏览</span>
                        <span>⭐ {tool.favorite_count} 收藏</span>
                        <span>💬 {tool.comment_count} 评论</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>发布者：{tool.publisher?.name || '未知'}</span>
                        <span>{formatRelativeTime(tool.created_at)}</span>
                        {tool.reject_reason && (
                          <span className="text-red-500">拒绝原因：{tool.reject_reason}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" asChild title="访问官网">
                        <a href={tool.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild title="预览详情">
                        <a href={`/tools/${tool.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="编辑"
                        onClick={() => handleOpenEdit(tool)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="删除"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, tool })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      {tool.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(tool.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectDialog({ open: true, toolId: tool.id })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </>
                      )}
                      
                      {(tool.status === 'approved' || tool.status === 'rejected') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewDialog({ open: true, tool })}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            重新审核
                          </Button>
                          {tool.status === 'approved' && (
                            <Button
                              size="sm"
                              variant={tool.is_pinned ? "secondary" : "outline"}
                              onClick={() => handleTogglePin(tool)}
                              title={tool.is_pinned ? "取消置顶" : "置顶显示"}
                            >
                              {tool.is_pinned ? (
                                <>
                                  <PinOff className="h-4 w-4 mr-1" />
                                  取消置顶
                                </>
                              ) : (
                                <>
                                  <Pin className="h-4 w-4 mr-1" />
                                  置顶
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                共 {pagination.total} 条，第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 拒绝弹窗 */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, toolId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝理由</DialogTitle>
            <DialogDescription>
              请填写拒绝该工具的理由，将反馈给发布者。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入拒绝理由..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, toolId: null })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重新审核弹窗 */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, tool: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重新审核</DialogTitle>
            <DialogDescription>
              该工具当前状态：<strong>{reviewDialog.tool?.status === 'approved' ? '已通过' : '已拒绝'}</strong>
              {reviewDialog.tool?.reject_reason && (
                <span className="block mt-1 text-red-500">拒绝原因：{reviewDialog.tool.reject_reason}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">{reviewDialog.tool?.name}</p>
            <p className="text-sm text-muted-foreground mb-4">{reviewDialog.tool?.description}</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, tool: null })}>
              取消
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleReReview(reviewDialog.tool!, 'rejected')}
            >
              拒绝
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleReReview(reviewDialog.tool!, 'approved')}
            >
              通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, tool: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑工具</DialogTitle>
            <DialogDescription>
              编辑工具信息，修改后点击保存。
            </DialogDescription>
          </DialogHeader>
          
          {/* 自动生成区域 */}
          <div className="bg-muted/50 rounded-lg p-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="flex-1 text-sm text-muted-foreground">
                输入工具名称和链接后，点击"自动生成"可自动填充其他信息
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInfo}
                disabled={generateLoading || !editForm.name || !editForm.website}
                className="shrink-0"
              >
                {generateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    自动生成
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">工具名称 *</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="请输入工具名称"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">官网地址 *</label>
                <Input
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">简介 *</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="请输入工具简介"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">详细介绍</label>
              <p className="text-xs text-muted-foreground">
                支持富文本编辑，可从微信、百度等网站直接复制图文粘贴
              </p>
              <RichTextEditor
                value={editForm.long_description}
                onChange={(value) => setEditForm({ ...editForm, long_description: value })}
                placeholder="请输入详细介绍（可选）"
                minHeight={150}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">分类</label>
                <Select 
                  value={editForm.categoryId} 
                  onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Logo 上传/URL 输入 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">工具图标</label>
              
              {/* 图标预览 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 bg-muted">
                  <ToolLogo
                    logo={editForm.logo || null}
                    name={editForm.name || '工具'}
                    website={editForm.website}
                    className="w-full h-full object-cover"
                    size={64}
                    fallbackBgColor={categories.find(c => c.id.toString() === editForm.categoryId)?.color}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>图标预览（与首页显示一致）</p>
                  <p className="text-xs">为空时自动使用网站图标服务生成</p>
                </div>
              </div>

              {/* 输入方式切换 */}
              <Tabs value={logoInputMode} onValueChange={setLogoInputMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    上传图片
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    输入 URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <ImageUploader
                    value={editForm.logo}
                    onChange={(url) => setEditForm({ ...editForm, logo: url })}
                    folder="logos"
                    aspectRatio="square"
                    maxSize={2}
                    placeholder="点击上传图标"
                  />
                </TabsContent>
                
                <TabsContent value="url" className="mt-4">
                  <Input
                    value={editForm.logo}
                    onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    输入图标的完整 URL 地址
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">标签</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="多个标签用逗号分隔，如：AI写作, 文案, GPT"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">价格信息</label>
              <Input
                value={editForm.pricing_info}
                onChange={(e) => setEditForm({ ...editForm, pricing_info: e.target.value })}
                placeholder="如：免费 / ¥99/月 / 按量计费"
              />
            </div>
            
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_free}
                  onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">免费工具</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">精选推荐</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_pinned}
                  onChange={(e) => setEditForm({ ...editForm, is_pinned: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">置顶显示</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, tool: null })}>
              取消
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, tool: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除该工具吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-1">{deleteDialog.tool?.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{deleteDialog.tool?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, tool: null })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
