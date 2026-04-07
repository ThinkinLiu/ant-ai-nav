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
import { formatRelativeTime } from '@/lib/utils'
import { Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ExternalLink, Filter, Check, XCircle, Clock, Search, X } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

const categoryOptions = [
  { value: 'industry', label: '行业动态' },
  { value: 'research', label: '学术研究' },
  { value: 'product', label: '产品发布' },
  { value: 'tutorial', label: '教程指南' },
  { value: 'other', label: '其他' },
]

interface News {
  id: number
  title: string
  slug: string
  summary: string
  status: string
  view_count: number
  created_at: string
  is_featured: boolean
  is_hot: boolean
  reject_reason: string | null
  category: string | string[]
  tags: string[]
  author_id: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

type SortField = 'created_at' | 'view_count'
type SortOrder = 'asc' | 'desc'
type StatusFilter = '' | 'pending' | 'approved' | 'rejected'
type CategoryFilter = '' | string

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: '发布时间' },
  { value: 'view_count', label: '浏览量' },
]

const STATUS_LABELS: Record<StatusFilter, string> = {
  '': '全部',
  'pending': '待审核',
  'approved': '已通过',
  'rejected': '已拒绝',
}

const CATEGORY_LABELS: Record<string, string> = {
  'industry': '行业动态',
  'research': '学术研究',
  'product': '产品发布',
  'tutorial': '教程指南',
  'blog': '博客',
  'policy': '政策',
  'other': '其他',
}

export default function PublisherNews() {
  const { user, token } = useAuth()
  const { confirm, ConfirmDialog } = useConfirm()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  
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
  const [searchInput, setSearchInput] = useState('')

  // 审批对话框状态
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('approved')
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin'

  // 获取统计数据
  const fetchStats = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/publisher/news-stats?publisherId=${user.id}`, {
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

  // 获取资讯列表（带分页、排序、状态筛选、搜索和分类过滤）
  const fetchMyNews = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
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
        params.append('category', categoryFilter)
      }
      
      // 如果有搜索关键词，添加到参数中
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // 管理员可以看到所有资讯，普通发布者只能看到自己的
      const paramsString = params.toString()
      const endpoint = isAdmin 
        ? `/api/news?${paramsString}` 
        : `/api/news?authorId=${user.id}&${paramsString}`

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setNews(data.data.data)
        setTotalItems(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (user && token) {
      fetchStats()
    }
  }, [user, token])

  // 分页、排序或筛选变化时重新获取数据
  useEffect(() => {
    if (user && token) {
      fetchMyNews()
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
  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category === 'all' ? '' : category)
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
  const openApproveDialog = (news: News, targetStatus: 'pending' | 'approved' | 'rejected') => {
    setSelectedNews(news)
    setNewStatus(targetStatus)
    setRejectReason(news.reject_reason || '')
    setApproveDialogOpen(true)
  }

  // 提交审批
  const handleApprove = async () => {
    if (!selectedNews) return
    
    // 如果是拒绝，必须填写原因
    if (newStatus === 'rejected' && !rejectReason.trim()) {
      toast.error('请填写拒绝原因')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/news/${selectedNews.id}/review`, {
        method: 'POST', // 修改为 POST 方法
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          rejectReason: newStatus === 'rejected' ? rejectReason : undefined,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('操作成功')
        setApproveDialogOpen(false)
        fetchStats()
        fetchMyNews()
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
      description: '确定要删除这条资讯吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchStats()
        fetchMyNews()
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  if (loading && news.length === 0) {
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
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? 'AI资讯管理' : '我的资讯'}</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? '管理平台所有AI资讯' : '管理和发布您的AI资讯'}
          </p>
        </div>
        <Button asChild>
          <Link href="/publisher/news/new">
            <Plus className="mr-2 h-4 w-4" />
            发布新资讯
          </Link>
        </Button>
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

      {/* News List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            资讯列表
            {(statusFilter || categoryFilter || searchQuery) && (
              <Badge variant="secondary" className="font-normal">
                <Filter className="h-3 w-3 mr-1" />
                {statusFilter && STATUS_LABELS[statusFilter]}
                {categoryFilter && ` · ${CATEGORY_LABELS[categoryFilter]}`}
                {searchQuery && ` · "${searchQuery}"`}
                <button onClick={clearFilter} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {news.length > 0 ? (
            <>
              {/* 搜索和筛选控制 */}
              <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
                {/* 搜索框 */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索资讯标题..."
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
                  <Select value={categoryFilter || 'all'} onValueChange={handleCategoryFilter}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="全部分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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

              {/* 资讯列表 */}
              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <Badge
                          variant={
                            item.status === 'approved'
                              ? 'default'
                              : item.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {item.status === 'approved'
                            ? '已通过'
                            : item.status === 'pending'
                            ? '待审核'
                            : '已拒绝'}
                        </Badge>
                        {item.is_featured && (
                          <Badge variant="outline">推荐</Badge>
                        )}
                        {item.is_hot && (
                          <Badge variant="destructive">热门</Badge>
                        )}
                        {item.category && (
                          <>
                            {Array.isArray(item.category) ? (
                              item.category.map((c, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {CATEGORY_LABELS[c] || c}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[item.category] || item.category}
                              </Badge>
                            )}
                          </>
                        )}
                        {Array.isArray(item.tags) && item.tags.length > 0 && item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.summary}
                      </p>
                      
                      {/* 统计数据行 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="浏览量">
                          <Eye className="h-3 w-3" />
                          {item.view_count.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground/60">|</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                      </div>
                      
                      {item.reject_reason && (
                        <p className="text-sm text-red-500 mt-1">
                          拒绝原因：{item.reject_reason}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      {/* 查看前端按钮 */}
                      {item.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="查看前端页面"
                        >
                          <Link href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      
                      {/* 编辑按钮 */}
                      <Button variant="ghost" size="sm" asChild title="编辑">
                        <Link href={`/publisher/news/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* 管理员审批按钮 */}
                      {isAdmin && (
                        <>
                          {/* 待审核 -> 通过/拒绝 */}
                          {item.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openApproveDialog(item, 'approved')}
                                title="通过"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openApproveDialog(item, 'rejected')}
                                title="拒绝"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* 已通过 -> 拒绝/待审核 */}
                          {item.status === 'approved' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openApproveDialog(item, 'rejected')}
                                title="拒绝"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => openApproveDialog(item, 'pending')}
                                title="改为待审核"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* 已拒绝 -> 通过/待审核 */}
                          {item.status === 'rejected' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openApproveDialog(item, 'approved')}
                                title="通过"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => openApproveDialog(item, 'pending')}
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
                        onClick={() => handleDelete(item.id)}
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
                {statusFilter ? `暂无${STATUS_LABELS[statusFilter]}的资讯` : '您还没有发布任何资讯'}
              </p>
              {statusFilter ? (
                <Button variant="outline" onClick={clearFilter}>
                  查看全部资讯
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/publisher/news/new">
                    <Plus className="mr-2 h-4 w-4" />
                    发布第一条资讯
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
              {newStatus === 'rejected' && '拒绝资讯'}
              {newStatus === 'pending' && '改为待审核'}
            </DialogTitle>
            <DialogDescription>
              {selectedNews && (
                <span>
                  资讯标题：<strong>{selectedNews.title}</strong>
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
                确定要通过该资讯的审批吗？通过后资讯将在平台上展示。
              </p>
            )}
            
            {newStatus === 'pending' && (
              <p className="text-sm text-muted-foreground">
                确定将该资讯改为待审核状态吗？
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
