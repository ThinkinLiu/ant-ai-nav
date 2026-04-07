'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Eye, Check, X, Sparkles, Loader2, AlertTriangle, Flame, Pin } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useConfirm } from '@/hooks/use-confirm'

const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-500' },
  pending: { label: '待审核', color: 'bg-yellow-500' },
  approved: { label: '已发布', color: 'bg-green-500' },
  rejected: { label: '已拒绝', color: 'bg-red-500' },
}

// 资讯分类配置（从API动态获取）

// 搜索结果项类型
interface SearchNewsItem {
  title: string
  title_en: string
  summary: string
  content: string
  source: string
  source_url: string
  author: string
  category: string
  tags: string[]
  cover_image: string
  is_featured: boolean
  is_hot: boolean
  view_count: number
  like_count: number
  published_at: string
}

export default function NewsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { confirm, ConfirmDialog } = useConfirm()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; newsCount: number }>>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
  })

  // 自动发布相关状态
  const [autoPublishOpen, setAutoPublishOpen] = useState(false)
  const [publishDate, setPublishDate] = useState(() => {
    // 默认使用今天日期
    return format(new Date(), 'yyyy-MM-dd')
  })
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchNewsItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)

  // 审核相关状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewingNews, setReviewingNews] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')
  const [rejectReason, setRejectReason] = useState('')
  const [reviewing, setReviewing] = useState(false)

  // 批量选择审核
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<number>>(new Set())

  // 获取分类配置
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/news-categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data.map((cat: any) => ({
          slug: cat.slug,
          name: cat.name,
          newsCount: cat.newsCount || 0,
        })))
      }
    } catch (error) {
      console.error('获取分类配置失败:', error)
    }
  }

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'publisher')) {
      fetchCategories()
      fetchNews()
    }
  }, [user, page, filters])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(user?.role === 'publisher' && { authorId: user.id }),
      })

      const response = await fetch(`/api/news?${params}`)
      const result = await response.json()

      if (result.success) {
        setNews(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleHot = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/news/${id}/toggle-hot`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.success) {
        toast.success(currentStatus ? '已取消热门' : '已设为热门')
        fetchNews()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  const handleTogglePinned = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/news/${id}/toggle-featured`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.success) {
        toast.success(currentStatus ? '已取消推荐' : '已设为推荐')
        fetchNews()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
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
      })

      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchNews()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleReview = async () => {
    if (!reviewingNews) return
    setReviewing(true)

    try {
      const response = await fetch(`/api/news/${reviewingNews.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewAction,
          rejectReason: reviewAction === 'rejected' ? rejectReason : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(reviewAction === 'approved' ? '审核通过' : '已拒绝')
        setReviewDialogOpen(false)
        setReviewingNews(null)
        setRejectReason('')
        fetchNews()
      } else {
        toast.error(result.error || '审核失败')
      }
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('审核失败')
    } finally {
      setReviewing(false)
    }
  }

  // 打开审核弹窗
  const openReviewDialog = (item: any, action: 'approved' | 'rejected') => {
    setReviewingNews(item)
    setReviewAction(action)
    setRejectReason('')
    setReviewDialogOpen(true)
  }

  // 批量审核通过
  const handleBatchApprove = async () => {
    if (batchSelectedIds.size === 0) {
      toast.error('请选择要审核的资讯')
      return
    }

    const confirmed = await confirm({
      title: '批量审核',
      description: `确定要通过选中的 ${batchSelectedIds.size} 条资讯吗？`,
      confirmText: '通过',
    })

    if (!confirmed) return

    let successCount = 0
    let failCount = 0

    for (const id of batchSelectedIds) {
      try {
        const response = await fetch(`/api/news/${id}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        })
        const result = await response.json()
        if (result.success) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }

    if (successCount > 0) {
      toast.success(`成功审核 ${successCount} 条资讯`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} 条审核失败`)
    }
    setBatchSelectedIds(new Set())
    fetchNews()
  }

  // 切换批量选择
  const toggleBatchSelect = (id: number) => {
    const newSelected = new Set(batchSelectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setBatchSelectedIds(newSelected)
  }

  // 全选/取消全选（仅待审核）
  const toggleBatchSelectAll = () => {
    const pendingNews = news.filter(n => n.status === 'pending')
    if (batchSelectedIds.size === pendingNews.length) {
      setBatchSelectedIds(new Set())
    } else {
      setBatchSelectedIds(new Set(pendingNews.map(n => n.id)))
    }
  }

  // 搜索AI资讯
  const handleSearchNews = async () => {
    if (!publishDate) {
      toast.error('请选择发布日期')
      return
    }

    setSearching(true)
    setSelectedItems(new Set())

    try {
      const response = await fetch('/api/admin/news/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishDate,
          count: 20,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setSearchResults(result.data)
        if (result.data.length === 0) {
          toast.info('未找到相关资讯')
        } else {
          toast.success(`找到 ${result.data.length} 条相关资讯`)
        }
      } else {
        toast.error(result.error || '搜索失败')
        setSearchResults([])
      }
    } catch (error) {
      console.error('搜索失败:', error)
      toast.error('搜索失败，请稍后重试')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // 切换选中状态
  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.size === searchResults.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(searchResults.map((_, i) => i)))
    }
  }

  // 导入选中的资讯
  const handleImport = async () => {
    if (selectedItems.size === 0) {
      toast.error('请选择要导入的资讯')
      return
    }

    setImporting(true)

    try {
      const itemsToImport = Array.from(selectedItems).map((index) => searchResults[index])

      const response = await fetch('/api/admin/news/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsItems: itemsToImport }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`成功导入 ${result.data.importedCount} 条资讯`)
        if (result.data.errors && result.data.errors.length > 0) {
          toast.warning(`部分导入存在问题:\n${result.data.errors.slice(0, 3).join('\n')}`)
        }
        setAutoPublishOpen(false)
        setSearchResults([])
        setSelectedItems(new Set())
        fetchNews()
      } else {
        toast.error(result.error || '导入失败')
      }
    } catch (error) {
      console.error('导入失败:', error)
      toast.error('导入失败，请稍后重试')
    } finally {
      setImporting(false)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'publisher')) {
    return null
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI资讯管理</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/news" target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  查看前端
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setAutoPublishOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                自动发布
              </Button>
              <Button asChild>
                <Link href="/admin/news/new">
                  <Plus className="mr-2 h-4 w-4" />
                  新建资讯
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标题或摘要..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类 ({total})</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name} ({cat.newsCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          {/* 批量审核操作栏 */}
          {user.role === 'admin' && news.some(n => n.status === 'pending') && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                checked={batchSelectedIds.size === news.filter(n => n.status === 'pending').length && batchSelectedIds.size > 0}
                onCheckedChange={toggleBatchSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                已选择 {batchSelectedIds.size} 条待审核资讯
              </span>
              {batchSelectedIds.size > 0 && (
                <Button size="sm" onClick={handleBatchApprove}>
                  <Check className="mr-2 h-4 w-4" />
                  批量通过
                </Button>
              )}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {user.role === 'admin' && <TableHead className="w-10"></TableHead>}
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>热门</TableHead>
                <TableHead>推荐</TableHead>
                <TableHead>浏览</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    {user.role === 'admin' && (
                      <TableCell>
                        {item.status === 'pending' && (
                          <Checkbox
                            checked={batchSelectedIds.has(item.id)}
                            onCheckedChange={() => toggleBatchSelect(item.id)}
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Link
                        href={`/news/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium max-w-[200px] truncate block hover:text-primary transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      {item.status === 'rejected' && item.reject_reason && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1 truncate max-w-[200px]" title={item.reject_reason}>
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">拒绝原因: {item.reject_reason}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.category ? (() => {
                        // 处理 category 字段可能是 JSON 数组或单个字符串的情况
                        let categoriesList: string[] = []
                        try {
                          const parsed = JSON.parse(item.category)
                          if (Array.isArray(parsed)) {
                            categoriesList = parsed
                          } else {
                            categoriesList = [parsed]
                          }
                        } catch {
                          categoriesList = [item.category]
                        }

                        // 查找分类名称并显示
                        const categoryItems = categoriesList
                          .map(catSlug => categories.find(c => c.slug === catSlug))
                          .filter(Boolean)
                          .map(cat => (
                            <Badge key={cat?.slug} variant="outline" className="text-xs">
                              {cat?.name}
                            </Badge>
                          ))

                        return categoryItems.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {categoryItems}
                          </div>
                        ) : '-'
                      })() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[item.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[item.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`p-1 ${item.is_hot ? 'text-orange-500' : 'text-muted-foreground'}`}
                        onClick={() => handleToggleHot(item.id, item.is_hot)}
                      >
                        <Flame className={`h-4 w-4 ${item.is_hot ? 'fill-current' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`p-1 ${item.is_featured ? 'text-purple-500' : 'text-muted-foreground'}`}
                        onClick={() => handleTogglePinned(item.id, item.is_featured)}
                      >
                        <Sparkles className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell>{item.view_count || 0}</TableCell>
                    <TableCell>
                      {item.published_at
                        ? format(new Date(item.published_at), 'yyyy-MM-dd', { locale: zhCN })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/news/${item.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.role === 'admin' && item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openReviewDialog(item, 'approved')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openReviewDialog(item, 'rejected')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/news/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
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

      {/* 自动发布对话框 */}
      <Dialog open={autoPublishOpen} onOpenChange={setAutoPublishOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              自动发布AI资讯
            </DialogTitle>
            <DialogDescription>
              选择发布日期，系统将自动搜索该日期相关的AI资讯
            </DialogDescription>
          </DialogHeader>

          {/* 搜索区域 */}
          <div className="flex gap-3 py-4 border-b">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">发布日期</label>
              <Input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearchNews} disabled={searching}>
                {searching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                搜索
              </Button>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="flex-1 overflow-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {/* 全选操作栏 */}
                <div className="flex items-center justify-between py-2 px-1 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItems.size === searchResults.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      已选择 {selectedItems.size} / {searchResults.length} 条
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleImport}
                    disabled={selectedItems.size === 0 || importing}
                  >
                    {importing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    导入选中
                  </Button>
                </div>

                {/* 结果列表 */}
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.has(index) ? 'bg-purple-50 border-purple-300' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSelect(index)}
                  >
                    <div className="flex gap-3">
                      <Checkbox
                        checked={selectedItems.has(index)}
                        onCheckedChange={() => toggleSelect(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-1.5 py-0.5 rounded">{item.source}</span>
                          <span>•</span>
                          <span>{item.published_at ? format(new Date(item.published_at), 'yyyy-MM-dd') : '未知时间'}</span>
                          {item.tags && item.tags.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex gap-1">
                                {item.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">正在搜索AI资讯...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  输入关键词搜索AI相关资讯
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  支持搜索最新AI行业动态、产品发布、技术进展等
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 审核弹窗 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? '审核通过' : '审核拒绝'}
            </DialogTitle>
            <DialogDescription>
              {reviewingNews && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{reviewingNews.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {reviewingNews.summary}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {reviewAction === 'rejected' && (
            <div className="space-y-2 py-4">
              <Label htmlFor="rejectReason">拒绝原因</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因，将通知作者..."
                rows={3}
              />
            </div>
          )}

          {reviewAction === 'approved' && (
            <p className="text-sm text-muted-foreground py-4">
              确定通过该资讯的审核吗？通过后将自动发布。
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewing}
            >
              取消
            </Button>
            <Button
              variant={reviewAction === 'approved' ? 'default' : 'destructive'}
              onClick={handleReview}
              disabled={reviewing || (reviewAction === 'rejected' && !rejectReason.trim())}
            >
              {reviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {reviewAction === 'approved' ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                </>
              )}
              {reviewAction === 'approved' ? '确认通过' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
