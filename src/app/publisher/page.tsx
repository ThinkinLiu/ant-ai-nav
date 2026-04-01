'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'
import { Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, MessageCircle, Heart, X, Filter, Check, XCircle, Clock, Search } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

interface Category {
  id: number
  name: string
  slug: string
}

interface Tool {
  id: number
  name: string
  description: string
  status: string
  view_count: number
  favorite_count: number
  comment_count: number
  created_at: string
  is_featured: boolean
  reject_reason: string | null
  category: { id: number; name: string } | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

type SortField = 'created_at' | 'view_count' | 'favorite_count' | 'comment_count'
type SortOrder = 'asc' | 'desc'
type StatusFilter = '' | 'pending' | 'approved' | 'rejected'
type CategoryFilter = '' | number

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: '发布时间' },
  { value: 'view_count', label: '浏览量' },
  { value: 'favorite_count', label: '收藏量' },
  { value: 'comment_count', label: '评论量' },
]

const STATUS_LABELS: Record<StatusFilter, string> = {
  '': '全部',
  'pending': '待审核',
  'approved': '已通过',
  'rejected': '已拒绝',
}

export default function PublisherDashboard() {
  const { user, token } = useAuth()
  const { confirm, ConfirmDialog } = useConfirm()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  
  // 分类列表
  const [categories, setCategories] = useState<Category[]>([])
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // 排序状态
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  
  // 分类筛选
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('')
  
  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // 输入框的值，用于防抖

  // 审批对话框状态
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('approved')
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin'
  const [isActiveTab, setIsActiveTab] = useState<'tools' | 'news'>('tools') // 当前激活的Tab
  
  // 设置当前页面为工具Tab
  useEffect(() => {
    setIsActiveTab('tools')
  }, [])

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/publisher/stats?publisherId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取工具列表（带分页、排序、状态筛选、搜索和分类过滤）
  const fetchMyTools = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        publisherId: user.id,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
      })
      
      // 如果有状态筛选，添加到参数中
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      
      // 如果有分类筛选，添加到参数中
      if (categoryFilter) {
        params.append('categoryId', categoryFilter.toString())
      }
      
      // 如果有搜索关键词，添加到参数中
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/tools?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTools(data.data.data)
        setTotalItems(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('获取工具列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (user && token) {
      fetchStats()
      fetchCategories()
    }
  }, [user, token])

  // 分页、排序或筛选变化时重新获取数据
  useEffect(() => {
    if (user && token) {
      fetchMyTools()
    }
  }, [user, token, currentPage, pageSize, sortField, sortOrder, statusFilter, categoryFilter, searchQuery])

  // 每页记录数变化时，重置到第一页
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value))
    setCurrentPage(1)
  }

  // 排序字段变化
  const handleSortFieldChange = (value: string) => {
    setSortField(value as SortField)
    setCurrentPage(1)
  }

  // 切换排序方向
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  // 状态筛选
  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // 分类筛选
  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId === 'all' ? '' : categoryId ? parseInt(categoryId) : '')
    setCurrentPage(1)
  }

  // 搜索处理
  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  // 清除筛选
  const clearFilter = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setSearchQuery('')
    setSearchInput('')
    setCurrentPage(1)
  }

  // 分页导航
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // 打开审批对话框
  const openApproveDialog = (tool: Tool, targetStatus: 'pending' | 'approved' | 'rejected') => {
    setSelectedTool(tool)
    setNewStatus(targetStatus)
    setRejectReason(tool.reject_reason || '')
    setApproveDialogOpen(true)
  }

  // 提交审批
  const handleApprove = async () => {
    if (!selectedTool) return
    
    // 如果是拒绝，必须填写原因
    if (newStatus === 'rejected' && !rejectReason.trim()) {
      toast.error('请填写拒绝原因')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/tools/${selectedTool.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          rejectReason: newStatus === 'rejected' ? rejectReason : null,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('操作成功')
        setApproveDialogOpen(false)
        fetchStats()
        fetchMyTools()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('审批失败:', error)
      toast.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除确认',
      description: '确定要删除这个工具吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        // 重新获取统计数据和工具列表
        fetchStats()
        fetchMyTools()
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  if (loading && tools.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 检查用户权限
  if (user?.role !== 'publisher' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">需要发布者权限</h2>
        <p className="text-muted-foreground mb-6">
          您还不是发布者，请联系管理员申请发布者权限。
        </p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {ConfirmDialog}
      
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">发布者中心</h1>
          <p className="text-muted-foreground mt-1">
            管理和发布您的AI工具与资讯
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={isActiveTab === 'tools' ? 'default' : 'outline'} asChild>
            <Link href="/publisher">
              工具管理
            </Link>
          </Button>
          <Button variant={isActiveTab === 'news' ? 'default' : 'outline'} asChild>
            <Link href="/publisher/news">
              资讯管理
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === '' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
          onClick={() => handleStatusFilter('')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">总发布数</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
          onClick={() => handleStatusFilter('pending')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">待审核</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'approved' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}
          onClick={() => handleStatusFilter('approved')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">已通过</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'rejected' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20' : ''}`}
          onClick={() => handleStatusFilter('rejected')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">已拒绝</p>
          </CardContent>
        </Card>
      </div>

      {/* Tools List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            我的工具
            {(statusFilter || categoryFilter || searchQuery) && (
              <Badge variant="secondary" className="font-normal">
                <Filter className="h-3 w-3 mr-1" />
                {statusFilter && STATUS_LABELS[statusFilter]}
                {categoryFilter && ` · ${categories.find(c => c.id === categoryFilter)?.name}`}
                {searchQuery && ` · "${searchQuery}"`}
                <button onClick={clearFilter} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </CardTitle>
          <Button asChild>
            <Link href="/publisher/tools/new">
              <Plus className="mr-2 h-4 w-4" />
              发布新工具
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tools.length > 0 ? (
            <>
              {/* 搜索和筛选控制 */}
              <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
                {/* 搜索框 */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索工具名称..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-8 w-48 rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleSearch}>
                    搜索
                  </Button>
                </div>
                
                {/* 分类筛选 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">分类：</span>
                  <Select value={categoryFilter ? categoryFilter.toString() : 'all'} onValueChange={handleCategoryFilter}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="全部分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 排序 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">排序：</span>
                  <Select value={sortField} onValueChange={handleSortFieldChange}>
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={toggleSortOrder}
                    title={sortOrder === 'asc' ? '升序' : '降序'}
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 工具列表 */}
              <div className="space-y-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        <Badge
                          variant={
                            tool.status === 'approved'
                              ? 'default'
                              : tool.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {tool.status === 'approved'
                            ? '已通过'
                            : tool.status === 'pending'
                            ? '待审核'
                            : '已拒绝'}
                        </Badge>
                        {tool.is_featured && (
                          <Badge variant="outline">精选</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {tool.description}
                      </p>
                      
                      {/* 统计数据行 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="浏览量">
                          <Eye className="h-3 w-3" />
                          {tool.view_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1" title="收藏量">
                          <Heart className="h-3 w-3" />
                          {tool.favorite_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1" title="评论量">
                          <MessageCircle className="h-3 w-3" />
                          {tool.comment_count.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground/60">|</span>
                        <span>{formatRelativeTime(tool.created_at)}</span>
                        {tool.category && <span>{tool.category.name}</span>}
                      </div>
                      
                      {tool.reject_reason && (
                        <p className="text-sm text-red-500 mt-1">
                          拒绝原因：{tool.reject_reason}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* 查看按钮 */}
                      <Button variant="ghost" size="sm" asChild title="查看详情">
                        <Link href={`/tools/${tool.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* 编辑按钮 */}
                      <Button variant="ghost" size="sm" asChild title="编辑">
                        <Link href={`/publisher/tools/${tool.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* 管理员审批按钮 */}
                      {isAdmin && (
                        <>
                          {/* 待审核 -> 通过/拒绝 */}
                          {tool.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openApproveDialog(tool, 'approved')}
                                title="通过"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openApproveDialog(tool, 'rejected')}
                                title="拒绝"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* 已通过 -> 拒绝/待审核 */}
                          {tool.status === 'approved' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openApproveDialog(tool, 'rejected')}
                                title="拒绝"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => openApproveDialog(tool, 'pending')}
                                title="改为待审核"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* 已拒绝 -> 通过/待审核 */}
                          {tool.status === 'rejected' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openApproveDialog(tool, 'approved')}
                                title="通过"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => openApproveDialog(tool, 'pending')}
                                title="改为待审核"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      
                      {/* 删除按钮 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(tool.id)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页控制 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>共 {totalItems} 条记录</span>
                  <span>，每页</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>条</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    <span className="text-sm">第</span>
                    <span className="font-medium">{currentPage}</span>
                    <span className="text-sm">/ {totalPages} 页</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {statusFilter ? `暂无${STATUS_LABELS[statusFilter]}的工具` : '您还没有发布任何工具'}
              </p>
              {statusFilter ? (
                <Button variant="outline" onClick={clearFilter}>
                  查看全部工具
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/publisher/tools/new">
                    <Plus className="mr-2 h-4 w-4" />
                    发布第一个工具
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 审批确认对话框 */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'approved' && '审批通过'}
              {newStatus === 'rejected' && '拒绝工具'}
              {newStatus === 'pending' && '改为待审核'}
            </DialogTitle>
            <DialogDescription>
              {selectedTool && (
                <span>
                  工具名称：<strong>{selectedTool.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {newStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejectReason">拒绝原因 *</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="请填写拒绝原因，将反馈给发布者..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}
            
            {newStatus === 'approved' && (
              <p className="text-sm text-muted-foreground">
                确定要通过该工具的审批吗？通过后工具将在平台上展示。
              </p>
            )}
            
            {newStatus === 'pending' && (
              <p className="text-sm text-muted-foreground">
                确定将该工具改为待审核状态吗？
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              variant={newStatus === 'rejected' ? 'destructive' : 'default'}
              onClick={handleApprove}
              disabled={submitting || (newStatus === 'rejected' && !rejectReason.trim())}
            >
              {submitting ? '处理中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
