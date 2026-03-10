'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, ArrowUpDown
} from 'lucide-react'

interface Tool {
  id: number
  name: string
  description: string
  website: string
  status: string
  view_count: number
  created_at: string
  reject_reason: string | null
  publisher: { id: string; name: string; email: string } | null
  category: { id: number; name: string } | null
  favorite_count: number
  comment_count: number
}

interface Category {
  id: number
  name: string
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
  const { token } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  
  // 筛选状态
  const [statusFilter, setStatusFilter] = useState('pending')
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
    setStatusFilter(value)
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
            <Select value={statusFilter} onValueChange={handleStatusChange}>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewDialog({ open: true, tool })}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          重新审核
                        </Button>
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
    </div>
  )
}
