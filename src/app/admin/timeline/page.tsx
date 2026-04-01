'use client'

import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Sparkles, Loader2, Calendar, AlertCircle } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

const categoryConfig = {
  breakthrough: { label: '技术突破', icon: '💡' },
  product: { label: '产品发布', icon: '🚀' },
  research: { label: '学术研究', icon: '🔬' },
  organization: { label: '组织事件', icon: '🏢' },
  other: { label: '其他', icon: '📌' },
}

const importanceConfig = {
  landmark: { label: '里程碑', color: 'bg-yellow-500' },
  important: { label: '重要事件', color: 'bg-blue-500' },
  normal: { label: '普通事件', color: 'bg-gray-500' },
}

interface TimelineEvent {
  year: number
  month: number
  day: number
  title: string
  titleEn: string
  description: string
  category: string
  importance: string
  icon: string
  image: string
  relatedUrl: string
  tags: string[]
}

export default function TimelineManagementPage() {
  const router = useRouter()
  const { confirm, ConfirmDialog } = useConfirm()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
    importance: '',
    search: '',
  })

  // 自动生成相关状态
  const [autoGenerateOpen, setAutoGenerateOpen] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [searchResults, setSearchResults] = useState<TimelineEvent[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string; startFormatted: string; endFormatted: string } | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [page, filters])

  // 设置默认截止日期为今天
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setEndDate(today)
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.importance && { importance: filters.importance }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/timeline?${params}`)
      const result = await response.json()

      if (result.success) {
        setEvents(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取大事纪列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除确认',
      description: '确定要删除这个事件吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchEvents()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  // 自动生成AI大事件
  const handleAutoGenerate = async () => {
    if (!endDate) {
      toast.error('请输入截止日期')
      return
    }

    setGenerating(true)
    setSelectedItems(new Set())
    setSearchResults([])

    try {
      const response = await fetch('/api/admin/timeline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate }),
      })

      const result = await response.json()

      if (result.success) {
        setDateRange(result.dateRange)
        setSearchResults(result.data)
        if (result.data.length === 0) {
          toast.info(result.message || '未找到新的AI大事件')
        } else {
          toast.success(result.message)
        }
      } else {
        toast.error(result.error || '生成失败')
      }
    } catch (error) {
      console.error('生成失败:', error)
      toast.error('生成失败，请稍后重试')
    } finally {
      setGenerating(false)
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

  // 导入选中的事件
  const handleImport = async () => {
    if (selectedItems.size === 0) {
      toast.error('请选择要导入的事件')
      return
    }

    setImporting(true)

    try {
      const itemsToImport = Array.from(selectedItems).map((index) => searchResults[index])

      const response = await fetch('/api/admin/timeline/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: itemsToImport }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`成功导入 ${result.data.importedCount} 条事件`)
        if (result.data.errors && result.data.errors.length > 0) {
          toast.warning(`部分导入存在问题:\n${result.data.errors.slice(0, 3).join('\n')}`)
        }
        setAutoGenerateOpen(false)
        setSearchResults([])
        setSelectedItems(new Set())
        fetchEvents()
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

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI大事纪管理</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setAutoGenerateOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                自动生成
              </Button>
              <Button asChild>
                <Link href="/admin/timeline/new">
                  <Plus className="mr-2 h-4 w-4" />
                  新增事件
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
                  placeholder="搜索标题或描述..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {Object.entries(categoryConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.icon} {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.importance}
              onValueChange={(value) => setFilters({ ...filters, importance: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="重要性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(importanceConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年份</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>重要性</TableHead>
                <TableHead>浏览</TableHead>
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
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.year}
                      {event.month && `.${event.month}`}
                      {event.day && `.${event.day}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.title_en && (
                          <div className="text-sm text-muted-foreground">{event.title_en}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.category && categoryConfig[event.category as keyof typeof categoryConfig] && (
                        <span>
                          {categoryConfig[event.category as keyof typeof categoryConfig].icon}{' '}
                          {categoryConfig[event.category as keyof typeof categoryConfig].label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.importance && importanceConfig[event.importance as keyof typeof importanceConfig] && (
                        <Badge className={importanceConfig[event.importance as keyof typeof importanceConfig].color}>
                          {importanceConfig[event.importance as keyof typeof importanceConfig].label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{event.view_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/timeline/${event.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(event.id)}
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

      {/* 自动生成对话框 */}
      <Dialog open={autoGenerateOpen} onOpenChange={setAutoGenerateOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              自动生成AI大事纪
            </DialogTitle>
            <DialogDescription>
              输入截止日期，系统将自动搜索已有数据截止日期到本次截止日期之间的AI大事件
            </DialogDescription>
          </DialogHeader>

          {/* 日期输入区域 */}
          <div className="flex gap-3 py-4 border-b items-center">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">截止日期：</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleAutoGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              搜索
            </Button>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">筛选标准</p>
              <ul className="mt-1 text-xs space-y-1 text-amber-700">
                <li>• 事件必须真实发生，有可靠公开报道</li>
                <li>• 对AI行业产生重大影响或推动作用</li>
                <li>• 时间准确，日期在指定范围内</li>
                <li>• 仅保留里程碑或重要事件</li>
              </ul>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="flex-1 overflow-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {/* 时间范围和全选操作栏 */}
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
                  <div className="flex items-center gap-2">
                    {dateRange && (
                      <span className="text-xs text-muted-foreground">
                        搜索范围：{dateRange.startFormatted} ~ {dateRange.endFormatted}
                      </span>
                    )}
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
                </div>

                {/* 结果列表 */}
                {searchResults.map((event, index) => (
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
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{event.icon}</span>
                          <span className="font-medium text-sm">{event.year}-{String(event.month).padStart(2, '0')}-{String(event.day).padStart(2, '0')}</span>
                          <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {categoryConfig[event.category as keyof typeof categoryConfig]?.icon}{' '}
                            {categoryConfig[event.category as keyof typeof categoryConfig]?.label}
                          </Badge>
                          <Badge className={importanceConfig[event.importance as keyof typeof importanceConfig]?.color}>
                            {importanceConfig[event.importance as keyof typeof importanceConfig]?.label}
                          </Badge>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex gap-1">
                              {event.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">正在搜索并生成AI大事件...</p>
                <p className="mt-1 text-xs text-muted-foreground/70">这可能需要几秒钟，请耐心等待</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  输入截止日期后点击搜索按钮
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  系统将自动搜索从已有数据最新日期到截止日期之间的AI大事件
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
